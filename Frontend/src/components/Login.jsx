import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", credentials);
      setMessage("Login successful!");
      setIsSuccess(true);

      // Store user and token in context
      login(response.data);

      // Redirect to home after 1 second
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Login failed";
      setMessage(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
      setIsSuccess(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          className={styles.input}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          className={styles.input}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <button type="submit" className={styles.button}>Login</button>
      </form>
      <p className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
        {message}
      </p>
    </div>
  );
};

export default Login;
