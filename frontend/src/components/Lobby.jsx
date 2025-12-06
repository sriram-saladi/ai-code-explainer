import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const [mounted, setMounted] = useState(false);
  const [room, setRoom] = useState("DEMO123");
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("room");
    if (code) setRoom(code);
  }, []);

  const handleNavigation = (mode) => {
    if (mode === "Code Explainer") {
      navigate(`/explainer?room=${room}`);
    } else if (mode === "Live Collaboration") {
      navigate(`/collaboration?room=${room}`);
    }
  };

  const goBack = () => {
    navigate("/join");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow circles */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          top: "-100px",
          left: "-100px",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          bottom: "-80px",
          right: "-80px",
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          width: "1000px",
          maxWidth: "95%",
          background: "#16161f",
          borderRadius: "24px",
          padding: "50px",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "rgba(79,172,254,0.1)",
              border: "1px solid rgba(79,172,254,0.2)",
              borderRadius: "100px",
              marginBottom: "20px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#4facfe",
              letterSpacing: "0.5px",
            }}
          >
            COLLABORATION WORKSPACE
          </div>

          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              marginBottom: "16px",
              background: "linear-gradient(90deg, #fff 0%, #4facfe 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Choose Your Mode
          </h1>

          <div style={{ marginBottom: "12px" }}>
            <span style={{ color: "#888", fontSize: "15px", marginRight: "10px" }}>
              Room Code
            </span>
            <code
              style={{
                padding: "6px 16px",
                background: "rgba(79,172,254,0.1)",
                border: "1px solid rgba(79,172,254,0.2)",
                borderRadius: "8px",
                color: "#4facfe",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {room}
            </code>
          </div>

          <p
            style={{
              color: "#999",
              fontSize: "14px",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: "1.5",
            }}
          >
            Select your preferred collaboration experience
          </p>
        </div>

        {/* Mode Cards */}
        <div
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            marginBottom: "40px",
          }}
        >
          <ModeCard
            icon="🤖"
            title="AI Code Explainer"
            subtitle="Powered by Gemini"
            description="Get instant AI-powered analysis and visualizations of your code."
            features={["Real-time insights", "Visual diagrams", "Smart suggestions"]}
            accentColor="#667eea"
            onClick={() => handleNavigation("Code Explainer")}
          />

          <ModeCard
            icon="👥"
            title="Live Collaboration"
            subtitle="Real-time sync"
            description="Work together with synced editing, live cursors & comments."
            features={["Multi-user editing", "Live presence", "Instant sync"]}
            accentColor="#f5576c"
            onClick={() => handleNavigation("Live Collaboration")}
          />
        </div>

        {/* Footer Back Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "30px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={goBack}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              color: "#bbb",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Back to Join
          </button>
        </div>
      </div>
    </div>
  );
}
function ModeCard({ icon, title, subtitle, description, features, accentColor, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        padding: "30px",
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        borderRadius: "20px",
        border: `1px solid ${hovered ? accentColor + "40" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.3s ease",
        cursor: "pointer",

        // ⭐ critical for equal height layout:
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: "42px", marginBottom: "18px" }}>{icon}</div>

      {/* Title */}
      <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px", color: "#fff" }}>
        {title}
      </h3>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "12px",
          color: accentColor,
          marginBottom: "16px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {subtitle}
      </div>

      {/* Wrap description + features into a flexible box */}
      <div style={{ flex: 1 }}>
        {/* Description */}
        <p style={{ color: "#aaa", marginBottom: "18px", fontSize: "14px", lineHeight: "1.6" }}>
          {description}
        </p>

        {/* Features */}
        <div>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
                fontSize: "13px",
                color: "#888",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: accentColor,
                }}
              />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Launch Button pinned to bottom */}
      <button
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          background: hovered ? accentColor : "rgba(255,255,255,0.06)",
          border: "none",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          color: hovered ? "#fff" : "#ccc",
          transition: "0.3s ease",
          marginTop: "20px",
        }}
      >
        Launch Mode →
      </button>
    </div>
  );
}
