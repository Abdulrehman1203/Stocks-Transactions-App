import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Wallet, ArrowLeftRight, TrendingUp, History } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./StockList.module.css"; // We'll keep sharing styles for now or update it

const Portfolio = () => {
  const { user, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user?.username) return;

      setLoading(true);
      try {
        // Fetch user info (holdings, balance)
        const userRes = await axios.get(`http://localhost:8000/users/${user.username}`);
        setUserData(userRes.data);

        // Fetch user transactions
        try {
          const transRes = await axios.get(`http://localhost:8000/transactions/${user.username}`);
          setTransactions(transRes.data || []);
        } catch (transErr) {
          // If 404, it just means no transactions yet, which is fine
          if (transErr.response?.status === 404) {
            setTransactions([]);
          } else {
            throw transErr;
          }
        }
      } catch (err) {
        setError("Failed to load portfolio data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "80px 20px" }}>
        <Wallet size={48} color="var(--accent-buy)" style={{ marginBottom: "20px" }} />
        <h2>Portfolio Access Required</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Please log in to view your assets and transaction history.</p>
        <a href="/login" className={styles.detailsBtn} style={{ display: "inline-block" }}>Login to Portfolio</a>
      </div>
    );
  }

  if (loading) return <div className={styles.container}><p style={{ textAlign: "center" }}>Loading your portfolio...</p></div>;

  const totalTrades = transactions.length;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.header}>
        <h2>My Portfolio</h2>
        <span className={styles.countText}>Account: {user.username}</span>
      </div>

      {error && <p className={styles.message}>{error}</p>}

      {/* Stats Section moved from Home */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statIcon} style={{ background: "rgba(0, 229, 255, 0.1)", color: "var(--accent-buy)" }}>
            <ArrowLeftRight size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Trades</p>
            <p className={styles.statValue}>{totalTrades}</p>
          </div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statIcon} style={{ background: "rgba(255, 64, 129, 0.1)", color: "var(--accent-sell)" }}>
            <Wallet size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Available Balance</p>
            <p className={styles.statValue}>${userData?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className={styles.sectionTitle}>
        <TrendingUp size={20} />
        <h3>Current Holdings</h3>
      </div>

      <div className={styles.stockGrid}>
        {userData?.holdings && Object.keys(userData.holdings).length > 0 ? (
          Object.entries(userData.holdings).map(([ticker, amount]) => (
            amount > 0 && (
              <div key={ticker} className={styles.stockItem}>
                <div className={styles.coinHeader}>
                  <h3>{ticker}</h3>
                </div>
                <p className={styles.ticker}>{amount.toLocaleString()} Units</p>
                <div className={styles.holdingsAction}>
                  <Link to={`/stock/${ticker}`} className={styles.detailsBtn}>View Asset</Link>
                </div>
              </div>
            )
          ))
        ) : (
          <p className={styles.emptyText}>No assets held currently</p>
        )}
      </div>

      {/* Transactions Summary Section */}
      <div className={styles.sectionTitle} style={{ marginTop: "40px" }}>
        <History size={20} />
        <h3>Recent Transactions</h3>
      </div>

      <div className={styles.transList}>
        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((trans, idx) => (
            <div key={idx} className={styles.transItem}>
              <div className={styles.transLeft}>
                <span className={trans.transaction_type === "BUY" ? styles.buyTag : styles.sellTag}>
                  {trans.transaction_type}
                </span>
                <span className={styles.transTicker}>{trans.ticker}</span>
              </div>
              <div className={styles.transRight}>
                <span className={styles.transVolume}>{trans.transaction_volume} Units</span>
                <span className={styles.transDate}>
                  {trans.created_time ? new Date(trans.created_time).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyText}>No transactions yet</p>
        )}
        {transactions.length > 5 && (
          <Link to={`/transactions/${user.username}`} className={styles.viewMore}>View all transactions</Link>
        )}
      </div>
    </motion.div>
  );
};

export default Portfolio;
