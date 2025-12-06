import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Lobby() {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const navigate = useNavigate();

  useEffect(() => {
    if (!room) {
      alert("No room provided — redirecting to join page.");
      navigate("/join");
    }
  }, [room, navigate]);

  return (
    <div style={{
      fontFamily: "Inter, Arial",
      padding: "30px",
      background: "#0f0f10",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h1>Room Lobby</h1>
      
      <div style={{ width: "800px", maxWidth: "95%", display: "flex", gap: "30px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h2>Room: {room}</h2>
          <p style={{ color: "#9aa0a6", marginTop: "6px" }}>
            Choose which mode you want for this room. Both modes use the same room code.
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => navigate(`/explainer?room=${room}`)}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Code Explainer
          </button>
          <p style={{ color: "#9aa0a6", fontSize: "14px", margin: 0 }}>
            Open the Code Explainer view (explanations from Gemini).
          </p>

          <button
            onClick={() => navigate(`/collaboration?room=${room}`)}
            style={{
              background: "#333",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Code Collaboration
          </button>
          <p style={{ color: "#9aa0a6", fontSize: "14px", margin: 0 }}>
            Open the live collaboration view (editor + comments + realtime).
          </p>

          <button
            onClick={() => navigate("/join")}
            style={{
              background: "#444",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "18px"
            }}
          >
            Back to Join
          </button>
        </div>
      </div>
    </div>
  );
}