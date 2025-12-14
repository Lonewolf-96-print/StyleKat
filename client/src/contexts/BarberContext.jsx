// src/contexts/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

const BarberContext = createContext();

export const BarberProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on mount (either from localStorage or backend verification)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored Barber on load:", storedUser);
    const token = localStorage.getItem("token");




    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.warn("⚠️ Failed to parse stored user");
      }
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token} `,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          console.log("✅ Barber verified from backend:", user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          console.warn("⚠️ Token invalid or expired, not clearing yet:", data.message);
          // only clear if the server explicitly says expired
          if (data.message?.toLowerCase().includes("expired")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("❌ User fetch failed:", error.message);
        // do NOT remove token here — just mark as failed
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  // ✅ Login function
  const login = async (email, password) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token} `
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("Logged in user data:", data);
      setUser(data.user);
    }
    return data;
  };

  // ✅ Register function
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")} `
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success) {

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("Registered user data:", data);
      setUser(data.user);
    }
    return data;
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
