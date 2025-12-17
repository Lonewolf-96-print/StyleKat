import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, X, Plus, MoreHorizontal, Calendar, Clock } from "lucide-react";
import { useApp } from "../../contexts/AppContext.jsx";
import { io } from "socket.io-client";
import { useBookings } from "../../contexts/BookingsContext.jsx";
import { API_URL, SOCKET_URL } from "../../lib/config";
import { format } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import toast from "react-hot-toast";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700",
  accepted: "bg-blue-500/10 text-blue-700",
  completed: "bg-green-500/10 text-green-700",
  cancelled: "bg-red-500/10 text-red-700",
};
const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "#eab308"; // yellow-500
    case "confirmed": return "#22c55e"; // green-500
    case "in-service": return "#f97316"; // orange-500
    case "completed": return "#3b82f6"; // blue-500
    case "cancelled": return "#ef4444"; // red-500
    default: return "#6b7280"; // gray-500
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    case "confirmed":
      return { label: "Confirmed", className: "bg-green-100 text-green-800 border-green-200" };
    case "in-service":
      return { label: "In Service", className: "bg-orange-100 text-orange-800 border-orange-200" };
    case "completed":
      return { label: "Completed", className: "bg-blue-100 text-blue-800 border-blue-200" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-800 border-gray-200" };
  }
};

export default function BookingsDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const { userBookings } = useBookings();
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const { navigate } = useApp();

  const visibleCount = 5;
  const [count, setCount] = useState(visibleCount);
  const observer = useRef(null);

  const lastRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCount((prev) => prev + 5);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  /** Fetch User Bookings */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("customerToken");
        if (!token) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/bookings/my`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.bookings) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Bookings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  /** SOCKET SETUP */
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const userId = localStorage.getItem("userId");
    if (!token) return;

    const userSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
    });

    setSocket(userSocket);

    userSocket.on("connect", () => {
      if (userId) userSocket.emit("joinUserRoom", `user-${userId}`);
    });

    // Corrected bookingStatusUpdate handler
    userSocket.on("bookingStatusUpdate", (updatedBooking) => {
      if (updatedBooking.status === "barber_deleted") return;
      setBookings(prev => {
        if (!Array.isArray(prev)) return []; // safety check

        // Update only the booking that changed
        const exists = prev.some(b => b._id === updatedBooking._id);

        if (exists) {
          return prev.map(b => b._id === updatedBooking._id ? updatedBooking : b);
        } else {
          // If not found, optionally add it
          return [...prev, updatedBooking];
        }
      });
    });

    return () => userSocket.disconnect();
  }, []);

  /** Cancel Booking */
  const handleCancel = async (bookingId) => {
    if (!confirm("Are you sure to cancel the booking?")) return;

    try {
      const token = localStorage.getItem("customerToken");
      const res = await fetch(`${API_URL}/api/bookings/my/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
        );
        toast.success("Booking cancelled");
      } else {
        toast.error(data.message || "Cancel failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error cancelling booking");
    }
  };

  /** Delete Booking (Only user side) */
  const handleDelete = async (bookingId) => {
    if (!confirm("Delete this booking from your view?")) return;

    try {
      const token = localStorage.getItem("customerToken");

      const res = await fetch(
        `${API_URL}/api/bookings/my/${bookingId}/permanent`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        toast.success("Booking deleted");
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting booking");
    }
  };

  /** search + filter */
  const filteredBookings = bookings.filter((b) => {
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      (b.barberName && b.barberName.toLowerCase().includes(query)) ||
      (b.shopName && b.shopName.toLowerCase().includes(query)) ||
      (b.service && b.service.toLowerCase().includes(query));

    const matchesFilter = !filterStatus || b.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const visibleBookingsToShow = filteredBookings.slice(0, count);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-6xl space-y-6"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage and track all bookings</p>
        </div>

        <Button onClick={() => navigate("/search-salon")} className="gap-2">
          <Plus className="w-4 h-4" /> New Booking
        </Button>

        {/* SEARCH BOX */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filterStatus && (
              <Button variant="outline" onClick={() => setFilterStatus(null)}>
                <X className="w-4 h-4" /> Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {["pending", "accepted", "completed", "cancelled"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() =>
                  setFilterStatus(filterStatus === status ? null : status)
                }
              >
                {status}
              </Button>
            ))}
          </div>
        </Card>

        {/* BOOKINGS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">Loading bookings...</div>
          ) : visibleBookingsToShow.length > 0 ? (
            visibleBookingsToShow.map((booking, i) => {
              const last = i === visibleBookingsToShow.length - 1;
              const badge = getStatusBadge(booking.status);

              return (
                <motion.div
                  key={booking._id}
                  ref={last ? lastRef : null}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex"
                >
                  <Card className="flex flex-col w-full overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4" style={{ borderTopColor: getStatusColor(booking.status) }}>

                    {/* CARD HEADER */}
                    <div className="p-5 border-b bg-gray-50/50 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg truncate" title={booking.shopName}>
                          {booking.shopName || "Unspecified Salon"}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(booking.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge className={`${badge.className} shadow-sm px-2.5 py-0.5 text-xs uppercase tracking-wider`}>
                        {badge.label}
                      </Badge>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-5 flex-1 space-y-4">
                      {/* Service & Price */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Service</p>
                          <p className="font-medium text-gray-900">{booking.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Price</p>
                          <p className="font-bold text-lg text-primary">₹{booking.price}</p>
                        </div>
                      </div>

                      {/* Staff */}
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                          {booking.staffName ? booking.staffName.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Professional</p>
                          <p className="text-sm font-semibold">{booking.staffName || "Any Staff"}</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{booking.time}</span>
                      </div>
                    </div>

                    {/* CARD FOOTER (Actions) */}
                    <div className="p-4 border-t bg-gray-50/30 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">ID: #{booking._id.slice(-6)}</span>

                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content
                          align="end"
                          className="bg-white border rounded-lg p-1 shadow-xl min-w-[160px] z-50 animate-in fade-in zoom-in-95"
                        >
                          {booking.status !== "cancelled" ? (
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer outline-none transition-colors"
                              onClick={() => handleCancel(booking._id)}
                            >
                              <X className="w-4 h-4" /> Cancel Booking
                            </DropdownMenu.Item>
                          ) : (
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 cursor-pointer outline-none transition-colors"
                              onClick={() => handleDelete(booking._id)}
                            >
                              <X className="w-4 h-4" /> Remove
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </div>

                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-gray-50/50">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
              <p className="text-muted-foreground max-w-sm mt-1 mb-6">You haven't made any bookings yet, or none match your search filters.</p>
              <Button onClick={() => navigate("/search-salon")}>Book Now</Button>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
