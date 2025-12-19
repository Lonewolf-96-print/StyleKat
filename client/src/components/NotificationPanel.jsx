"use client";

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import UserNotificationPage from "../components/UserNotificationPage";
import { BarberNotificationPage } from "../components-barber/BarberNotificationPage";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

export function NotificationsPanel() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      console.log("Role from token:", decoded.role);
      // Assuming your token payload contains role: "barber" or "user"
      if (decoded.role === "barber") {
        setRole("barber");
        console.log("Role set to barber");
      } else if (decoded.role === "user") {
        setRole("user");
        console.log("Role set to user");
      } else {
        // fallback: if token doesn't contain role, check stored role
        const storedRole = localStorage.getItem("role");
        setRole(storedRole || "user");
      }
    } catch (err) {
      console.error("⚠️ Error decoding token:", err);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="p-6">Loading notifications...</p>;

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full bg-white">
      {role === "user" ? (
        <UserNotificationPage />
      ) : (
        <BarberNotificationPage />
      )}
    </div>
  );
}
