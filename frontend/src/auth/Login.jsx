// frontend/src/auth/Login.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function Login() {
  const { saveToken } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // Initialize Google button
  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          theme: "outline",
          size: "large",
          width: "340",
        }
      );
    }
  }, []);

  // Google login callback
  const handleGoogleResponse = async (response) => {
    const googleToken = response.credential;

    const res = await fetch("http://127.0.0.1:8000/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: googleToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert("Google login failed");
      return;
    }

    saveToken(data.token, data.user);
    window.location.href = "http://127.0.0.1:8000/frontend/join.html";
  };

  // Normal login
  const handleLogin = async () => {
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
    window.location.href = "/html/join.html";
};

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #e8fff3, #d4fce7)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "480px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "6px", color: "#0f5132" }}>
          Welcome back
        </h1>
        <p style={{ textAlign: "center", color: "#3d7a58", marginBottom: "20px" }}>
          Sign in to your account
        </p>

        {/* ⭐ Your screenshot preview image */}
        <img
          src="/images/login-preview.png"
          alt="preview"
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "22px",
            border: "1px solid #e4e4e4",
          }}
        />

        {/* Email */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: 600 }}>Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontWeight: 600 }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Remember + Forgot */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" style={{ color: "#1e8f55", fontWeight: 500 }}>
            Forgot your password?
          </a>
        </div>

        {/* Sign in button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: "#1e8f55",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign in
        </button>

        <div
          style={{
            textAlign: "center",
            margin: "18px 0",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          — Or continue with —
        </div>

        {/* ⭐ Google Sign-In Button */}
        <div
          id="googleSignInDiv"
          style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}
        ></div>

        {/* Signup link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          Don’t have an account?{" "}
          <a href="/signup" style={{ color: "#1e8f55", fontWeight: 600 }}>
            Sign up here
          </a>
        </div>

        {/* Load Google script */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </div>
    </div>
  );
}
