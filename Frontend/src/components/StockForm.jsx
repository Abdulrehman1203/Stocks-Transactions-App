import React, { useState } from "react";
import axios from "axios";
import styles from "./StockForm.module.css";

const StockForm = () => {
  const [stock, setStock] = useState({
    ticker: "",
    stock_name: "",
    stock_price: 0,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStock({
      ...stock,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/stocks/", stock);
      setMessage(`Stock ${response.data.stock_name} created successfully.`);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Stock</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="ticker"
          placeholder="Ticker"
          value={stock.ticker}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="stock_name"
          placeholder="Stock Name"
          value={stock.stock_name}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="number"
          name="stock_price"
          placeholder="Stock Price"
          value={stock.stock_price}
          onChange={handleChange}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default StockForm;
