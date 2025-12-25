"use client"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import { useApp } from "../contexts/AppContext.jsx"

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700",
  accepted: "bg-blue-500/10 text-blue-700",
  completed: "bg-green-500/10 text-green-700",
  cancelled: "bg-red-500/10 text-red-700",
}

export function RecentBookingsCard({ bookings = [] }) {
  const { navigate } = useApp()

  return (
    <Card className="border-none shadow-none bg-transparent">
      {/* We remove the internal header since the parent page handles the section title */}

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-xl border-dashed bg-card/50 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-base font-medium">No recent bookings</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            You don't have any appointments scheduled for today or tomorrow.
          </p>
          <Button onClick={() => navigate("/search-salon")} variant="outline" size="sm" className="mt-2">
            Book an Appointment
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              {/* Left: Info */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                  {booking.shopName ? booking.shopName.charAt(0) : "S"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground text-base leading-none">
                    {booking.shopName || "Unknown Barber"}
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium">{booking.service}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{booking.time || "Time N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Right: Status & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                <Badge variant="secondary" className={`px-2.5 py-0.5 rounded-full font-medium ${statusColors[booking.status]}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>

                {/* Only show 'View' button on hover for desktop, always on mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/my-bookings")}
                  className="
    opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity
    text-green-600
    hover:text-green-700
    hover:bg-green-100/70
    focus-visible:ring-green-500
  "
                >
                  Details
                </Button>

              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
