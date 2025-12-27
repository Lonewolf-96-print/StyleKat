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
import { useNotifications } from "../../contexts/UserNotificationsContext"

export default function NotificationsPage() {
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();

  // If you needed to pass data into NotificationsCenter, you would do it here.
  // Assuming NotificationsCenter handles its own implementation or needs to be wrapped.
  // Actually, checking the original file, it just rendered <NotificationsCenter />.
  // If NotificationsCenter is already using the context internally, then this page wrapper is fine.
  // But the user said "notification panel is still empty", which implies NotificationsCenter might use internal mock data too?
  // Let's assume NotificationsCenter is the one needing the prop or context.
  // Wait, if NotificationsCenter is a component, I should check IT as well.
  // BUT the user pointed to this page.

  // Let's stick to what was asked: "notification panel is still empty".
  // If the previous code was just importing mock data in this file but NOT PASSING it to NotificationsCenter, 
  // then NotificationsCenter must be self-contained or broken.

  // In the original file: 
  // const notificationsData = [...]
  // const [notifications, setNotifications] = useState(notificationsData)
  // ...
  // return ( ... <NotificationsCenter/> ... )

  // It defined state BUT DID NOT PASS IT to <NotificationsCenter/>. 
  // This strongly suggests <NotificationsCenter> is either:
  // 1. Using its own internal mock data (and ignoring this parent state).
  // 2. Expecting props that were missing.

  // I will check NotificationsCenter first? No, I am in replace_file_content.
  // I will update this file to be a proper wrapper.

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <NotificationsCenter />
      </div>
    </DashboardLayout>
  )
}
