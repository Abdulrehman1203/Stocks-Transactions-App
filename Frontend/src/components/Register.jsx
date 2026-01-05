import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", password: "", balance: 0 });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/register", formData);
      setMessage(response.data.message || "Registration successful! Redirecting to login...");
      setIsSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed");
      setIsSuccess(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          className={styles.input}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          className={styles.input}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <input
          type="number"
          placeholder="Initial Balance"
          value={formData.balance}
          className={styles.input}
          onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
        />
        <button type="submit" className={styles.button}>Register</button>
      </form>
      <p className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
        {message}
      </p>
      {!isSuccess && (
        <p className={styles.loginLink}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      )}
    </div>
  );
};

export default Register;
