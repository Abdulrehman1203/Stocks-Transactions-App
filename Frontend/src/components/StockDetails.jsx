import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StockDetails.module.css";
import { useParams } from "react-router-dom";

const StockDetails = () => {
  const { ticker } = useParams();
  const [stock, setStock] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/stocks/${ticker}`);
        setStock(response.data);
      } catch (error) {
        setMessage(`Error: ${error.response?.data?.detail || error.message}`);
      }
    };
    fetchStock();
  }, [ticker]);

  return (
    <div className={styles.container}>
      <h2>Stock Details</h2>
      {message && <p className={styles.message}>{message}</p>}
      {stock && (
        <div className={styles.stockDetails}>
          <p><strong>Ticker:</strong> {stock.ticker}</p>
          <p><strong>Name:</strong> {stock.stock_name}</p>
          <p><strong>Price:</strong> ${stock.stock_price}</p>
        </div>
      )}
    </div>
  );
};

export default StockDetails;
