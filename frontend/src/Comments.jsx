import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Comments({ roomCode }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        socket.on("room_history", (docs) => {
            setComments(docs);
        });

        socket.on("new_comment", (comment) => {
            setComments((prev) => [...prev, comment]);
        });

        return () => {
            socket.off("room_history");
            socket.off("new_comment");
        };
    }, []);

    function sendComment() {
        if (!text.trim()) return;

        socket.emit("comment", {
            room: roomCode,
            author: "User",
            text: text
        });

        setText("");
    }

    return (
        <div>
            <h2>Comments</h2>

            <div className="comment-box">
                {comments.map((c, i) => (
                    <div key={i}>
                        <b>{c.author}:</b> {c.text}
                    </div>
                ))}
            </div>

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
            />
            <button onClick={sendComment}>Send</button>
        </div>
    );
}
