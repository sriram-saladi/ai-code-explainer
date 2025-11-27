import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      // Optionally verify token with backend /auth/me
      fetch("http://127.0.0.1:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            setToken(null);
            localStorage.removeItem("token");
          }
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  function saveToken(t, userObj) {
    setToken(t);
    localStorage.setItem("token", t);
    setUser(userObj || null);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ user, token, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
