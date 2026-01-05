import React, { useState } from "react";
import axios from "axios";
import styles from "./TransactionByDate.module.css";

const TransactionFilter = () => {
  const [username, setUsername] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  const handleFilter = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/transactions/${username}/by-date`
      );
      setTransactions(response.data);
      setMessage("");
    } catch (error) {
      setTransactions([]);
      setMessage(error.response?.data?.detail || "Error fetching filtered transactions");
    }
  };

  return (
    <div className={styles.container}>
      <h3>Filter Transactions by Date</h3>

      {/* Username Input */}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
      />

      {/* Date Inputs */}
      <input
        type="text"
        placeholder="Start Time (YYYY-MM-DD HH:MM:SS)"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="End Time (YYYY-MM-DD HH:MM:SS)"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className={styles.input}
      />

      {/* Filter Button */}
      <button onClick={handleFilter} className={styles.button}>
        Filter
      </button>

      {/* Error Message */}
      {message && <p className={styles.message}>{message}</p>}

      {/* Display Filtered Transactions */}
      <ul className={styles.transactionList}>
        {transactions.map((transaction) => (
          <li key={transaction.id} className={styles.transactionItem}>
            <p>
              <strong>{transaction.transaction_type.toUpperCase()}</strong> {transaction.transaction_volume} of{" "}
              <strong>{transaction.ticker}</strong>
            </p>
            <p>Price: ${transaction.transaction_price}</p>
            <p>Time: {new Date(transaction.created_time).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionFilter;
