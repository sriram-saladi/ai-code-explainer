import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8000"); // change if different

export default function RoomPage() {
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Join room on button click
  const joinRoom = () => {
    if (!roomCode.trim()) return;

    socket.emit("join", { room: roomCode });
    setJoined(true);
  };

  // After joining room, listen for events
  useEffect(() => {
    if (!joined) return;

    // Load previous history
    socket.on("room_history", (history) => {
      setComments(history);
    });

    // New comments in real time
    socket.on("new_comment", (data) => {
      setComments((prev) => [...prev, data]);
    });

    return () => {
      socket.off("room_history");
      socket.off("new_comment");
    };
  }, [joined]);

  const sendComment = () => {
    if (!comment.trim()) return;

    socket.emit("comment", {
      room: roomCode,
      author: "User",
      text: comment,
    });

    setComment("");
  };

  return (
    <div style={{ padding: 20 }}>
      {!joined ? (
        <div>
          <h2>Enter Room Code</h2>
          <input
            placeholder="Enter unique room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={{ padding: 8, width: 200 }}
          />
          <button
            onClick={joinRoom}
            style={{ marginLeft: 10, padding: 8 }}
          >
            Join
          </button>
        </div>
      ) : (
        <div>
          <h2>Room: {roomCode}</h2>

          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              height: 300,
              overflowY: "auto",
              marginBottom: 20,
            }}
          >
            {comments.map((c, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <strong>{c.author}:</strong> {c.text}
              </div>
            ))}
          </div>

          <input
            placeholder="Type a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ padding: 8, width: 300 }}
          />
          <button
            onClick={sendComment}
            style={{ marginLeft: 10, padding: 8 }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
