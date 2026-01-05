import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch full user data from backend
    const refreshUser = useCallback(async (username) => {
        const targetUsername = username || user?.username;
        if (!targetUsername) return;

        try {
            const response = await axios.get(`http://localhost:8000/users/${targetUsername}`);
            setUserData(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    }, [user?.username]);

    // On mount, check if user is stored in localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);

                // Set auth header if token exists
                if (parsedUser.access_token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.access_token}`;
                }

                await refreshUser(parsedUser.username);
            }
            setLoading(false);
        };
        initAuth();
    }, [refreshUser]);

    // Login function
    const login = async (data) => {
        // data contains access_token, token_type, username
        setUser(data);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(data));

        // Set auth header
        if (data.access_token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        }

        await refreshUser(data.username);
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
    };

    const value = {
        user,
        userData,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
