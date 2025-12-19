"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../lib/config";
import { useCustomer } from "./CustomerContext";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { customer } = useCustomer();
  const socketRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notifications")) || [];
    } catch {
      return [];
    }
  });

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter((n) => !n.read).length
  );

  /* -------------------- HELPERS -------------------- */

  const persist = (arr) => {
    localStorage.setItem("notifications", JSON.stringify(arr));
  };
  const deleteNotification = useCallback((id) => {
    if (!id) return;

    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);

      // persist to localStorage
      persist(updated);

      // recompute unread count safely
      setUnreadCount(updated.filter((n) => !n.read).length);

      return updated;
    });
  }, []);

  const addNotification = useCallback((notif) => {
    if (!notif) return;

    const normalized = {
      ...notif,
      id: notif.id ?? notif._id ?? crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [normalized, ...prev];
      persist(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
      return updated;
    });
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(updated);
      setUnreadCount(0);
      return updated;
    });
  };
  const markAsUnread = useCallback((id) => {
    if (!id) return;

    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: false } : n
      );

      persist(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);

      return updated;
    });
  }, []);

  /* -------------------- SOCKET -------------------- */

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    const userId = customer?._id || localStorage.getItem("userId");
    const shopId = localStorage.getItem("shopId");
    const role = customer?.role || localStorage.getItem("role");

    if (!userId && !shopId) return;

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { token },
      });
    }

    const socket = socketRef.current;

    socket.connect();

    socket.on("connect", () => {
      console.log("🔌 Notification socket connected:", socket.id);

      if (role === "barber" && shopId) {
        socket.emit("joinShopRoom", shopId);
        console.log("🏪 Joined shop room:", shopId);
      }

      if (userId) {
        socket.emit("joinUserRoom", userId);
        console.log("👤 Joined user room:", userId);
      }
    });

    /* -------- EVENTS -------- */

    socket.on("booking:new", (booking) => {
      addNotification({
        type: "booking:new",
        message: `New booking from ${booking.customerName}`,
        booking,
      });
    });

    socket.on("bookingStatusUpdate", (info) => {
      addNotification({
        id: info._id ?? info.bookingId ?? crypto.randomUUID(),
        type: "bookingStatusUpdate",

        // 👇 structured fields
        bookingId: info._id ?? info.bookingId,
        status: info.status,
        shopName: info.shopName ?? info.shop?.name,
        customerName: info.customerName,

        message: `Booking ${info.status}`,
        read: false,
        timestamp: new Date().toISOString(),
      });
      console.log("Updated booking request received for the user side", info)
    });


    socket.on("booking:updated", (info) => {
      addNotification({
        type: "bookingUpdated",
        message: `Booking updated`,
        info,
      });
    });

    socket.on("notification", (n) => {
      addNotification(n);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Notification socket disconnected");
    });

    return () => {
      socket.off();
    };
  }, [customer, addNotification]);

  /* -------------------- CONTEXT -------------------- */

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        deleteNotification,
        notificationsOpen,
        setNotificationsOpen,
        addNotification,
        markAsUnread,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
