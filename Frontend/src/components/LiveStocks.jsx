import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import styles from "./LiveStocks.module.css";

const BASE_URL = "http://localhost:8000/api/crypto/top20";

function CryptoList() {
  const [allCryptos, setAllCryptos] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 100,
              page: 1,
              sparkline: false,
            },
          }
        );
        setAllCryptos(response.data || []);

        try {
          await axios.get(`${BASE_URL}?vs_currency=usd&sync=true`);
        } catch (syncError) {
          console.log("Sync to backend failed");
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter based on search query
  const filteredCryptos = useMemo(() => {
    return allCryptos.filter(crypto =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allCryptos, searchQuery]);

  // Update current page if it's out of bounds after filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCryptos.length / itemsPerPage);

  const cryptoData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCryptos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCryptos, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className={styles.cryptoTableContainer}>
        <h1>Top Cryptocurrencies</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
          Loading cryptocurrencies...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.cryptoTableContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h1>Top Cryptocurrencies</h1>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages || 1} ({filteredCryptos.length} coins)
          </span>
        </div>

        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search coins (e.g. BTC, Sui)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {error ? (
        <p style={{ textAlign: 'center', color: 'var(--accent-sell)', padding: '40px' }}>
          Error: {error}
        </p>
      ) : filteredCryptos.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '80px' }}>
          No cryptocurrencies found matching "{searchQuery}"
        </p>
      ) : (
        <>
          <table className={styles.cryptoTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Ticker</th>
                <th>Price</th>
                <th>24hr %</th>
                <th>Market Cap</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {cryptoData.map((crypto, index) => (
                <motion.tr
                  key={crypto.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className={styles.rank}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td>
                    <div className={styles.cryptoName}>
                      <img
                        src={crypto.image}
                        alt={crypto.name || "crypto"}
                        className={styles.cryptoLogo}
                      />
                      {crypto.name || "N/A"}
                    </div>
                  </td>
                  <td className={styles.ticker}>{crypto.symbol?.toUpperCase() || "N/A"}</td>
                  <td className={styles.price}>${crypto.current_price?.toLocaleString() ?? "0"}</td>
                  <td
                    className={
                      (crypto.price_change_percentage_24h ?? 0) > 0
                        ? styles.positiveChange
                        : styles.negativeChange
                    }
                  >
                    {crypto.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                  </td>
                  <td>${crypto.market_cap?.toLocaleString() ?? "0"}</td>
                  <td>{crypto.total_volume?.toLocaleString() ?? "0"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (currentPage > 3 && totalPages > 5) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default CryptoList;
