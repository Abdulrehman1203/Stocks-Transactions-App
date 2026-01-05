import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./TransactionForm.module.css";

const TransactionForm = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState({
    username: "",
    ticker: "",
    transaction_type: "",
    transaction_volume: 1,
  });

  const [availableStocks, setAvailableStocks] = useState([]);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-fill username and sync stocks on mount
  useEffect(() => {
    if (isAuthenticated && user?.username) {
      setTransaction((prev) => ({ ...prev, username: user.username }));

      // Sync and fetch available stocks (top 100)
      const syncStocks = async () => {
        try {
          // Fetch more coins for the dropdown list
          const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
            params: { vs_currency: "usd", order: "market_cap_desc", per_page: 100, page: 1 }
          });
          setAvailableStocks(response.data || []);

          // Also trigger background sync in backend
          axios.get("http://localhost:8000/api/crypto/top20?sync=true");
        } catch (err) {
          console.error("Failed to fetch stock list:", err);
        }
      };
      syncStocks();
    }
  }, [isAuthenticated, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setMessage("Please login to create transactions");
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({
      ...prev,
      [name]: name === "transaction_volume" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("Processing transaction...");

    // Basic validation
    if (!transaction.ticker || !transaction.transaction_type || transaction.transaction_volume <= 0) {
      setMessage("Error: Please fill in all fields correctly.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    // Auto-uppercase ticker
    const transactionData = {
      ...transaction,
      ticker: transaction.ticker.toUpperCase()
    };

    try {
      const response = await axios.post("http://localhost:8000/transactions", transactionData);
      setMessage(`Transaction created successfully: ${response.data.transaction_type} ${response.data.transaction_volume} units of ${response.data.ticker}`);
      setIsSuccess(true);

      // Refresh global user data (balance)
      if (refreshUser) refreshUser();

      // Reset form (except username)
      setTransaction({
        username: user?.username || "",
        ticker: "",
        transaction_type: "",
        transaction_volume: 1,
      });
    } catch (error) {
      const errorDetail = error.response?.data?.detail;
      setMessage(`Error: ${errorDetail || error.message}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Transaction</h2>
      {!isAuthenticated ? (
        <div className={styles.notLoggedIn}>
          <p>You must be logged in to create transactions.</p>
          <button onClick={() => navigate("/login")} className={styles.button}>
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.userInfo}>
            <p>Creating transaction for: <strong>{user.username}</strong></p>
          </div>

          <label className={styles.label}>Ticker Symbol</label>
          <input
            type="text"
            name="ticker"
            placeholder="e.g. BTC, ETH, SUI"
            value={transaction.ticker}
            onChange={handleChange}
            className={styles.input}
            list="ticker-suggestions"
            autoComplete="off"
            required
          />
          <datalist id="ticker-suggestions">
            {availableStocks.map(stock => (
              <option key={stock.id} value={stock.symbol.toUpperCase()}>
                {stock.name}
              </option>
            ))}
          </datalist>

          <label className={styles.label}>Transaction Type</label>
          <select
            name="transaction_type"
            value={transaction.transaction_type}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select Type</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>

          <label className={styles.label}>Amount / Volume</label>
          <input
            type="number"
            name="transaction_volume"
            placeholder="Volume"
            value={transaction.transaction_volume}
            onChange={handleChange}
            className={styles.input}
            min="0.000001"
            step="any"
            required
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Processing..." : "Submit Transaction"}
          </button>
        </form>
      )}
      {message && (
        <p className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default TransactionForm;
