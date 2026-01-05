from backend.middleware.logs import logger
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from backend.models.users import Users
from backend.schemas.user_schema import UserCreate, UserResponse
from backend.database.db import get_db

router = APIRouter()


@router.get("/")
def index():
    return {"message": "<<<<< Welcome to the stock app >>>>>"}


from datetime import timedelta
from backend.common.security import get_password_hash, verify_password, create_access_token, get_current_user
from backend.config.config import settings
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

@router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"User registration attempt for: {user.username}")

    existing_user = db.query(Users).filter_by(username=user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    if user.balance <= 0:
        raise HTTPException(status_code=400, detail="Balance must be greater than zero")

    # Hash the password
    hashed_pwd = get_password_hash(user.password)

    new_user = Users(
        username=user.username,
        hashed_password=hashed_pwd,
        balance=user.balance
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "message": "User created successfully",
            "user_id": new_user.id,
            "username": new_user.username,
            "balance": new_user.balance
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while creating the user")


@router.post("/login", response_model=Token)
async def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(Users).filter_by(username=login_data.username).first()
    
    if not db_user or not verify_password(login_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "username": db_user.username
    }


from backend.models.transaction import Transaction
from backend.models.stock import Stocks

from sqlalchemy import func, case

@router.get("/users/{username}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(
    username: str, 
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    """
    Retrieves user details by username, including their calculated holdings.
    """
    # Authorization check
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized to view this profile")

    logger.info(f"Fetching full user data and holdings for: {username}")

    user = db.query(Users).filter(Users.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Optimized holdings calculation using SQL aggregation
    holdings_query = db.query(
        Stocks.ticker,
        func.sum(
            case(
                (Transaction.transaction_type == 'BUY', Transaction.transaction_volume),
                (Transaction.transaction_type == 'SELL', -Transaction.transaction_volume),
                else_=0
            )
        ).label("net_volume")
    ).join(Stocks, Stocks.id == Transaction.ticker_id)\
     .filter(Transaction.user_id == user.id)\
     .group_by(Stocks.ticker)
     
    results = holdings_query.all()
    
    # Create holdings dict, filtering out zero/negative balances
    holdings = {ticker: volume for ticker, volume in results if volume > 0}
    
    logger.info(f"Calculated holdings for {username}: {holdings}")

    return UserResponse(
        id=user.id, 
        username=user.username, 
        balance=user.balance,
        holdings=holdings
    )
