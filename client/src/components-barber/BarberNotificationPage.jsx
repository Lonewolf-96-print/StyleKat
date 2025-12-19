"use client"

import { Clock, Bell, Trash2 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Badge } from "../components/ui/badge"
import { useBarberNotifications } from "../contexts/BarberNotificationContext"

export function BarberNotificationPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useBarberNotifications()

  return (
    <Card className="w-full max-w-xl mx-auto rounded-2xl border bg-white shadow-sm">
      {/* ---------- HEADER ---------- */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-5 w-5 text-blue-600" />
          Notifications
        </CardTitle>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700">
              {unreadCount} new
            </Badge>
          )}
          <button
            onClick={markAllAsRead}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Mark all read
          </button>
        </div>
      </CardHeader>

      {/* ---------- LIST ---------- */}
      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="max-h-[420px] pr-2">
            <div className="space-y-2">
              {notifications.map((notif) => {
                const isUnread = !notif.read

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`
                      group relative cursor-pointer rounded-xl border px-4 py-3
                      transition
                      ${isUnread
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    {/* Unread indicator */}
                    {isUnread && (
                      <span className="absolute left-2 top-4 h-2 w-2 rounded-full bg-blue-600" />
                    )}

                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {notif.type === "newBookingRequest"
                            ? "New Booking"
                            : notif.title || "Booking Update"}
                        </p>

                        <p className="mt-0.5 text-sm text-gray-600">
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Delete (hover only) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notif.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
