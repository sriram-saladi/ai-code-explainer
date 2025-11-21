import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RoomPage />} />
                <Route path="/room/:roomCode" element={<ChatPage />} />
            </Routes>
        </BrowserRouter>
    );
}
