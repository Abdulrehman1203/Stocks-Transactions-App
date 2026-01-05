import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./TransactionList.module.css";

const TransactionList = () => {
  const { username: urlUsername } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Determine the username to use (from URL or from logged-in user)
  const effectiveUsername = urlUsername && urlUsername !== ":username"
    ? urlUsername
    : (isAuthenticated ? user?.username : null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!effectiveUsername) {
        setMessage("Please login to view your transactions");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/transactions/${effectiveUsername}`);
        setTransactions(response.data);
        setMessage("");
      } catch (error) {
        setTransactions([]);
        const errorDetail = error.response?.data?.detail;
        if (typeof errorDetail === "string") {
          setMessage(errorDetail);
        } else if (Array.isArray(errorDetail)) {
          setMessage(errorDetail.map(e => e.msg).join(", "));
        } else {
          setMessage("Error fetching transactions");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [effectiveUsername]);

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h2>Transaction History</h2>
        <div className={styles.notLoggedIn}>
          <p>You must be logged in to view transactions.</p>
          <button onClick={() => navigate("/login")} className={styles.button}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Transaction History</h2>
      <p className={styles.userInfo}>
        Viewing transactions for: <strong>{effectiveUsername}</strong>
      </p>

      {isLoading && <p className={styles.loading}>Loading...</p>}

      {message && <p className={styles.message}>{message}</p>}

      {transactions.length === 0 && !message && !isLoading ? (
        <p className={styles.noTransactions}>No transactions found.</p>
      ) : (
        <ul className={styles.transactionList}>
          {transactions.map((transaction) => (
            <li key={transaction.id} className={styles.transactionItem}>
              <p>
                <strong className={transaction.transaction_type === "BUY" ? styles.buy : styles.sell}>
                  {transaction.transaction_type?.toUpperCase() || "N/A"}
                </strong>{" "}
                {transaction.transaction_volume || 0} of{" "}
                <strong>{transaction.ticker || "N/A"}</strong>
              </p>
              <p>Price: ${transaction.transaction_price || 0}</p>
              <p>Time: {transaction.created_time ? new Date(transaction.created_time).toLocaleString() : "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
