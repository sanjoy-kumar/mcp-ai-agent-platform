import { useState } from "react";
import API from "../services/api";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/user/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/chat");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2 className="login-title">🤖 MCP AI Agent Platform</h2>
        <p className="login-subtitle">Login to continue</p>

        {error && <div className="login-error">{error}</div>}

        <input
          className="login-input"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="login-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>

      </div>
    </div>
  );
}
