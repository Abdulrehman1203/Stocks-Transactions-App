from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.middleware.logs import logger
from backend.models.transaction import Transaction
from backend.models.stock import Stocks
from backend.models.users import Users
from backend.schemas.transaction_schema import Transaction_create, TransactionResponse

router = APIRouter()


def calculate_user_holdings(db: Session, user_id: int, stock_id: int) -> int:
    """
    Calculate the user's current holdings for a specific stock.
    Returns the net number of units (BUY - SELL).
    """
    # Get all transactions for this user and stock
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.ticker_id == stock_id
    ).all()
    
    holdings = 0
    for trans in transactions:
        if trans.transaction_type.upper() == "BUY":
            holdings += trans.transaction_volume
        elif trans.transaction_type.upper() == "SELL":
            holdings -= trans.transaction_volume
    
    return max(0, holdings)  # Ensure non-negative


from backend.common.security import get_current_user

@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
        transaction: Transaction_create,
        db: Session = Depends(get_db),
        current_user: Users = Depends(get_current_user)
):
    """
    Creates a new transaction (buy/sell stocks), checks balance and holdings, updates accordingly.
    """
    if transaction.transaction_volume <= 0:
        raise HTTPException(status_code=400, detail="Volume must be greater than 0")

    if transaction.transaction_type.upper() not in ["BUY", "SELL"]:
        raise HTTPException(status_code=400, detail="Transaction type must be BUY or SELL")

    stock = db.query(Stocks).filter(Stocks.ticker == transaction.ticker.upper()).first()
    if not stock:
        # Ticker not in database, attempt to sync from crypto data first
        from backend.routes.stock_routes import fetch_crypto_data, sync_crypto_to_stocks
        logger.info(f"Ticker {transaction.ticker} not found, attempting auto-sync...")
        try:
            # Fetch 250 coins to be safe
            crypto_data = fetch_crypto_data("usd", count=250)
            sync_crypto_to_stocks(crypto_data, db)
            # Try finding it again
            stock = db.query(Stocks).filter(Stocks.ticker == transaction.ticker.upper()).first()
        except Exception as e:
            logger.error(f"Auto-sync failed: {str(e)}")
            
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock/Token '{transaction.ticker}' not found. Please ensure the ticker is correct.")

    # Use the authenticated user
    user = current_user

    transaction_price = stock.stock_price * transaction.transaction_volume

    if transaction.transaction_type.upper() == 'BUY':
        # Check if user has enough balance
        if user.balance < transaction_price:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        user.balance -= transaction_price
        
    elif transaction.transaction_type.upper() == 'SELL':
        # Calculate user's current holdings for this stock
        user_holdings = calculate_user_holdings(db, user.id, stock.id)
        
        if user_holdings < transaction.transaction_volume:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient holdings. You only have {user_holdings} units of {stock.ticker}"
            )
        
        user.balance += transaction_price

    logger.info(f"{transaction.transaction_type} Transaction is created for: {user.username}")

    new_transaction = Transaction(
        user_id=user.id,
        ticker_id=stock.id,
        transaction_price=transaction_price,
        transaction_volume=transaction.transaction_volume,
        transaction_type=transaction.transaction_type.upper()
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    response = TransactionResponse(
        id=new_transaction.id,
        transaction_volume=new_transaction.transaction_volume,
        transaction_type=new_transaction.transaction_type,
        transaction_price=new_transaction.transaction_price,
        created_time=new_transaction.created_time,
        username=user.username,
        ticker=stock.ticker
    )

    return response


@router.get("/transactions/{username}", response_model=list[TransactionResponse],
            status_code=status.HTTP_200_OK)
async def get_transactions_by_username(
    username: str, 
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    # Authorization check
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized to view these transactions")
        
    user = db.query(Users).filter(Users.username == username).first()
    logger.info(f"Fetching transactions data for user: {username}")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transactions = db.query(Transaction).filter(Transaction.user_id == user.id).all()

    if not transactions:
        # Return empty list instead of 404 to avoid frontend errors on empty history
        return []

    response = [
        TransactionResponse(
            id=transaction.id,
            transaction_volume=transaction.transaction_volume,
            transaction_type=transaction.transaction_type,
            transaction_price=transaction.transaction_price,
            created_time=transaction.created_time,
            username=user.username,
            ticker=transaction.ticker.ticker
        )
        for transaction in transactions
    ]

    return response


#
# @router.get("/transactions/{username}/{start_time}/{end_time}/", response_model=list[TransactionResponse])
# async def get_transactions_by_time(
#         username: str,
#         start_time: str,
#         end_time: str,
#         db: Session = Depends(get_db)):
#
#     user = db.query(Users).filter(Users.username == username).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#
#     try:
#         start_date = datetime.strptime(start_time, "%Y-%m-%d")
#         end_date = datetime.strptime(end_time, "%Y-%m-%d")
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
#
#     transactions = db.query(
#         Transaction,
#         Users.username,
#         Stocks.ticker
#     ).join(Users, Users.id == Transaction.user_id).join(Stocks, Stocks.id == Transaction.ticker_id).filter(
#         Transaction.user_id == user.id,
#         Transaction.created_time.between(start_date, end_date)
#     ).all()
#
#     if not transactions:
#         return JSONResponse(content={"message": "No transactions found"}, status_code=200)
#
#     response = [
#         {
#             "id": transaction.id,
#             "user_id": transaction.user_id,
#             "amount": transaction.amount,
#             "created_time": transaction.created_time,
#             "username": username,
#             "ticker": ticker
#         }
#         for transaction, username, ticker in transactions
#     ]
#     return response
