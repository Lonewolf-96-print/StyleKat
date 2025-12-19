"use client"

import { Clock, Bell, Trash2, Check, X } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Badge } from "../components/ui/badge"
import { useBarberNotifications } from "../contexts/BarberNotificationContext"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"

export function BarberNotificationPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useBarberNotifications()

  return (
    <Card className="w-full max-w-[400px] border-0 shadow-none">
      {/* ---------- HEADER ---------- */}
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full px-2 py-0.5 text-xs font-medium">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>

        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-transparent"
          >
            Mark all read
          </Button>
        )}
      </CardHeader>

      {/* ---------- LIST ---------- */}
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">
              You have no new notifications at the moment.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => {
                const isUnread = !notif.read;
                const isBooking = notif.type === "newBookingRequest" || notif.title?.toLowerCase().includes("booking");

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "group relative flex gap-4 px-4 py-4 transition-colors hover:bg-gray-50 cursor-pointer",
                      isUnread ? "bg-blue-50/30" : "bg-white"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 index-0 rounded-full flex items-center justify-center mt-1",
                      isBooking ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {isBooking ? <Clock className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-none", isUnread ? "text-gray-900" : "text-gray-700")}>
                          {notif.type === "newBookingRequest"
                            ? "New Booking Request"
                            : notif.title || "Notification"}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className={cn("text-sm w-[90%] line-clamp-2", isUnread ? "text-gray-800" : "text-gray-500")}>
                        {notif.message}
                      </p>

                      {/* Action Preview (Optional - e.g. "From Naitik") */}
                      {notif.data && (
                        <div className="pt-1 flex flex-wrap gap-2">
                          {/* Add badges or chips here if we have booking details */}
                        </div>
                      )}

                    </div>

                    {/* Hover Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="Remove notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Unread Dot */}
                    {isUnread && (
                      <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-blue-600" />
                    )}
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
