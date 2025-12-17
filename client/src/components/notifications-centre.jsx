"use client";

import { Bell, Trash2, Check, X, CalendarCheck, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNotifications } from "../contexts/UserNotificationsContext";
import { useCustomer } from "../contexts/CustomerContext";
import { useApp } from "../contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
export function NotificationsCenter() {
  const {
    notifications,
    deleteNotification,
    markAllAsRead,
    markAsRead,
    markAsUnread,
    clearAll,
  } = useNotifications();
  const { navigate } = useApp()
  const { customer } = useCustomer();
  const unreadCount = notifications.filter((n) => !n.read).length;
  console.log("Notifications recieved", notifications)
  if (!customer) return null;
  function capitalize(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // --- BADGE SYSTEM --- //
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pending", className: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-200" };

      case "confirmed":
        return { label: "Confirmed", className: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200" };

      case "in-service":
        return { label: "Started", className: "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200" };

      case "completed":
        return { label: "Completed", className: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };

      case "cancelled":
        return { label: "Cancelled", className: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200" };

      case "rejected":
        return { label: "Rejected", className: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200" };

      case "user:bookingCreated":
        return { label: "Request Sent", className: "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200" };

      default:
        return { label: capitalize(status), className: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "bookingStatusUpdate":
      case "booking":
        return <CalendarCheck className="w-5 h-5" />;
      case "reminder":
        return <AlertCircle className="w-5 h-5" />;
      case "newBookingRequest":
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-0 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your bookings and alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full animate-pulse">
              {unreadCount} Unread
            </span>
          )}
          <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
          <Button size="sm" variant="ghost" onClick={markAllAsRead} disabled={unreadCount === 0} className="text-muted-foreground hover:text-primary">
            Mark all read
          </Button>
          <Button size="sm" variant="ghost" onClick={clearAll} disabled={notifications.length === 0} className="text-muted-foreground hover:text-destructive">
            Clear all
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
              <p className="text-muted-foreground max-w-sm mt-1">You have no new notifications involved.</p>
            </motion.div>
          ) : (
            notifications.map((n) => (
              <motion.div
                layout
                key={n.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`
                        group relative p-5 rounded-2xl border transition-all duration-200
                        ${n.read
                    ? "bg-white border-gray-100 hover:border-gray-200"
                    : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50 shadow-sm"
                  }
                    `}
              >
                {/* Unread Indicator */}
                {!n.read && (
                  <div className="absolute left-0 top-6 bottom-6 w-1 bg-blue-500 rounded-r-full"></div>
                )}

                <div className="flex gap-5">
                  {/* Icon Box */}
                  <div className={`
                            shrink-0 h-12 w-12 rounded-xl flex items-center justify-center
                            ${n.read ? "bg-gray-100 text-gray-500" : "bg-white text-primary shadow-sm ring-1 ring-gray-100"}
                        `}>
                    {getTypeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-1">
                      <h3 className={`text-base font-semibold ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                        {n.type === "bookingStatusUpdate" ? "Booking Update" : n.type === "user:bookingCreated" ? "Request Sent" : capitalize(n.type)}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(n.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {n.status === "confirmed" && "Your booking has been confirmed!"}
                        {/* Fallback or specific messages could go here if the backend sent a 'message' field */}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {(() => {
                          const badge = getStatusBadge(n.status);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}

                        {(n.customerName || n.time) && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border">
                            {n.customerName && <span>{n.customerName}</span>}
                            {n.customerName && n.time && <span>•</span>}
                            {n.time && <span>{n.time}</span>}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => n.type === "newBookingRequest" ? navigate("/bookings") : navigate("/my-bookings")}
                      >
                        View Details
                      </Button>

                      <div className="ml-auto flex gap-1">
                        {!n.read ? (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => markAsRead(n.id)} title="Mark as read">
                            <Check className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-gray-600" onClick={() => markAsUnread(n.id)} title="Mark as unread">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(n.id)} title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
