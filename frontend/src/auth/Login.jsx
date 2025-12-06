import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { saveToken } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        {/* EMAIL FIELD */}
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
              backgroundColor: "#fff",
              color: "#2d3748"
            }}
          />
        </div>

        {/* PASSWORD FIELD WITH EYE ICON */}
        <div style={{ marginBottom: "16px", position: "relative" }}>
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
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "12px 14px",
              paddingRight: "45px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "15px",
              backgroundColor: "#fff",
              color: "#2d3748"
            }}
          />

          {/* Eye Toggle Icon */}
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "14px",
              top: "42px",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#8e8e8e",
              userSelect: "none",
              display: "flex",
              alignItems: "center"
            }}
          >
            {showPassword ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </span>
        </div>

        {/* FORGOT PASSWORD */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "24px"
        }}>
          <a href="#" style={{
            color: "#667eea",
            fontWeight: "500",
            fontSize: "14px",
            textDecoration: "none"
          }}>
            Forgot password?
          </a>
        </div>

        {/* LOGIN BUTTON */}
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
            cursor: "pointer"
          }}
        >
          {isLoading ? "Signing in..." : "Log in"}
        </button>

        {/* SIGNUP LINK */}
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