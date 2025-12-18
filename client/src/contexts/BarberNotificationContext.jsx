"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../lib/config";

const BarberNotificationContext = createContext();
export const useBarberNotifications = () => useContext(BarberNotificationContext);

const STORAGE_KEY = "barber_notifications";

export const BarberNotificationProvider = ({ children }) => {
  const socketRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(
    notifications.filter((n) => !n.read).length
  );

  const persist = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setUnreadCount(list.filter((n) => !n.read).length);
  };

  const addNotification = (notif) => {
    if (!notif?.id) return;

    setNotifications((prev) => {
      const updated = [notif, ...prev.filter((n) => n.id !== notif.id)];
      persist(updated);
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      persist(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(updated);
      return updated;
    });
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      persist(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    persist([]);
  };

  // 🔌 SOCKET
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const shopId = localStorage.getItem("shopId");

    if (!token || role !== "barber" || !shopId) {
      console.warn("🚫 Barber socket skipped");
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Barber socket connected:", socket.id);
      socket.emit("joinShopRoom", shopId);
    });

    socket.on("newBookingRequest", (booking) => {
      console.log("📩 New booking:", booking);
      addNotification({
        id: booking._id,
        type: "newBookingRequest",
        message: `New booking from ${booking.customerName}`,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("bookingUpdated", (info) => {
      console.log("📩 Booking updated:", info);
      addNotification({
        id: info._id,
        type: "bookingUpdated",
        message: `Booking status changed to ${info.status}`,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("toggleShop", () => {
      addNotification({
        id: Date.now(),
        type: "shopUpdated",
        message: "Shop details updated",
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Barber socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <BarberNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </BarberNotificationContext.Provider>
  );
};
