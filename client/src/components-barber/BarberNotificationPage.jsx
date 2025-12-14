"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Badge } from "../components/ui/badge"
import { Bell, Clock } from "lucide-react"

import { useBarberNotifications } from "../contexts/BarberNotificationContext"

export function BarberNotificationPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useBarberNotifications()

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg rounded-2xl border border-border/40 bg-background/80 backdrop-blur-sm">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="h-5 w-5 text-primary" /> Notifications
        </CardTitle>
        <div className="flex gap-2">
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} New</Badge>}
          <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:underline">Mark all read</button>
        </div>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No notifications yet
          </p>
        ) : (
          <ScrollArea className="max-h-[400px] space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border transition ${notif.read ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{notif.type === 'newBookingRequest' ? 'New Booking' : notif.title || 'Update'}</p>
                  {/* <Badge>{notif.status || 'Info'}</Badge> */}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {new Date(notif.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
