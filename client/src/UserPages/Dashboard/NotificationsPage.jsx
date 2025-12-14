// import { DashboardLayout } from "../../components/dashboard-layout"


// export default function NotificationsPage() {
//   return (
//     <DashboardLayout>
//       <NotificationsCenter />
//     </DashboardLayout>
//   )
// }

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Trash2, Check } from "lucide-react"

import { DashboardLayout } from "../../components/dashboard-layout"
import { NotificationsCenter } from "../../components/notifications-centre"
const notificationsData = [
  {
    id: 1,
    type: "booking-update",
    title: "Booking Accepted",
    message: "John Smith accepted your booking for tomorrow at 10:00 AM",
    timestamp: "2 hours ago",
    read: false,
    category: "Booking Updates",
  },
  {
    id: 2,
    type: "offer",
    title: "Special Offer",
    message: "Get 20% off on your next booking at Premium Cuts",
    timestamp: "1 day ago",
    read: false,
    category: "Offers & Discounts",
  },
  {
    id: 3,
    type: "booking-update",
    title: "Booking Completed",
    message: "Your booking with Alex Brown has been marked as completed",
    timestamp: "3 days ago",
    read: true,
    category: "Booking Updates",
  },
  {
    id: 4,
    type: "system",
    title: "System Alert",
    message: "Your profile has been updated successfully",
    timestamp: "1 week ago",
    read: true,
    category: "System Alerts",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData)
  const [filter, setFilter] = useState(null)

  const filteredNotifications = filter ? notifications.filter((n) => n.category === filter) : notifications

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const categories = ["Booking Updates", "Offers & Discounts", "System Alerts"]

  return (
    <DashboardLayout>
    <NotificationsCenter/>
    </DashboardLayout>
  )
}
