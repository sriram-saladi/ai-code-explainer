import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Signup() {
  const { saveToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Signup failed");
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
            Create Account
          </h1>
          <p style={{
            color: "#718096",
            fontSize: "15px"
          }}>
            Sign up to get started
          </p>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={{
            display: "block",
            fontWeight: "600",
            fontSize: "14px",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div style={{ marginBottom: "18px" }}>
          <label style={{
            display: "block",
            fontWeight: "600",
            fontSize: "14px",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div style={{ marginBottom: "18px" }}>
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontWeight: "600",
            fontSize: "14px",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Retype password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSignup()}
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

        <button
          onClick={handleSignup}
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
          {isLoading ? "Creating account..." : "Create account"}
        </button>

        <div style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          color: "#718096"
        }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#667eea",
              fontWeight: "600",
              textDecoration: "none"
            }}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}