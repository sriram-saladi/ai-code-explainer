import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const BASE = "http://127.0.0.1:8000";

export default function Explainer() {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState("");
  const [action, setAction] = useState("explain");
  const [result, setResult] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    if (!room) {
      alert("No room provided. Redirecting to Join page.");
      navigate("/join");
      return;
    }

    const newSocket = io(BASE, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("join", { room });
    });

    newSocket.on("join_error", (d) => {
      setStatus(d.msg || "Join failed");
      alert("Join failed: " + (d.msg || "unknown"));
      navigate("/join");
    });

    newSocket.on("room_history", (docs) => {
      setStatus("Joined room: " + room);
      setComments(docs);
    });

    newSocket.on("new_comment", (doc) => {
      setComments((prev) => [...prev, doc]);
    });

    return () => newSocket.close();
  }, [room, navigate]);

  const sendCode = async () => {
    try {
      const res = await fetch(`${BASE}/process-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action })
      });
      const data = await res.json();

      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setResult({ error: "Failed to process code" });
    }
  };

  const sendComment = () => {
    if (!commentText.trim() || !socket) return;
    socket.emit("comment", {
      room,
      author: "User",
      text: commentText
    });
    setCommentText("");
  };

  return (
    <div style={{
      fontFamily: "Inter, Arial",
      background: "#0f0f10",
      color: "#fff",
      padding: "20px",
      display: "flex",
      gap: "30px",
      minHeight: "100vh"
    }}>
      <div style={{ width: "55%" }}>
        <h2>Code Explainer (Gemini + FastAPI)</h2>
        <h3>Room: {room}</h3>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here"
          style={{
            width: "100%",
            minHeight: "160px",
            padding: "12px",
            borderRadius: "8px",
            background: "#1a1a1b",
            color: "#ddd",
            border: "1px solid #252526",
            fontFamily: "monospace",
            fontSize: "14px"
          }}
        />

        <div style={{ marginTop: "12px" }}>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. explain or optimize"
            style={{
              padding: "8px",
              width: "60%",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#1a1a1b",
              color: "#fff"
            }}
          />
          <button
            onClick={sendCode}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              marginLeft: "8px"
            }}
          >
            Send
          </button>
        </div>

        {result && (
          <div style={{ marginTop: "20px" }}>
            <h3>Response:</h3>
            {result.error ? (
              <p style={{ color: "red" }}>{result.error}</p>
            ) : (
              <div>
                <h4>Code</h4>
                <pre style={{ background: "#111", padding: "12px", borderRadius: "6px", whiteSpace: "pre-wrap", overflow: "auto" }}>
                  {result.code}
                </pre>
                <h4>What it Does</h4>
                <p>{result.what_it_does}</p>
                <h4>Visual Flow</h4>
                <pre style={{ background: "#111", padding: "12px", borderRadius: "6px", whiteSpace: "pre-wrap", overflow: "auto" }}>
                  {result.visual_flow}
                </pre>
                <h4>Steps</h4>
                <pre style={{ background: "#111", padding: "12px", borderRadius: "6px", whiteSpace: "pre-wrap", overflow: "auto" }}>
                  {result.steps}
                </pre>
                <h4>Key Idea</h4>
                <p>{result.key_idea}</p>
                <h4>Output</h4>
                <pre style={{ background: "#111", padding: "12px", borderRadius: "6px", whiteSpace: "pre-wrap", overflow: "auto" }}>
                  {result.output}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ width: "40%" }}>
        <h3>Comments</h3>
        <div style={{
          border: "1px solid #222",
          padding: "12px",
          minHeight: "160px",
          background: "#0b0b0b",
          overflow: "auto",
          borderRadius: "6px",
          maxHeight: "400px"
        }}>
          {comments.length === 0 ? (
            <p style={{ color: "#666" }}>No comments yet</p>
          ) : (
            comments.map((c, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #222" }}>
                <b style={{ color: "#9ad" }}>{c.author}:</b> {c.text}
              </div>
            ))
          )}
        </div>

        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendComment()}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "8px",
            borderRadius: "6px",
            border: "1px solid #333",
            background: "#111",
            color: "#fff"
          }}
        />
        <button
          onClick={sendComment}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "8px",
            width: "100%"
          }}
        >
          Send
        </button>

        <div style={{ marginTop: "12px", color: "#9aa0a6" }}>{status}</div>
      </div>
    </div>
  );
}