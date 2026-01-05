# 📈 Basic Stocks App

A full-stack stock Trading and Portfolio management application. This project allows users to view live cryptocurrency data, simulate trades, and track their portfolio performance in real-time.

##  Features

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
  - **Optimized Database Queries**: Holdings calculation uses SQL aggregation for O(1) performance capability.
  - **FastAPI**: High-performance backend framework.

- **🎨 Modern UI**:
  - Responsive React Frontend.
  - Clean and intuitive Dashboard.
  - Toast notifications for user feedback.

##  Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT & Passlib (Bcrypt)
- **Migrations**: Alembic

### Frontend
- **Framework**: React (Create React App)
- **Styling**: CSS Modules & Vanilla CSS (Tailwind removed for simplicity)
- **State Management**: React Context API (`AuthContext`)
- **HTTP Client**: Axios

##  Installation & Setup

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
    Create a `.env` file in the `backend` directory (or update `backend/config/config.py`):
    ```ini
    DATABASE_URL=postgresql://postgres:password@localhost:5432/stocks_db
    SECRET_KEY=your_secure_secret_key
    ALGORITHM=HS256
    ```

5.  **Run Migrations** (Initialize Database):
    ```bash
    alembic upgrade head
    ```

6.  **Start the Server**:
    Run from the project root directory:
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

## 📖 API Documentation

Once the backend is running, you can access the interactive API docs (Swagger UI) at:
- **URL**: `http://localhost:8000/docs`

### Key Endpoints
- `POST /register`: Create a new account.
- `POST /login`: Authenticate and receive a JWT.
- `GET /users/{username}`: Get profile and holdings (Protected).
- `POST /transactions`: Buy/Sell stocks (Protected).
- `GET /api/crypto/top20`: Fetch live crypto market data.

##  Security Notes
- Passwords are **never** stored in plain text.
- API restricts Cross-Origin Resource Sharing (CORS) to `http://localhost:3000` by default.
- Users must be logged in to perform trades.

##  License
This project is for educational purposes.
