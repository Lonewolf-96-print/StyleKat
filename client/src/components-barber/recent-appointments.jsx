import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components-barber/ui/avatar"
import { Calendar, Check, Clock, Edit, MoreHorizontal, Phone, X, Scissors } from "lucide-react"
import { useApp } from "../contexts/AppContext"
import { useBookings } from "../contexts/BookingsContext"

import { useLanguage } from "./language-provider"
import { useState, useEffect } from "react"
import { format } from "date-fns"
// import { io } from "socket.io-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"


export const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}

export function RecentAppointments() {
  const [showBookings, setShowBookings] = useState(true)
  const [bookings, setBookings] = useState([]);
  const { t } = useLanguage();
  const { todayBookings, setTodayBookings, setAllBookings, allBookings } = useBookings();
  console.log("Todays bookings", todayBookings)
  const { navigate, customerName } = useApp();
  const token = localStorage.getItem("token");
  console.log("Token in RecentAppointments:", token);
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/status/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error ${res.status}: ${errorText}`);
      }

      const updatedBooking = await res.json();
      socketInstance?.emit("bookingStatusChanged", updatedBooking);

      setAllBookings((prev) =>
        prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
      );
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };
  useEffect(() => {
    async function fetchBookings() {

      try {
        const res = await fetch("http://localhost:5000/api/bookings/today", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,  // ← this must exist
          },
        });
        console.log("Fetch response:", res);
        if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.status}`);
        const data = await res.json();
        console.log("✅ Bookings fetched from backend:", data);
        setBookings(data);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
      }
    }
    fetchBookings();
    console.log("Username", customerName);
    console.log("Booking:", bookings)
  }, [token]);
  return (

    <Card className="border-0 shadow-md">
      <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-white rounded-t-lg">
        <div>
          <CardTitle className="text-lg font-bold">Today's Appointments</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Manage your daily schedule.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowBookings(!showBookings)}
          >
            {showBookings ? <><X className="w-4 h-4" /> Hide</> : <><Calendar className="w-4 h-4" /> Show</>}
          </Button>
          <Button
            onClick={() => navigate("/dashboard/appointments")}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 hover:bg-blue-50"
          >
            {t("dashboard.viewAll")} →
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!showBookings ? (
          <div className="p-8 text-center text-muted-foreground bg-gray-50/50">
            Bookings are hidden.
          </div>
        ) : todayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">No appointments today</h3>
            <p className="text-sm text-gray-500 max-w-[200px] mt-1">Your schedule is clear. Enjoy the free time!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {todayBookings.map((appointment) => (
              <div key={appointment._id} className="p-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-start gap-4">
                  {/* Time Column */}
                  <div className="flex flex-col items-center justify-center min-w-[3.5rem] bg-blue-50 text-blue-700 rounded-lg p-2">
                    <span className="text-xs font-bold uppercase">{format(appointment.date, "a")}</span>
                    <span className="text-lg font-bold">{format(appointment.date, "hh:mm")}</span>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-base font-semibold text-gray-900 truncate pr-2">
                        {appointment.customerName}
                      </h4>
                      <Badge className={`${statusColors[appointment.status]} px-2.5 py-0.5 text-xs capitalize shadow-none border-0`}>
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                        <Scissors className="w-3 h-3" /> {appointment.service}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appointment.duration}min
                      </span>
                      {appointment.price && (
                        <span className="text-green-600 font-semibold px-1">₹{appointment.price}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusChange(appointment._id, "confirmed")}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleStatusChange(appointment._id, "cancelled")}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleStatusChange(appointment._id, "completed")}
                        >
                          <Check className="w-3 h-3 mr-1" /> Mark Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}