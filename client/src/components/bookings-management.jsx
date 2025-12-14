"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Plus, Edit2, Trash2, Search } from "lucide-react"


const mockBookings = [
  {
    id: 1001,
    clientName: "John Smith",
    email: "john@example.com",
    date: "2025-11-15",
    time: "10:00 AM",
    duration: "1 hour",
    status: "confirmed",
    amount: 150,
  },
  {
    id: 1002,
    clientName: "Sarah Johnson",
    email: "sarah@example.com",
    date: "2025-11-16",
    time: "2:00 PM",
    duration: "2 hours",
    status: "confirmed",
    amount: 300,
  },
  {
    id: 1003,
    clientName: "Mike Davis",
    email: "mike@example.com",
    date: "2025-11-17",
    time: "11:00 AM",
    duration: "1.5 hours",
    status: "pending",
    amount: 225,
  },
  {
    id: 1004,
    clientName: "Emily Brown",
    email: "emily@example.com",
    date: "2025-11-18",
    time: "3:30 PM",
    duration: "1 hour",
    status: "confirmed",
    amount: 150,
  },
  {
    id: 1005,
    clientName: "Robert Wilson",
    email: "robert@example.com",
    date: "2025-11-19",
    time: "9:00 AM",
    duration: "2 hours",
    status: "cancelled",
    amount: 300,
  },
]

export function BookingsManagement() {
  const [bookings, setBookings] = useState(mockBookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().includes(searchTerm),
  )

  const handleDelete = (id) => {
    setBookings(bookings.filter((booking) => booking.id !== id))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage all your bookings and reservations</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage your booking list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Booking ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Client Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-foreground">#{booking.id}</td>
                        <td className="py-3 px-4 text-foreground font-medium">{booking.clientName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{booking.email}</td>
                        <td className="py-3 px-4 text-foreground">
                          {booking.date} at {booking.time}
                        </td>
                        <td className="py-3 px-4 text-foreground">{booking.duration}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground font-semibold">${booking.amount}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingId(booking.id)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Edit booking"
                            >
                              <Edit2 className="w-4 h-4 text-primary" />
                            </button>
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Delete booking"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No bookings found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${bookings.reduce((sum, b) => sum + b.amount, 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
