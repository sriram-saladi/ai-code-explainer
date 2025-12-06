import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BASE = "http://127.0.0.1:8000";

export default function CodeExplainer() {
  const [room, setRoom] = useState("ROOM");
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Comments
  const [socket, setSocket] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  // Load room from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    if (r) setRoom(r);
  }, []);

  // Initialize socket
  useEffect(() => {
    const s = io(BASE, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      console.log("🔌 Connected:", s.id);
      s.emit("join", { room });
    });

    s.on("room_history", (docs) => {
      setComments(docs);
    });

    s.on("new_comment", (doc) => {
      setComments((prev) => [...prev, doc]);
    });

    return () => s.close();
  }, [room]);

  // ---- PROCESS CODE WITH BACKEND ----
  const handleExplain = async () => {
    if (!code.trim()) {
      alert("Please enter code!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/process-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "explain" }),
      });

      const data = await res.json();

      if (data.error) {
        alert("LLM Error: " + data.error);
        setIsLoading(false);
        return;
      }

      setExplanation(data.result);
    } catch (err) {
      alert("Request failed: " + err.message);
    }

    setIsLoading(false);
  };

  // ---- SEND COMMENT ----
  const sendComment = () => {
    if (!commentText.trim() || !socket) return;

    socket.emit("comment", {
      room,
      author: "User",
      text: commentText,
    });

    setCommentText("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#667eea,#764ba2)",
        padding: 25,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* HEADER */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "20px 30px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,0.1)",
            borderBottom: "none",
          }}
        >
          <div>
            <h1 style={{ color: "#fff", margin: 0 }}>🤖 Code Explainer</h1>
            <p style={{ color: "#ddd", margin: 0 }}>
              Room: <b style={{ fontFamily: "monospace" }}>{room}</b>
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "70% 30%",
            background: "#16161f",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* LEFT SIDE - EDITOR + AI RESULT */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
            <div
              style={{
                background: "#1f1f2e",
                padding: 15,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 style={{ color: "#fff", margin: 0 }}>📝 Code Editor</h3>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              style={{
                width: "100%",
                height: "350px",
                padding: 20,
                background: "#0d0d12",
                color: "#eee",
                border: "none",
                resize: "none",
                fontFamily: "Fira Code, monospace",
              }}
            />

            {/* AI RESULT */}
            {explanation && (
              <div
                style={{
                  padding: 20,
                  background: "#0d0d12",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  maxHeight: 350,
                  overflowY: "auto",
                }}
              >
                <h3 style={{ color: "#8b8bff" }}>✨ AI Explanation</h3>

                <Section title="What it does" value={explanation.what_it_does} />
                <Section title="Visual Flow" value={explanation.visual_flow} />
                <Section title="Steps" value={explanation.steps} />
                <Section title="Key Idea" value={explanation.key_idea} />
                <Section title="Output" value={explanation.output} />
              </div>
            )}
          </div>

          {/* RIGHT SIDE - COMMENTS */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                padding: 15,
                background: "#1f1f2e",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 style={{ color: "#fff", margin: 0 }}>💬 Comments</h3>
            </div>

            {/* COMMENT LIST */}
            <div
              style={{
                flex: 1,
                padding: 20,
                background: "#0d0d12",
                overflowY: "auto",
              }}
            >
              {comments.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <b style={{ color: "#667eea" }}>{c.author}</b>
                  <div style={{ color: "#ddd", marginTop: 5 }}>{c.text}</div>
                </div>
              ))}
            </div>

            {/* COMMENT INPUT */}
            <div
              style={{
                padding: 15,
                background: "#1f1f2e",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendComment()}
                placeholder="Write a comment..."
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#000",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <button
                onClick={sendComment}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: 10,
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "18px 30px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={handleExplain}
            disabled={isLoading}
            style={{
              padding: "12px 40px",
              background: isLoading
                ? "rgba(255,255,255,0.2)"
                : "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Analyzing..." : "✨ Explain Code"}
          </button>

          <div style={{ color: "#ddd" }}>
            Joined Room: <b style={{ color: "#fff" }}>{room}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ color: "#fff" }}>{title}</h4>
      <pre style={{ whiteSpace: "pre-wrap", color: "#ccc" }}>{value}</pre>
    </div>
  );
}
