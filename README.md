# 📈 Stocks & Transactions App

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.68%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.0%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white)

A full-stack Stock Trading and Portfolio management application. This project enables users to view live cryptocurrency data via **CoinGecko**, simulate trades, and track portfolio performance with **O(1) aggregation efficiency**.

## 📸 Screenshots

| Dashboard | Portfolio |
|-----------|-----------|
| ![Dashboard](https://github.com/user-attachments/assets/eedee862-c246-4fe9-a295-f291901f832c)| ![Portfolio](https://github.com/user-attachments/assets/8ab6cf0a-48c3-42a0-a4fa-dc4ccacb0465) |

## 📂 Project Structure

```plaintext
├── backend/
│   ├── alembic/              # Database migrations
│   ├── common/               # Shared utilities (Security, Auth)
│   ├── config/               # Configuration & Environment variables
│   ├── database/             # DB connection & Session management
│   ├── models/               # SQLAlchemy Database Models
│   ├── routes/               # API Endpoints (Stocks, Users, Transactions)
│   ├── schemas/              # Pydantic Schemas for validation
│   └── scripts/              # Application entry point (run.py)
├── Frontend/
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # Reusable React components
│       ├── context/          # Global State (AuthContext)
│       └── pages/            # Page layouts
├── .gitignore
└── README.md
```

## 🚀 Features

- **🔐 Secure Authentication**: 
  - User registration with **bcrypt** password hashing.
  - Secure Login with **JWT (JSON Web Token)** authentication.
  - Protected routes ensuring users can only access their own data.

- **📊 Real-Time Market Data**:
  - Integration with **CoinGecko API** for live cryptocurrency prices.
  - Top 100 cryptocurrencies synced automatically for trading.

- **💰 Portfolio Management**:
  - **Buy & Sell**: Simulate transactions with real-time prices.
  - **Holdings Tracking**: Automatically calculated portfolio based on transaction history.
  - **Transaction History**: Detailed log of all past trades.
  - **Real-time Balance**: Dynamic updates to user balance after every trade.

- **⚡ High Performance**:
  - **Optimized Database Queries**: Holdings calculation uses SQL aggregation for **O(1)** performance capability.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT & Passlib (Bcrypt)

### Frontend
- **Framework**: React (Create React App)
- **Styling**: CSS Modules & Vanilla CSS
- **State Management**: React Context API (`AuthContext`)
- **HTTP Client**: Axios

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js & npm
- PostgreSQL

### 1. Backend Setup

1.  **Clone the repository** and navigate to the backend:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    python -m venv venv
    
    # Windows
    .\venv\Scripts\activate
    
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` directory. You can copy the example below:
    
    **File:** `backend/.env`
    ```ini
    DATABASE_URL=postgresql://postgres:password@localhost:5432/stocks_db
    SECRET_KEY=insert_generated_secret_key_here
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    ```

5.  **Run Migrations** (Initialize Database):
    ```bash
    alembic upgrade head
    ```

6.  **Start the Server**:
    Return to the **project root directory** to run the module correctly:
    ```bash
    cd ..
    python -m uvicorn backend.scripts.run:app --reload --port 8000
    ```

### 2. Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd Frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the React App**:
    ```bash
    npm start
    ```
    The app should open at `http://localhost:3000`.

## 📝 License
This project is for educational purposes.
