import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { connectSocket, getSocket, disconnectSocket } from "../lib/socket";
import { API_URL, SOCKET_URL } from "../lib/config";
const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};



export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    "name": "",
    "email": "",
    "password": "",
    "role": "",
  });
  useEffect(() => {
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    localStorage.removeItem = (...args) => {
      console.trace("🧨 localStorage.removeItem called with:", args);
      originalRemoveItem.apply(localStorage, args);
    };

    localStorage.clear = (...args) => {
      console.trace("🧨 localStorage.clear called");
      originalClear.apply(localStorage, args);
    };
  }, []);

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [customerName, setCustomerName] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [salons, setSalons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all-locations');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [city, setCity] = useState("")
  const [shop, setShop] = useState(null)
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaysBookings: 0,
    totalRevenue: 0,
    activeStaff: 0,
    pendingConfirmations: 0,
  })
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !window.socket) {
      window.socket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        autoConnect: false,
      });

      window.socket.on("connect", () => {

      });
    }
  }, []);
  useEffect(() => {
    const savedToken = localStorage.getItem("customerToken") || localStorage.getItem("token");
    const savedUser = localStorage.getItem("customerUser") || localStorage.getItem("user")



    if (savedToken && savedUser) {
      setToken(savedToken);
      // setCurrentUser(JSON.parse(savedUser));
    } else {
      console.warn("⚠️ No saved user/token found");
      setToken(null);
      setCurrentUser(null);
    }

    setIsAuthReady(true);

    const socket = connectSocket();

    socket.on("newBookingRequest", (booking) => {
      setStats(prev => ({
        ...prev,
        todaysBookings: prev.todaysBookings + 1,
        pendingConfirmations: prev.pendingConfirmations + 1,
        totalRevenue: prev.totalRevenue + (booking.price || 0),
      }));
      setBookingDetails(prev => [...prev, booking]);
    });

    socket.on("bookingStatusUpdate", (data) => {
      setStats(prev => ({
        ...prev,
        pendingConfirmations: Math.max(
          0,
          prev.pendingConfirmations - 1
        ),
      }));
    });

    return () => {
      socket.off("newBookingRequest");
      socket.off("bookingStatusUpdate");
    };
  }, []);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No token found, cannot fetch bookings");
          return;
        }
        const res = await fetch(`${API_URL}/api/bookings`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });


        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server error ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        setBookings(data);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
      }
    }

    fetchBookings();
  }, []);

  const [todayBookings, setTodayBookings] = useState(0)
  const value = {
    currentUser,
    setCurrentUser,
    salons,
    setToken,
    token,
    isAuthReady,
    setIsAuthReady,
    setSalons,
    bookings,
    setBookings,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    isFormOpen,
    setIsFormOpen,
    navigate,
    city, setCity,
    shop, setShop,
    stats, setStats,
    bookingDetails, setBookingDetails
  };

  return <AppContext.Provider value={value}>

    {children}

  </AppContext.Provider>
};





