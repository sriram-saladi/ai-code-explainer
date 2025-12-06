import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function CollaborationEditor() {
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState(null);

  const [code, setCode] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const [status, setStatus] = useState("connecting...");

  useEffect(() => {
    const roomCode = new URLSearchParams(window.location.search).get("room");
    if (!roomCode) return;
    setRoom(roomCode);

    // connect backend
    const s = io("http://127.0.0.1:8000", {
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      setStatus("connected");
      s.emit("join", { room: roomCode });
    });

    s.on("disconnect", () => setStatus("disconnected"));

    s.on("editor_full", (msg) => {
      setCode(msg.content || "");
    });

    s.on("editor_update", (patch) => {
      setCode((old) => {
        const before = old.slice(0, patch.start);
        const after = old.slice(patch.start + patch.removedLength);
        return before + patch.text + after;
      });
    });

    s.on("room_history", (docs) => {
      setComments(docs);
    });

    s.on("new_comment", (doc) => {
      setComments((prev) => [...prev, doc]);
    });

    return () => s.close();
  }, []);

  // send editor patch
  const handleCodeChange = (e) => {
    const newText = e.target.value;

    if (!socket) return;

    socket.emit("editor_broadcast", {
      room,
      start: 0,
      removedLength: code.length,
      text: newText,
    });

    setCode(newText);
  };

  // send comment
  const handleSendComment = () => {
    if (!comment.trim() || !socket) return;

    socket.emit("comment", {
      room,
      author: "User",
      text: comment.trim(),
    });

    setComment("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "25px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        {/* HEADER */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px 16px 0 0",
            padding: "20px 30px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderBottom: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", margin: 0 }}>
              👥 Live Collaboration
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: 0 }}>
              Room: <b style={{ color: "#fff" }}>{room}</b>
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/lobby?room=" + room)}
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
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
          {/* LEFT - EDITOR */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
            <textarea
              value={code}
              onChange={handleCodeChange}
              placeholder="Start typing..."
              style={{
                width: "100%",
                height: "600px",
                background: "#0d0d12",
                border: "none",
                padding: "25px",
                color: "#e8e8e8",
                fontSize: "14px",
                fontFamily: "'Fira Code', monospace",
                resize: "none",
                outline: "none",
              }}
            />
          </div>

          {/* RIGHT - COMMENTS */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px", background: "#1f1f2e" }}>
              <h3 style={{ color: "#fff", margin: 0 }}>💬 Comments</h3>
            </div>

            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                background: "#0d0d12",
              }}
            >
              {comments.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    marginBottom: "10px",
                    padding: "12px",
                    borderRadius: "10px",
                  }}
                >
                  <b style={{ color: "#667eea" }}>{c.author}</b>
                  <p style={{ margin: "5px 0", color: "#ddd" }}>{c.text}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: "15px", background: "#1f1f2e" }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Write comment..."
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#0d0d12",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  marginBottom: "10px",
                }}
              />
              <button
                onClick={handleSendComment}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER STATUS */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            padding: "15px 30px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderTop: "none",
            textAlign: "left",
          }}
        >
          <span
            style={{
              color: status === "connected" ? "#4ade80" : "#fbbf24",
              fontWeight: 600,
            }}
          >
            Status: {status}
          </span>
        </div>
      </div>
    </div>
  );
}
