import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./UserDetails.module.css";

const UserDetails = () => {
  const { username: urlUsername } = useParams();
  const { user: authUser, userData: globalUserData, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [localUserData, setLocalUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Use URL username or logged-in user's username
  const username = urlUsername || authUser?.username;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) {
        setMessage("Please login to view your details");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use global data if it matches the username, otherwise fetch
        let data;
        if (username === authUser?.username && globalUserData) {
          data = globalUserData;
        } else {
          const response = await axios.get(`http://localhost:8000/users/${username}`);
          data = response.data;

          // If this is the logged-in user, refresh the global context too
          if (username === authUser?.username && refreshUser) {
            refreshUser();
          }
        }
        setLocalUserData(data);

        // Fetch user's transactions
        try {
          const transResponse = await axios.get(`http://localhost:8000/transactions/${username}`);
          setTransactions(transResponse.data);

          // Calculate portfolio from transactions
          calculatePortfolio(transResponse.data);
        } catch (transError) {
          // No transactions is okay
          setTransactions([]);
          setPortfolio([]);
        }

        setMessage("");
      } catch (error) {
        setMessage(error.response?.data?.detail || "Failed to fetch user details");
        setLocalUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username, authUser?.username, globalUserData, refreshUser]);

  // Calculate portfolio holdings from transactions
  const calculatePortfolio = (transactions) => {
    const holdings = {};

    transactions.forEach((trans) => {
      const ticker = trans.ticker;
      if (!holdings[ticker]) {
        holdings[ticker] = { ticker, volume: 0, totalSpent: 0 };
      }

      if (trans.transaction_type?.toUpperCase() === "BUY") {
        holdings[ticker].volume += trans.transaction_volume;
        holdings[ticker].totalSpent += trans.transaction_price;
      } else if (trans.transaction_type?.toUpperCase() === "SELL") {
        holdings[ticker].volume -= trans.transaction_volume;
        holdings[ticker].totalSpent -= trans.transaction_price;
      }
    });

    // Filter out zero holdings and convert to array
    const portfolioArray = Object.values(holdings).filter(h => h.volume > 0);
    setPortfolio(portfolioArray);
  };

  if (!isAuthenticated && !urlUsername) {
    return (
      <div className={styles.container}>
        <h2>User Dashboard</h2>
        <div className={styles.notLoggedIn}>
          <p>You must be logged in to view your dashboard.</p>
          <button onClick={() => navigate("/login")} className={styles.button}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>User Dashboard</h2>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>User Dashboard</h2>

      {message && <p className={styles.errorMessage}>{message}</p>}

      {localUserData && (
        <>
          {/* User Info Card */}
          <div className={styles.userCard}>
            <div className={styles.userHeader}>
              <div className={styles.avatar}>
                {localUserData.username?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userMainInfo}>
                <h3>{localUserData.username}</h3>
                <p className={styles.userId}>User ID: #{localUserData.id}</p>
              </div>
            </div>
            <div className={styles.balanceSection}>
              <span className={styles.balanceLabel}>Available Balance</span>
              <span className={styles.balanceAmount}>
                ${localUserData.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className={styles.section}>
            <h3>📊 Portfolio Holdings</h3>
            {portfolio.length > 0 ? (
              <div className={styles.portfolioGrid}>
                {portfolio.map((holding) => (
                  <div key={holding.ticker} className={styles.holdingCard}>
                    <div className={styles.holdingTicker}>{holding.ticker}</div>
                    <div className={styles.holdingDetails}>
                      <p><strong>Volume:</strong> {holding.volume.toLocaleString()}</p>
                      <p><strong>Total Invested:</strong> ${holding.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p><strong>Avg Price:</strong> ${(holding.totalSpent / holding.volume).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No holdings yet. Start trading to build your portfolio!</p>
            )}
          </div>

          {/* Recent Transactions Section */}
          <div className={styles.section}>
            <h3>📈 Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div className={styles.transactionsList}>
                {transactions.slice(0, 5).map((trans) => (
                  <div key={trans.id} className={styles.transactionItem}>
                    <div className={`${styles.transType} ${trans.transaction_type?.toUpperCase() === "BUY" ? styles.buy : styles.sell}`}>
                      {trans.transaction_type?.toUpperCase()}
                    </div>
                    <div className={styles.transDetails}>
                      <strong>{trans.ticker}</strong>
                      <span>{trans.transaction_volume} units @ ${trans.transaction_price?.toLocaleString()}</span>
                    </div>
                    <div className={styles.transTime}>
                      {trans.created_time ? new Date(trans.created_time).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No transactions yet. Make your first trade!</p>
            )}
            {transactions.length > 5 && (
              <button
                onClick={() => navigate(`/transactions/${username}`)}
                className={styles.viewAllBtn}
              >
                View All Transactions →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetails;
