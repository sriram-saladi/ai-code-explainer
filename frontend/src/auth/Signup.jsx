// frontend/src/auth/Signup.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Signup() {
  const { saveToken } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

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

    // Save JWT token + user info
    saveToken(data.token, data.user);

    navigate("/lobby"); // redirect to home
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
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "6px",
            color: "#0f5132",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#3d7a58",
            marginBottom: "22px",
          }}
        >
          Signup to get started
        </p>

        {/* ========================= */}
        {/* Name */}
        {/* ========================= */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontWeight: 600 }}>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        {/* ========================= */}
        {/* Email */}
        {/* ========================= */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
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

        {/* ========================= */}
        {/* Password */}
        {/* ========================= */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontWeight: 600 }}>Password</label>
          <input
            type="password"
            placeholder="Create a password"
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

        {/* ========================= */}
        {/* Confirm Password */}
        {/* ========================= */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontWeight: 600 }}>Confirm Password</label>
          <input
            type="password"
            placeholder="Retype password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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

        {/* ========================= */}
        {/* Signup Button */}
        {/* ========================= */}
        <button
          onClick={handleSignup}
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
          Create account
        </button>

        {/* ========================= */}
        {/* Already have account */}
        {/* ========================= */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "#1e8f55", fontWeight: 600 }}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
