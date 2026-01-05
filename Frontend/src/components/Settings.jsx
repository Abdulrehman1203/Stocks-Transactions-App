import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, LogIn, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./Settings.module.css";

const Settings = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return (
            <motion.div
                className={styles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.notLoggedIn}>
                    <div className={styles.iconWrapper}>
                        <SettingsIcon size={48} />
                    </div>
                    <h2>Settings</h2>
                    <p>Please log in to access your account settings and preferences.</p>
                    <div className={styles.authButtons}>
                        <Link to="/login" className={styles.btnPrimary}>
                            <LogIn size={18} />
                            Login to Continue
                        </Link>
                        <Link to="/register" className={styles.btnSecondary}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your account preferences</p>

            <div className={styles.settingsGrid}>
                {/* Profile Settings */}
                <Link to={`/users/${user?.username}`} className={styles.settingCard}>
                    <div className={styles.settingIcon}>
                        <User size={24} />
                    </div>
                    <div className={styles.settingInfo}>
                        <h3>Profile</h3>
                        <p>View and edit your profile information</p>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
};

export default Settings;
