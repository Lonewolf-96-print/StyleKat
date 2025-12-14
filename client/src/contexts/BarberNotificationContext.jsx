"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const BarberNotificationContext = createContext();
export const useBarberNotifications = () => useContext(BarberNotificationContext);

export const BarberNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");

    return saved ? JSON.parse(saved) : [];
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // 🧠 --- Helper functions ---
  const addNotification = (notif) => {
    setNotifications((prev) => {
      const updated = [notif, ...prev];
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((prev) => prev + 1);
  };
  const markAsUnread = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: false } : n
      );

      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });

    // Increase unread count by 1 safely
    setUnreadCount((prev) => prev + 1);
  };
  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
    setUnreadCount(0);
  };
  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  };

  // 🔌 --- Socket.io setup ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No token found — skipping socket connection");
      return;
    }

    const socket = io("https://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const role = localStorage.getItem("role");

    const shopId = localStorage.getItem("shopId");
    const userId = localStorage.getItem("userId");
    const markAsRead = (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
    };

    const markAllAsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    };
    const deleteNotification = (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      // Join correct room
      if (role === "barber" && shopId) {
        socket.emit("joinShopRoom", shopId);
        console.log("🧔‍♂️ Barber joined shop room:", shopId);
      } else if (role === "user" && userId) {
        socket.emit("joinUserRoom", userId);
        console.log("🙋‍♂️ User joined user room:", userId);
      } else {
        console.warn("⚠️ No valid role or ID for socket join");
      }
    });
    //     useEffect(() => {
    //   socket.on("serviceNotification", (newNotif) => {
    //     setNotifications((prev) => [newNotif, ...prev]);
    //     setUnreadCount((count) => count + 1);
    //   });

    //   return () => socket.off("serviceNotification");
    // }, []);
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    // 📩 ---- Handle Notifications ----

    // Barber: new booking
    socket.on("newBookingRequest", (booking) => {

      console.log("📩  New booking request received:", booking);
      addNotification({
        id: booking._id,
        type: "newBookingRequest",
        message: `New booking from ${booking.customerName} to shop ${booking.shopName}`,
        ...booking,
        read: false,
        timestamp: new Date(),
      });
    });

    // Barber: booking updated (status changed, cancelled, etc.)
    socket.on("bookingUpdated", (info) => {
      if (role != "barber") return
      console.log("Barber")
      console.log("📩 [Barber] Booking updated:", info);
      addNotification({
        id: info._id || Date.now(),
        type: "bookingUpdated",
        message: `Booking with ${info.customerName} was updated to ${info.status}`,
        ...info,
        read: false,
        timestamp: new Date(),
      });
    });

    // Barber: shop updates (details, staff, services)
    socket.on("toggleShop", (update) => {
      if (role !== "barber") return;
      console.log("📩 [Barber] Shop info updated:", update);
      addNotification({
        id: Date.now(),
        type: "shopUpdated",
        message: `Shop details updated: ${update.fieldChanged || "General update"}`,
        ...update,
        read: false,
        timestamp: new Date(),
      });
    });
    socket.on("user:bookingCreated", (data) => {
      console.log("📩 New Booking Notification:", data);
      addNotification({

        id: booking._id,
        type: "user:bookingCreated",
        message: `New booking from ${booking.customerName} to shop ${booking.shopName}`,
        ...booking,
        read: false,
        timestamp: new Date(),
      });

    });
    // User: booking status updates
    socket.on("bookingStatusUpdate", (booking) => {
      if (role !== "user") return;
      console.log("📩 [User] Booking status update received:", booking);
      addNotification({
        id: booking._id,
        type: "bookingStatusUpdate",
        message: `Your booking with ${booking.shopName} is now ${booking.status}`,
        ...booking,
        read: false,
        timestamp: new Date(),
      });
    });
    socket.on("upcomingBookingReminder", (booking) => {
      if (role !== "user") return; // ❗ Only customers

      console.log("⏰ [User] Upcoming reminder:", booking);
      addNotification({
        id: Date.now(),
        type: "reminder",
        message: `You have a booking tomorrow at ${booking.time} with ${booking.shopName}`,
        ...booking,
        read: false,
        timestamp: new Date(),
      });
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <BarberNotificationContext.Provider
      value={{ notifications, clearAll, markAsRead, markAsUnread, unreadCount, notificationsOpen, addNotification, setNotificationsOpen, markAllAsRead, deleteNotification }}

    >
      {children}
    </BarberNotificationContext.Provider>

  );
};
