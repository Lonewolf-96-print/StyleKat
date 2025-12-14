
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
import toast from "react-hot-toast";
import { useCustomer } from "./CustomerContext";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { customer } = useCustomer(); // may be undefined initially
  const socketRef = useRef(null);

  // load persisted notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem("notifications");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to parse stored notifications", e);
      return [];
    }
  });

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() =>
    (() => {
      try {
        const raw = localStorage.getItem("notifications");
        const arr = raw ? JSON.parse(raw) : [];
        return arr.filter((n) => !n.read).length;
      } catch {
        return 0;
      }
    })()
  );

  // helpers: persist and dedupe
  const persist = (arr) => {
    try {
      localStorage.setItem("notifications", JSON.stringify(arr));
    } catch (e) {
      console.warn("Could not persist notifications", e);
    }
  };

  // add notification (dedupe by id)
  const addNotification = useCallback((notif) => {
    if (!notif) return;
    // normalize id
    const id = notif.id ?? notif._id ?? String(Date.now());
    const normalized = { ...notif, id, read: notif.read === true };

    setNotifications((prev) => {
      // avoid exact duplicate id
      const exists = prev.find((n) => n.id === normalized.id);
      if (exists) {
        // update existing (put newest at top)
        const updated = [normalized, ...prev.filter((n) => n.id !== normalized.id)];
        persist(updated);
        setUnreadCount(updated.filter((n) => !n.read).length);
        return updated;
      }
      const updated = [normalized, ...prev];
      persist(updated);
      setUnreadCount((c) => c + (normalized.read ? 0 : 1));
      return updated;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
      return updated;
    });
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: false } : n));
      persist(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(updated);
      setUnreadCount(0);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      persist(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    persist([]);
    setUnreadCount(0);
  }, []);

  // build token & role logic; be resilient
  useEffect(() => {
    const customerToken = localStorage.getItem("customerToken");
    if (!customerToken) {
      console.warn("No customer token found for notifications — skipping connection");
      return;
    }

    const userId = customer?._id || localStorage.getItem("userId");
    console.log("NotificationProvider initializing socket for user:", userId);

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: customerToken },
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // determine role (prefer customer context, else localStorage role)
    const roleFromCustomer = customer?.role;
    const roleFromStorage = localStorage.getItem("role");
    const role = roleFromCustomer || roleFromStorage || (customerToken ? "user" : "barber");

    // compute join ids

    const shopId = localStorage.getItem("shopId");

    socket.on("connect", () => {
      console.log("✅ Notification socket connected:", socket.id, "role:", role);

      // join user or shop room
      if (role === "barber" && shopId) {
        // backend expects `shop - <barberId>` sometimes — be consistent with your backend
        socket.emit("joinShopRoom", shopId);
        console.log("🔗 Joined shop room:", shopId);
      } else if (role === "user" && userId) {
        socket.emit("joinUserRoom", userId);
        console.log("🔗 Joined user room:", userId);
      } else {
        // still try a safe join if possible
        if (userId) socket.emit("joinUserRoom", userId);
        if (shopId) socket.emit("joinShopRoom", shopId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Notification socket connect error:", err?.message || err);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Notification socket disconnected:", reason);
    });

    // ---------- Event listeners ----------
    // Barber events
    socket.on("newBookingRequest", (booking) => {
      // Happens on barber side usually
      console.log("📩 newBookingRequest:", booking);
      addNotification({
        id: booking._id ?? booking.id,
        type: "newBookingRequest",
        message: `New booking from ${booking.customerName} for ${booking.shopName}`,
        ...booking,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("booking:new", (booking) => {
      console.log("📩 booking:new:", booking);
      addNotification({
        id: booking._id ?? booking.id,
        type: "newBookingRequest",
        message: `New booking from ${booking.customerName} for ${booking.shopName}`,
        ...booking,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // User events — booking created for user
    socket.on("user:bookingCreated", (data) => {
      // if(data.userId !== userId) return; // Removed redundant check
      console.log("📩 DEBUG: user:bookingCreated received:", data);
      addNotification({
        id: data._id ?? data.id,
        type: "user:bookingCreated",
        message: `Your booking at ${data.shopName} is created.`,
        ...data,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("bookingCreated", (data) => {
      console.log("📩 bookingCreated:", data);
      addNotification({
        id: data._id ?? data.id,
        type: "user:bookingCreated",
        message: `Your booking at ${data.shopName} is created.`,
        ...data,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // Status updates (both barber and user relevant; guard by role inside handler if needed)
    socket.on("bookingStatusUpdate", (info) => {
      // if(info.userId !== userId) return; // Removed redundant check
      console.log("📢 DEBUG: bookingStatusUpdate received:", info);
      // backend may send different shapes: {bookingId, status} or full booking
      const id = info._id ?? info.bookingId ?? info.id;
      const status = info.status;
      const shopName = info.shopName ?? info.shop?.name;

      addNotification({
        id: id ?? String(Date.now()),
        type: "bookingStatusUpdate",
        message: `Booking ${id} is now ${status}`,
        bookingId: id,
        status,
        shopName,
        ...info,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // Generic booking updated event from other emitters
    socket.on("booking:updated", (info) => {

      console.log("📢 booking:updated:", info);
      addNotification({
        id: info._id ?? info.id ?? String(Date.now()),
        type: "bookingUpdated",
        message: `Booking updated: ${info.status || "updated"}`,
        ...info,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("bookingUpdated", (info) => {
      console.log("📢 bookingUpdated:", info);
      addNotification({
        id: info._id ?? info.id ?? String(Date.now()),
        type: "bookingUpdated",
        message: `Booking updated: ${info.status || "updated"}`,
        ...info,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // reminders
    socket.on("booking:reminder", (payload) => {
      console.log("⏰ booking:reminder:", payload);
      addNotification({
        id: payload.bookingId ?? String(Date.now()),
        type: "reminder",
        message: payload.message ?? `Reminder for booking ${payload.bookingId}`,
        ...payload,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("upcomingBookingReminder", (payload) => {
      if (payload.id !== userId) return;
      console.log("⏰ upcomingBookingReminder:", payload);
      addNotification({
        id: payload._id ?? String(Date.now()),
        type: "reminder",
        message: payload.message ?? `Upcoming booking at ${payload.time}`,
        ...payload,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // shop related
    socket.on("toggleShop", (payload) => {
      console.log("🏷 toggleShop:", payload);
      addNotification({
        id: String(Date.now()),
        type: "shopUpdated",
        message: `Shop info updated`,
        ...payload,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // Defensive: handle generic server notices
    socket.on("notification", (n) => {
      console.log("🔔 server notification:", n);
      addNotification({
        id: n._id ?? n.id ?? String(Date.now()),
        type: n.type ?? "system",
        message: n.message ?? "Notification",
        ...n,
        read: false,
        timestamp: new Date().toISOString(),
      });
    });

    // cleanup on unmount
    return () => {
      try {
        socket.disconnect();
      } catch (e) {
        /* ignore */
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, addNotification]); // re-run if customer object changes

  // keep unreadCount synced if notifications change externally
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
    persist(notifications);
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationsOpen,
        setNotificationsOpen,
        addNotification,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
