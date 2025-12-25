"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../lib/config";
import { useUser } from "./BarberContext";

const BarberNotificationContext = createContext(null);
export const useBarberNotifications = () => useContext(BarberNotificationContext);

export const BarberNotificationProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user } = useUser();
  const shopId = user?._id; // Assuming user object has _id as shopId, or use user.shopId if structured that way. 
  // Based on other files, it seems usually user IS the barber/shop entity or has a reference. 
  // Let's use localStorage shopId for initial state if user is loading, but context logic should rely on user.
  // Actually, safely relying on localStorage 'shopId' is okay for init, but we want to REACT to changes.

  // Dynamic storage key based on active shop
  const getStorageKey = (id) => `barber_notifications_${id}`;

  // 🔔 Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Load notifications when shopId changes
  useEffect(() => {
    if (!shopId) {
      setNotifications([]); // Clear if no user
      return;
    }

    try {
      const key = getStorageKey(shopId);
      const raw = localStorage.getItem(key);
      if (raw) {
        setNotifications(JSON.parse(raw));
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  }, [shopId]);

  // 🔴 Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ------------------------
  // Helpers
  // ------------------------
  const persist = (list) => {
    if (!shopId) return;
    localStorage.setItem(getStorageKey(shopId), JSON.stringify(list));
  };

  const addNotification = (notif) => {
    if (!notif?.id) return;

    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some(n => n.id === notif.id && n.type === notif.type)) return prev;

      const updated = [notif, ...prev];
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

  // ------------------------
  // SOCKET
  // ------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    // We rely on shopId from context (derived from user) to know if we should connect
    if (!token || !shopId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Only connect if not already connected or if token/shopId changed meaningfully? 
    // Actually, simple way: disconnect old, connect new.
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Barber socket connected for shop:", shopId);
      socket.emit("joinShopRoom", shopId);
    });

    const handleNewNotification = (data, type, defaultMsg) => {
      addNotification({
        id: data._id || Date.now().toString(),
        type: type,
        message: data.message || defaultMsg,
        read: false,
        timestamp: new Date().toISOString(),
      });
    };

    socket.on("newBookingRequest", (booking) => {
      handleNewNotification(booking, "newBookingRequest", `New booking from ${booking.customerName}`);
    });

    socket.on("bookingStatusUpdate", (info) => {
      handleNewNotification(info, "bookingUpdated", `Booking updated to ${info.status}`);
    });

    // Listen for variations of events just in case
    socket.on("booking:updated", (info) => {
      handleNewNotification(info, "bookingUpdated", `Booking updated to ${info.status}`);
    });

    socket.on("bookingUpdated", (info) => {
      handleNewNotification(info, "bookingUpdated", `Booking updated to ${info.status}`);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [shopId]); // Dependencies: reconnect if shopId changes

  return (
    <BarberNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationsOpen,
        setNotificationsOpen,
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
