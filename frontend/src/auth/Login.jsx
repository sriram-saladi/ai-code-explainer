import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { saveToken } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Invalid credentials");
        return;
      }

      saveToken(data.token, data.user);
      navigate("/join");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <style>{`
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        width: "420px",
        background: "#ffffff",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)"
      }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a202c",
            marginBottom: "8px"
          }}>
            Welcome back
          </h1>
          <p style={{
            color: "#718096",
            fontSize: "15px"
          }}>
            Log in to your account
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontWeight: "600",
            fontSize: "14px",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "15px",
              transition: "all 0.2s ease",
              backgroundColor: "#fff",
              color: "#2d3748"
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontWeight: "600",
            fontSize: "14px",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "15px",
              transition: "all 0.2s ease",
              backgroundColor: "#fff",
              color: "#2d3748"
            }}
          />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            fontSize: "14px",
            color: "#4a5568"
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                marginRight: "8px",
                cursor: "pointer",
                accentColor: "#667eea"
              }}
            />
            Remember me
          </label>
          <a href="#" style={{
            color: "#667eea",
            fontWeight: "500",
            fontSize: "14px",
            textDecoration: "none"
          }}>
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            padding: "13px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          {isLoading ? "Signing in..." : "Log in"}
        </button>

        <div style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          color: "#718096"
        }}>
          Don't have an account?{" "}
          <a href="/signup" style={{
              color: "#667eea",
              fontWeight: "600",
              textDecoration: "none"
            }}>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}