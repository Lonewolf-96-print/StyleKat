// src/pages/dashboard/DashboardPage.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { BookingStatsCard } from "../../components/booking-stats-card";
import { RecentBookingsCard } from "../../components/recent-bookings-card";
import { DashboardLayout } from "../../components/dashboard-layout";
import { useBookings } from "../../contexts/BookingsContext";
import { useCustomer } from "../../contexts/CustomerContext";
import { useNavigate } from "react-router-dom";
import { SOCKET_URL } from "../../lib/config";
export default function DashboardPage() {
  const navigate = useNavigate();
  const { userBookings, setUserBookings, fetchUserBookings, loading, error } = useBookings();
  const { customer, customerToken, loading: custLoading } = useCustomer();
  const [socket, setSocket] = useState(null);

  // Ensure we have latest user bookings on mount
  useEffect(() => {
    if (customerToken) {
      fetchUserBookings(customerToken).catch((e) => {
        console.error("Failed to initially fetch user bookings:", e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerToken]);

  // Socket setup: connect as user and join user room, listen to events
  useEffect(() => {
    if (!customerToken) return;

    // init socket with auth token
    const s = io(SOCKET_URL, { auth: { token: customerToken } });
    setSocket(s);

    s.on("connect", () => {
      try {
        const decoded = jwtDecode(customerToken);
        const userId = decoded?.id;
        if (userId) {
          // join user room so server can push user-specific events
          s.emit("joinUserRoom", userId);
          console.log("🔌 Dashboard socket connected, joined user room:", `user-${userId}`);
        } else {
          console.warn("Could not decode customerToken to get user id");
        }
      } catch (err) {
        console.error("Failed to decode customer token on socket connect", err);
      }
    });
    s.emit("joinShopRoom", `shop-${userBookings.barberId}`);
    console.log("User Booking socket inside Dashboard Page", `shop-${userBookings.barberId}`)
    // Handle reconnection / errors gracefully
    s.on("connect_error", (err) => {
      console.error("Dashboard socket connection error:", err?.message ?? err);
    });

    // --- Event: new booking created for this user ---
    s.on("user:bookingCreated", (newBooking) => {
      console.log("socket event user:bookingCreated", newBooking);
      // newBooking might be full booking object
      setUserBookings((prev) => {
        // prev may have shape { bookings: [...] } or array depending on your context
        if (!prev) return { bookings: [newBooking] };

        // handle two shapes: if prev is object with bookings property
        if (Array.isArray(prev)) {
          // older shape: array of bookings
          return [newBooking, ...prev];
        } else if (prev.bookings && Array.isArray(prev.bookings)) {
          return { ...prev, bookings: [newBooking, ...prev.bookings] };
        } else {
          // fallback: store as { bookings: [...] }
          return { bookings: [newBooking] };
        }
      });
    });

    // --- Event: booking status changed (barber emits bookingStatusChanged) ---
    // payload could be: full booking object OR { bookingId, status } OR { bookingId, newStatus }
    s.on("bookingStatusChanged", (payload) => {
      console.log("socket event bookingStatusChanged", payload);
      const bookingObj = payload?.booking || payload;
      const id = bookingObj?._id || bookingObj?.bookingId || bookingObj?.id;
      const status = bookingObj?.status || bookingObj?.newStatus || bookingObj?.state;

      if (!id) {
        console.warn("bookingStatusChanged: no id in payload", payload);
        return;
      }

      setUserBookings((prev) => {
        if (!prev) return prev;

        if (Array.isArray(prev)) {
          // prev is array of bookings
          return prev.map((b) =>
            (b._id === id || b.id === id) ? { ...(typeof payload._id !== "undefined" ? payload : { ...b, status }), ...(typeof payload !== "object" ? {} : payload) } : b
          );
        } else if (prev.bookings && Array.isArray(prev.bookings)) {
          return {
            ...prev,
            bookings: prev.bookings.map((b) => {
              if (String(b._id || b.id) !== String(id)) return b;
              // If server sent full booking replace it, otherwise patch status
              if (bookingObj && bookingObj._id) return bookingObj;
              return { ...b, status: status ?? b.status };
            }),
          };
        } else {
          return prev;
        }
      });
    });

    // optional: booking reminder or other user events
    s.on("booking:reminder", (payload) => {
      console.log("booking:reminder", payload);
      // optionally show UI toast or patch specific booking
    });

    return () => {
      s.disconnect();
      setSocket(null);
      console.log("Dashboard socket disconnected");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerToken]);

  // Derived booking list & stats (support both shapes used in your code)
  const bookingsList = useMemo(() => {
    if (!userBookings) return [];
    if (Array.isArray(userBookings)) return userBookings;
    if (userBookings.bookings && Array.isArray(userBookings.bookings)) return userBookings.bookings;
    return [];
  }, [userBookings]);

  // compute stats live
  const total = bookingsList.length;
  const active = bookingsList.filter((b) => ["pending", "accepted", "in-service", "ongoing"].includes(b.status)).length;
  const completed = bookingsList.filter((b) => b.status === "completed").length;
  const cancelled = bookingsList.filter((b) => b.status === "cancelled").length;

  // bookings this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const bookingsThisMonth = bookingsList.filter((b) => {
    const d = new Date(b.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // recent bookings (today + tomorrow)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const recentBookings = bookingsList.filter((b) => {
    try {
      const bookingDate = new Date(b.date);
      return bookingDate.toDateString() === today.toDateString() || bookingDate.toDateString() === tomorrow.toDateString();
    } catch (e) {
      return false;
    }
  });

  // Loading guards
  if (custLoading) return <DashboardLayout><p>Loading user...</p></DashboardLayout>;
  if (!customer) return <DashboardLayout><p>Please log in.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Hello, {customer?.name?.split(" ")[0] || "Guest"} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Here's what's happening with your bookings today.
            </p>
          </div>

          {/* Optional Action Button */}
          {/* <Button onClick={() => navigate('/shops')}>Book New Appointment</Button> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <BookingStatsCard
            title="Total Bookings"
            value={total}
            icon={Calendar}
            color="bg-blue-500/10 text-blue-600"
            trend={`+${bookingsThisMonth} this month`}
          />
          <BookingStatsCard
            title="Active"
            value={active}
            icon={Clock}
            color="bg-purple-500/10 text-purple-600"
            trend="In progress"
          />
          <BookingStatsCard
            title="Completed"
            value={completed}
            icon={CheckCircle}
            color="bg-green-500/10 text-green-600"
            trend="Success"
          />
          <BookingStatsCard
            title="Cancelled"
            value={cancelled}
            icon={XCircle}
            color="bg-red-500/10 text-red-600"
            trend="Needs attention"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings (Takes up 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
            </div>
            <RecentBookingsCard bookings={recentBookings} />
          </div>

          {/* Side Panel (Suggestions/Promos - Placeholder for now) */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>

              <h3 className="font-semibold text-lg mb-2 relative z-10">Find a New Look?</h3>
              <p className="text-muted-foreground text-sm mb-4 relative z-10">
                Discover top-rated barbers near you and book your next style transformation.
              </p>
              {/* This would be a link to /shops */}
              <div className="p-4 bg-muted/50 rounded-lg text-center cursor-pointer hover:bg-muted transition-colors border border-dashed border-muted-foreground/20">
                <span onClick={() => navigate('/search-salon')} className="text-sm font-medium text-primary">Browse Shops</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400">
            Error: {error}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
