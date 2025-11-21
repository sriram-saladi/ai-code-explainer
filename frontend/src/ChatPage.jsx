import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import Comments from "../components/Comments";
import Explainer from "../components/Explainer";

export default function ChatPage() {
    const { roomCode } = useParams();
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        if (!roomCode) return;

        console.log("Joining room:", roomCode);

        // JOIN THE ROOM
        socket.emit("join", { room: roomCode });

        // CONFIRM WHEN SERVER SENDS HISTORY
        socket.on("room_history", () => {
            console.log("Room history received → joined successfully");
            setJoined(true);
        });

        return () => {
            socket.off("room_history");
        };
    }, [roomCode]);   //  <-- IMPORTANT!
      // runs again when roomCode changes

    if (!joined) return <h2>Joining room...</h2>;

    return (
        <div className="page">
            <h1>Room: {roomCode}</h1>

            <Explainer />
            <Comments roomCode={roomCode} />
        </div>
    );
}
