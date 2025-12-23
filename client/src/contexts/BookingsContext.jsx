import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useCustomer } from "./CustomerContext";
import { API_URL, SOCKET_URL } from "../lib/config";
const BookingContext = createContext();

export function BookingProvider({ children }) {
  const { customerToken, setCustomerToken } = useCustomer()
  const [ready, setReady] = useState(false);
  const [staticSeats, setStaticSeats] = useState([]);

  const [token, setToken] = useState(null); // barber token
  // user token
  const [allBookings, setAllBookings] = useState([]);
  const [shopQueue, setShopQueue] = useState({});
  const [todayBookings, setTodayBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const socketRef = useRef(null);

  // STEP 1: Load tokens once
  useEffect(() => {
    const storedBarberToken = localStorage.getItem("token");
    const storedCustomerToken = localStorage.getItem("customerToken");
    setToken(storedBarberToken);
    setCustomerToken(storedCustomerToken);
    setReady(true);
  }, []);
  // =========================
  // Merge static seats with live shopQueue updates
  // =========================
  useEffect(() => {
    if (!staticSeats.length) return;  // must have static seats first

    const shopId = localStorage.getItem("shopId");
    const queueData = shopQueue[shopId];

    if (!queueData) return;

    const merged = staticSeats.map(seat => {
      const live = queueData.find(x => x.staffId === seat.staffId);
      return live ? { ...seat, ...live } : seat;
    });

    setStaticSeats(merged);
  }, [shopQueue]);
  // STEP 2: Watch localStorage changes
  useEffect(() => {
    const syncTokens = () => {
      setToken(localStorage.getItem("token"));
      setCustomerToken(localStorage.getItem("customerToken"));
    };
    window.addEventListener("storage", syncTokens);
    return () => window.removeEventListener("storage", syncTokens);
  }, []);
  const role = localStorage.getItem("role");
  // STEP 3: Barber booking fetch + socket setup
  useEffect(() => {
    if (!ready || !token) return;
    try {
      const decoded = jwtDecode(token)
      if (role === "barber") {
        // console.log("✂️ Barber connected:", decoded.id);
        fetchAllBookings(token);
        fetchTodayBookings(token);
        initBarberSocket(token);
        if (decoded?.staff && Array.isArray(decoded.staff)) {
          setStaticSeats(
            decoded.staff.map(s => ({
              staffId: s._id,
              staffName: s.name,
              current: null,
              queue: []
            }))
          );
        }
      }
    } catch (err) {
      // console.error("❌ Error decoding barber token:", err);
    }
  }, [ready, token]);




  // STEP 4: User booking fetch + socket setup
  useEffect(() => {

    if (!ready || !customerToken) return;

    try {

      if (role === "user") {
        const customer = jwtDecode(customerToken)
        const id = customer.id
        // console.log("🙋‍♂️ User connected:", id);
        fetchUserBookings(customerToken);
        initUserSocket(customerToken);
      }
    } catch (err) {
      // console.error("❌ Error decoding user token:", err);
    }
  }, [ready, customerToken]);

  // =========================
  // Fetch Functions
  // =========================
  const fetchAllBookings = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAllBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayBookings = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/bookings/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTodayBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUserBookings(data);
    } catch (err) {
      setError(err.message);
      setUserBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Socket Setup: Barber
  // =========================
  const initBarberSocket = (token) => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      withCredentials: true,

    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // console.log("✅ Socket connected:", socket.id);

      try {
        // console.log("Token", token)
        const decoded = jwtDecode(token);
        // console.log("Decoded", decoded)
        const shopRoom = `shop-${decoded.id}`;
        socket.emit("joinShopRoom", shopRoom);
        // console.log(`🛠 Barber joined room: ${shopRoom}`);
      } catch (err) {
        // console.error("❌ Failed to decode barber token:", err);
      }
    });

    socket.on("disconnect", () => console.log("⚠️ Socket disconnected"));

    const normalizePayload = (p) => {
      if (!p) return null;
      // If server returns { shopId: [ ... ] }
      if (typeof p === "object" && !Array.isArray(p) && Object.keys(p).length === 1 && Array.isArray(Object.values(p)[0])) {
        const shopId = Object.keys(p)[0];
        return { shopId, payload: p[shopId] };
      }
      // If server returns array directly
      if (Array.isArray(p)) {
        // cannot know shopId; use localStorage.shopId or token-decoded value
        const shopId = localStorage.getItem("shopId") || null;
        return { shopId, payload: p };
      }
      return null;
    };
    socket.on("shopQueueUpdate", (data) => {
      const normalized = normalizePayload(data);
      if (!normalized) return;
      setShopQueue((prev) => ({ ...prev, [normalized.shopId]: normalized.payload }));
      // console.log("Received shopQueueUpdate", normalized.shopId, normalized.payload);
    });

    socket.on("queueUpdated", (data) => {
      const normalized = normalizePayload(data);
      if (!normalized) return;
      setShopQueue((prev) => ({ ...prev, [normalized.shopId]: normalized.payload }));
      // console.log("Received queueUpdated", normalized.shopId, normalized.payload);
    });


    socket.on("newBookingRequest", (booking) => {
      setAllBookings((prev) => [booking, ...prev]);
      // console.log("📩 New booking received via socket:", booking);

      const today = new Date().toDateString();
      const bookingDate = new Date(booking.date).toDateString();
      if (today === bookingDate)
        setTodayBookings((prev) => [booking, ...prev]);
    });

    socket.emit("bookingStatusUpdate", (updated) => {
      // backend sometimes sends booking object or { bookingId, status } - handle both
      const bookingObj = updated?.booking || updated;
      const id = bookingObj?._id || bookingObj?.bookingId;
      const status = bookingObj?.status || bookingObj?.newStatus || bookingObj?.status;
      if (!id) return;

      setAllBookings((prev) => prev.map((x) => (x._id === id ? { ...x, status } : x)));
      setTodayBookings((prev) => prev.map((x) => (x._id === id ? { ...x, status } : x)));
      // console.log("socket bookingStatusUpdate", updated);
    });
    return () => socket.disconnect();
  };

  // =========================
  // Socket Setup: User
  // =========================
  const initUserSocket = (customerToken) => {
    // console.log("In the user socket handler")
    const socket = io(SOCKET_URL, { auth: { token: customerToken } });
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ User socket connected:", socket.id));
    socket.on("disconnect", () => console.log("⚠️ User socket disconnected"));
    try {
      const decoded = jwtDecode(customerToken);
      // console.log("Decoded customer Token for init user socket", decoded)
      const shopRoom = `shop-${decoded.id}`;
      socket.emit("joinShopRoom", shopRoom);
      // console.log(`🛠 User joined room: ${shopRoom}`);
    } catch (err) {
      // console.error("❌ Failed to decode barber token:", err);
    }



    // User listens for booking confirmations or updates
    socket.on("bookingStatusUpdate", (updated) => {
      // console.log("📢 User booking update:", updated);
      setUserBookings((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) =>
          b._id === updated.bookingId ? { ...b, status: updated.status } : b
        ),
      }));
    });

    // Optional: Listen for booking creation confirmation (if backend emits)
    socket.on("bookingCreated", (newBooking) => {
      // console.log("🆕 Booking created (user view):", newBooking);
      setUserBookings((prev) => ({
        ...prev,
        bookings: [newBooking, ...(prev.bookings || [])],
      }));
    });

    return () => socket.disconnect();
  };

  // =========================
  // Derived Helpers
  // =========================
  const userRecentBookings = () => {
    if (!userBookings?.bookings) return [];
    const today = new Date().toDateString();

    const todays = userBookings.bookings.filter(
      (b) => new Date(b.date).toDateString() === today
    );
    const others = userBookings.bookings.filter(
      (b) => new Date(b.date).toDateString() !== today
    );

    return [...todays, ...others]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  // =========================
  // UI Guard
  // =========================
  if (!ready) return <div>Loading booking data...</div>;

  return (
    <BookingContext.Provider
      value={{
        allBookings,
        todayBookings,
        userBookings,
        staticSeats,
        shopQueue,
        userRecentBookings,
        setAllBookings,
        setUserBookings,
        setToken, // Expose setToken so LoginForm can update it directly
        fetchAllBookings,
        fetchUserBookings,
        fetchTodayBookings,
        loading,
        error,
        selectedFilter,
        setSelectedFilter,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);
