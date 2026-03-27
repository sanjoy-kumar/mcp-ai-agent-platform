import { useState } from "react";
import API from "../services/api";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
        setError("Invalid email");
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/user/register", {
        email,
        password
      });

      alert("Registered successfully! Please login.");
      navigate("/");

    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="auth-button"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="auth-footer">
          Already have an account? <a href="/">Login</a>
        </p>
      </div>

    </div>
  );
}

