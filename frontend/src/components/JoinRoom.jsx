import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/create-room", {
        method: "POST"
      });
      const data = await res.json();
      setCode(data.room);
      setStatus(`✨ Room created: ${data.room}`);
    } catch (err) {
      setStatus("❌ Failed to create room — check backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!code.trim()) {
      setStatus("⚠️ Please enter a room code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/validate-room/${code}`);
      const data = await res.json();

      if (data.valid) {
        navigate(`/lobby?room=${code}`);
      } else {
        setStatus("❌ Invalid room code");
      }
    } catch (err) {
      setStatus("❌ Server error validating room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background circles */}
      <div style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        top: "-200px",
        left: "-200px",
        animation: "float 20s infinite ease-in-out"
      }} />
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        bottom: "-150px",
        right: "-150px",
        animation: "float 15s infinite ease-in-out reverse"
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(30px) translateX(30px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "48px",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        position: "relative",
        zIndex: 1,
        animation: "slideIn 0.6s ease-out"
      }}
      className="hover-lift">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            animation: "pulse 2s infinite"
          }}>
            🚪
          </div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px"
          }}>
            Room Access
          </h1>
          <p style={{
            color: "#6b7280",
            fontSize: "16px"
          }}>
            Create a new room or join an existing one
          </p>
        </div>

        {/* Create Room Button */}
        <button
          onClick={createRoom}
          disabled={isLoading}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            border: "none",
            padding: "16px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "24px",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
          }}
        >
          {isLoading ? "⏳ Creating..." : "✨ Create New Room"}
        </button>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          margin: "24px 0",
          color: "#9ca3af"
        }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ padding: "0 16px", fontSize: "14px", fontWeight: "500" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* Join Room Input */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px"
          }}>
            Room Code
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit room code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === "Enter" && joinRoom()}
            maxLength={6}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              fontSize: "16px",
              fontWeight: "500",
              textAlign: "center",
              letterSpacing: "2px",
              transition: "all 0.3s ease",
              background: "#f9fafb"
            }}
          />
        </div>

        {/* Join Button */}
        <button
          onClick={joinRoom}
          disabled={isLoading || !code.trim()}
          style={{
            width: "100%",
            background: "#fff",
            color: "#667eea",
            border: "2px solid #667eea",
            padding: "16px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          {isLoading ? "🔍 Validating..." : "🚀 Join Room"}
        </button>

        {/* Status Message */}
        {status && (
          <div style={{
            marginTop: "20px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: status.includes("❌") ? "#fee2e2" : 
                       status.includes("⚠️") ? "#fef3c7" : "#d1fae5",
            color: status.includes("❌") ? "#991b1b" : 
                   status.includes("⚠️") ? "#92400e" : "#065f46",
            fontSize: "14px",
            fontWeight: "500",
            textAlign: "center",
            animation: "slideIn 0.3s ease-out"
          }}>
            {status}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "14px"
        }}>
          <p style={{ margin: 0 }}>
            💡 <strong>Tip:</strong> Share the room code with your team to collaborate
          </p>
        </div>
      </div>
    </div>
  );
}