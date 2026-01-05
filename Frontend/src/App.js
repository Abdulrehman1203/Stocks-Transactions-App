import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  Settings as SettingsIcon,
  User,
  TrendingUp,
  TrendingDown,
  LogOut,
  Bell
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import Components
import StockForm from "./components/StockForm";
import Portfolio from "./components/Portfolio";
import StockDetails from "./components/StockDetails";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Register from "./components/Register";
import Login from "./components/Login";
import UserDetails from "./components/UserDetails";
import CryptoList from "./components/LiveStocks";
import Settings from "./components/Settings";

import "./index.css";

// Sidebar Component
const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, path: "/", label: "Dashboard" },
    { icon: BarChart3, path: "/stocks/live", label: "Markets" },
    { icon: ArrowLeftRight, path: "/create-transaction", label: "Trade" },
    { icon: Wallet, path: "/portfolio", label: "Portfolio" },
    { icon: SettingsIcon, path: "/settings", label: "Settings" },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link to="/">
        <motion.div
          className="sidebar-logo"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          title="Stock & Transaction App"
        >
          <span>S</span>
        </motion.div>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} title={item.label}>
              <motion.div
                className={`sidebar-icon ${isActive ? 'active' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={22} />
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Icon at Bottom */}
      {isAuthenticated && (
        <Link to="/users/me" title="Profile">
          <motion.div
            className="sidebar-icon"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={22} />
          </motion.div>
        </Link>
      )}
    </aside>
  );
};

// Header Component
const Header = () => {
  const { user, userData, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tickers = [
    { symbol: "BTC/USD", price: "92,631.00", change: 1.89, up: true },
    { symbol: "ETH/USD", price: "3,169.74", change: 1.04, up: true },
    { symbol: "XRP/USD", price: "2.12", change: -0.78, up: false },
  ];

  return (
    <header className="header">
      {/* Ticker Tape */}
      <div className="ticker-tape">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="ticker-item">
            <span className="ticker-symbol">{ticker.symbol}</span>
            <span className="ticker-price">${ticker.price}</span>
            <span className={`ticker-change ${ticker.up ? 'up' : 'down'}`}>
              {ticker.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {ticker.change > 0 ? '+' : ''}{ticker.change}%
            </span>
          </div>
        ))}
      </div>

      {/* Right Section */}
      <div className="header-right">
        {isAuthenticated ? (
          <>
            {/* Balance */}
            {userData && (
              <motion.div
                className="balance-pill"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Wallet size={18} />
                <span className="balance-amount">
                  ${userData.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </motion.div>
            )}

            {/* Notifications */}
            <button className="icon-btn">
              <Bell size={20} />
            </button>

            {/* User Menu */}
            <Link to={`/users/${user?.username}`} className="user-menu">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user?.username}</span>
            </Link>

            {/* Logout */}
            <button onClick={handleLogout} className="icon-btn logout">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-get-started">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  const { user, userData, isAuthenticated } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Welcome */}
      <h1 className="dashboard-title">
        {isAuthenticated ? `Welcome back, ${user?.username}` : 'Welcome to Stock & Transaction App'}
      </h1>
      <p className="dashboard-subtitle">
        {isAuthenticated
          ? 'Your portfolio is performing well today'
          : 'Manage your stocks and transactions with ease'}
      </p>

      {/* Stats Cards - Only when logged in */}
      {isAuthenticated && userData && (
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-header">
              <span className="stat-label">Available Balance</span>
              <Wallet size={20} className="stat-icon" />
            </div>
            <p className="stat-value">
              ${userData.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="stat-change">
              <TrendingUp size={14} /> Ready to trade
            </p>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-header">
              <span className="stat-label">Quick Status</span>
              <TrendingUp size={20} className="stat-icon" />
            </div>
            <p className="stat-value">Active</p>
            <p className="stat-change" style={{ color: 'var(--text-secondary)' }}>Account verified</p>
          </motion.div>
        </div>
      )}

      {/* Quick Actions - Only when logged in */}
      {isAuthenticated && (
        <div className="quick-actions">
          <Link to="/create-transaction" className="action-card">
            <div className="action-icon teal">
              <ArrowLeftRight size={24} />
            </div>
            <span className="action-label">Trade</span>
          </Link>
          <Link to={`/transactions/${user?.username}`} className="action-card">
            <div className="action-icon coral">
              <BarChart3 size={24} />
            </div>
            <span className="action-label">History</span>
          </Link>
          <Link to={`/users/${user?.username}`} className="action-card">
            <div className="action-icon teal">
              <User size={24} />
            </div>
            <span className="action-label">Profile</span>
          </Link>
          <Link to="/stocks/live" className="action-card">
            <div className="action-icon purple">
              <TrendingUp size={24} />
            </div>
            <span className="action-label">Markets</span>
          </Link>
        </div>
      )}

      {/* CTA - When not logged in */}
      {!isAuthenticated && (
        <motion.div
          className="cta-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="cta-title">Start Trading Today</h2>
          <p className="cta-description">
            Join and start managing your cryptocurrency portfolio with ease.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </motion.div>
      )}

      {/* Crypto List */}
      <CryptoList />
    </motion.div>
  );
};

// App Layout
const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/create-stock" element={<StockForm />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/stock/:ticker" element={<StockDetails />} />
              <Route path="/stocks/live" element={<CryptoList />} />
              <Route path="/create-transaction" element={<TransactionForm />} />
              <Route path="/transactions/:username" element={<TransactionList />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/users/:username" element={<UserDetails />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
