import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import JoinRoom from "./components/JoinRoom";
import Lobby from "./components/Lobby";
import Explainer from "./components/Explainer";
import Collaboration from "./components/Collaboration";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/explainer" element={<Explainer />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}