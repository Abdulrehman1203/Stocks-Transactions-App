from fastapi import FastAPI

from starlette.middleware.cors import CORSMiddleware

from backend.routes import stock_routes, user_routes, transaction_routes

app = FastAPI()

origins = [
 "http://localhost:3000",
]
app.add_middleware(
 CORSMiddleware,
 allow_origins=origins,
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"],

)

app.include_router(user_routes.router)
app.include_router(stock_routes.router)
app.include_router(transaction_routes.router)


