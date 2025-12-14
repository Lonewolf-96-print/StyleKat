"use client"

import { useState } from "react"
import { useBarberStore } from "../lib/store"

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, markNotificationRead, clearNotifications } = useBarberStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notificationId) => {
    markNotificationRead(notificationId)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM11 19H6.414a1 1 0 01-.707-.293L4 17V6a3 3 0 013-3h10a3 3 0 013 3v5"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={clearNotifications} className="text-sm text-blue-600 hover:text-blue-700">
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{notification.type === "new_booking" ? "📅" : "🔄"}</span>
                        <span className="font-medium text-gray-900">
                          {notification.type === "new_booking" ? "New Booking Request" : "Booking Update"}
                        </span>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {notification.booking.customerName} - {notification.booking.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.booking.date} at {notification.booking.time}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(notification.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
