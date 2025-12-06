import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Collaboration() {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [status, setStatus] = useState("disconnected");
  const [isJoined, setIsJoined] = useState(false);

  const lastText = useRef("");
  const applyingPatch = useRef(false);

  useEffect(() => {
    if (!room) {
      alert("No room provided");
      navigate("/join");
      return;
    }

    const newSocket = io("http://127.0.0.1:8000", {
      transports: ["websocket"],
      upgrade: false
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ CONNECTED — Socket ID:", newSocket.id);
      newSocket.emit("join", { room });
      setStatus("connecting...");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ DISCONNECTED");
      setIsJoined(false);
      setStatus("disconnected");
    });

    newSocket.on("editor_full", (msg) => {
      console.log("📥 FULL DOC RECEIVED:", msg.content.length, "chars");
      setText(msg.content);
      lastText.current = msg.content;
      setIsJoined(true);
      setStatus("connected ✅");
    });

    newSocket.on("editor_update", (patch) => {
      console.log("📥 PATCH RECEIVED:", patch);
      
      applyingPatch.current = true;

      setText((value) => {
        const newValue =
          value.slice(0, patch.start) +
          patch.text +
          value.slice(patch.start + patch.removedLength);
        lastText.current = newValue;
        return newValue;
      });

      applyingPatch.current = false;
    });

    newSocket.on("room_history", (docs) => {
      setComments(docs);
    });

    newSocket.on("new_comment", (doc) => {
      setComments((prev) => [...prev, doc]);
    });

    return () => newSocket.close();
  }, [room, navigate]);

  const handleTextChange = (e) => {
    if (applyingPatch.current) {
      console.log("⏭️ Skipping input (applying remote patch)");
      return;
    }

    if (!isJoined) {
      console.warn("⚠️ Not joined yet, skipping local change broadcast");
      setText(e.target.value);
      return;
    }

    const newText = e.target.value;
    const oldText = lastText.current;

    let start = 0;
    const minLength = Math.min(oldText.length, newText.length);

    while (start < minLength && oldText[start] === newText[start]) {
      start++;
    }

    let endOld = oldText.length;
    let endNew = newText.length;

    while (
      endOld > start &&
      endNew > start &&
      oldText[endOld - 1] === newText[endNew - 1]
    ) {
      endOld--;
      endNew--;
    }

    const removedLength = endOld - start;
    const addedText = newText.slice(start, endNew);

    const patch = {
      room,
      start,
      removedLength,
      text: addedText
    };

    console.log("📤 SENDING PATCH:", patch);
    socket.emit("editor_broadcast", patch);

    lastText.current = newText;
    setText(newText);
  };

  const sendComment = () => {
    if (!commentInput.trim() || !socket) return;
    socket.emit("comment", { room, author: "User", text: commentInput });
    setCommentInput("");
  };

  return (
    <div style={{
      fontFamily: "Inter, Arial",
      padding: "20px",
      background: "#0e0e0f",
      color: "#fff",
      display: "flex",
      gap: "20px",
      minHeight: "100vh"
    }}>
      <div style={{ flex: 1 }}>
        <h2>Google Docs Collaboration</h2>
        <h3>Room: {room}</h3>

        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Start typing... changes sync in real-time"
          style={{
            width: "100%",
            height: "400px",
            background: "#111",
            color: "#eee",
            border: "1px solid #333",
            borderRadius: "6px",
            padding: "12px",
            resize: "none",
            fontFamily: "monospace",
            fontSize: "14px"
          }}
        />
        <div style={{ marginTop: "6px", color: "#aaa" }}>
          Status: <span>{status}</span>
        </div>
      </div>

      <div style={{ width: "300px" }}>
        <h3>Comments</h3>
        <div style={{
          height: "300px",
          overflow: "auto",
          background: "#111",
          border: "1px solid #333",
          padding: "8px",
          borderRadius: "6px"
        }}>
          {comments.length === 0 ? (
            <p style={{ color: "#666" }}>No comments yet</p>
          ) : (
            comments.map((c, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #222" }}>
                <b>{c.author}</b>: {c.text}
              </div>
            ))
          )}
        </div>
        <input
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Write comment..."
          onKeyPress={(e) => e.key === "Enter" && sendComment()}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "8px",
            background: "#111",
            border: "1px solid #333",
            borderRadius: "6px",
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
        <div style={{ position: "fixed", bottom: "10px", right: "10px", background: "#222", padding: "10px", borderRadius: "6px" }}>
  Socket ID: {socket?.id || "Not connected"}
      </div>
      </div>
    </div>
  );
}