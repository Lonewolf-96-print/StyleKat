"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components-barber/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components-barber/ui/dropdown-menu";
import { jwtDecode } from "jwt-decode";
import { Clock, Phone, MoreHorizontal, Check, X, Calendar, Edit } from "lucide-react";
import { format, isToday } from "date-fns";
import { useBookings } from "../contexts/BookingsContext";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from "../lib/config";
import { Navigate } from "react-router-dom";
import CalendarStrip from "./CalenderStrip";
import { DashboardSidebar } from "./sidebar";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@radix-ui/react-alert-dialog";

// STATUS COLORS
const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export function AppointmentsList() {
  const { t } = useTranslation();

  const {
    allBookings,
    setAllBookings,
    loading,
    selectedFilter,
    setSelectedFilter,
  } = useBookings();

  const [socketInstance, setSocketInstance] = useState(null);

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login/barber" replace />;

  // SOCKET SETUP (RUNS ONCE)
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });

    setSocketInstance(socket);

    const shopId = localStorage.getItem("shopId");
    if (shopId) socket.emit("joinShopRoom", shopId);

    const handleStatusUpdate = (updated) => {
      setAllBookings(prev => {
        const map = new Map(prev.map(b => [b._id, b]));
        map.set(updated._id, updated);
        return [...map.values()];
      });
    };

    const handleNewBooking = (newBooking) => {
      setAllBookings(prev => {
        const map = new Map(prev.map(b => [b._id, b]));
        map.set(newBooking._id, newBooking);
        return [...map.values()];
      });
    }

    socket.on("bookingStatusUpdate", handleStatusUpdate);
    socket.on("newBookingRequest", handleNewBooking);

    return () => {
      socket.off("bookingStatusUpdate", handleStatusUpdate);
      socket.off("newBookingRequest", handleNewBooking);
      socket.disconnect();
    };
  }, [token]);

  // UPDATE BOOKING STATUS
  const handleStatusChange = async (bookingId, newStatus, staffId) => {
    try {
      const res = await fetch(
        `${API_URL}/api/bookings/status/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            staffId // ⬅️ SEND THIS
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();

      socketInstance?.emit("bookingStatusChanged", updated);

      setAllBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };
  // DELETE BOOKING
  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Delete this booking from your view?")) return;

    try {
      // 👇 CALL THE NEW "delete-for-barber" endpoint
      const res = await fetch(
        `${API_URL}/api/bookings/${bookingId}`,

        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      // ONLY remove from UI
      setAllBookings(prev => prev.filter(b => b._id !== bookingId));

      // ❌ NO socket.emit
      // ❌ NO global delete
      // ❌ NO broadcasting to users
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };



  // FILTER LOGIC
  const filteredBookings = useMemo(() => {
    if (!allBookings) return [];

    switch (selectedFilter) {
      case "today":
        return allBookings.filter((b) => isToday(new Date(b.date)));

      case "pending":
      case "confirmed":
      case "cancelled":
      case "completed":
        return allBookings.filter((b) => b.status === selectedFilter);

      default:
        return allBookings;
    }
  }, [allBookings, selectedFilter]);

  if (loading) return <p>Loading appointments...</p>;

  // ---------------- LAYOUT FIXED HERE ----------------
  return (
    <div className="space-y-6">

      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">


        <div className="flex p-1 bg-gray-100/80 rounded-xl border">
          {["all", "today", "pending", "confirmed", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${selectedFilter === filter
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR STRIP */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <CalendarStrip allBookings={allBookings} statusColors={statusColors} />
      </div>

      {/* BOOKING LIST GRID */}
      <div>
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border border-dashed rounded-xl">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No appointments found</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-1">
              There are no {selectedFilter !== 'all' ? selectedFilter : ''} bookings to display at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...new Map(filteredBookings.map(b => [b._id, b])).values()].map((appointment) => (
              <Card key={appointment._id} className="group overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-all duration-300">

                {/* Status Color Strip */}
                <div className={`h-1.5 w-full ${statusColors[appointment.status].replace("text", "bg").split(" ")[0].replace("100", "500")}`} />

                <CardContent className="p-0">
                  <div className="p-5">
                    {/* Header: Time & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-sm px-2 py-1 bg-gray-50 border-gray-200 text-gray-700">
                          {appointment.time}
                        </Badge>
                        {isToday(new Date(appointment.date)) && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>

                      <Badge className={`${statusColors[appointment.status]} border-0 capitalize px-2.5 py-0.5`}>
                        {appointment.status}
                      </Badge>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-start gap-4 mb-5">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={appointment.customerAvatar} />

                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                          {appointment.customerName?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {appointment.customerName}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {appointment.customerPhone || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="bg-gray-50/80 rounded-lg p-3 space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">{appointment.service}</span>
                        <span className="font-bold text-gray-900">₹{appointment.price}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground border-t border-gray-100 pt-2 mt-1">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        {format(new Date(appointment.date), "EEEE, MMM d, yyyy")}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-2">
                      {appointment.status === "pending" ? (
                        <div className="flex gap-2 w-full">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
                            onClick={() => handleStatusChange(appointment._id, "confirmed", appointment.staffId)}
                          >
                            <Check className="h-4 w-4 mr-1.5" /> Accept
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9"
                            onClick={() => handleStatusChange(appointment._id, "cancelled", appointment.staffId)}
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          {appointment.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleStatusChange(appointment._id, "completed", appointment.staffId)}
                            >
                              <Check className="h-3.5 w-3.5 mr-1.5" /> Mark Done
                            </Button>
                          )}
                          <span className="ml-auto"></span>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {appointment.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment._id, "cancelled", appointment.staffId)}>
                              <X className="mr-2 h-4 w-4 text-red-500" /> Cancel Booking
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteBooking(appointment._id)}>
                            Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
