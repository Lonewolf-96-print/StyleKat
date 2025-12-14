import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import { useNotifications } from "../contexts/UserNotificationsContext";
import NotificationCard from "../components/NotificationCard";

const UserNotificationPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [notificationOpen, setNotificationOpen] = useState(true);

  // Filter user-specific notifications (if needed)
  const userNotifications = notifications.filter(
    (n) => n.type === "bookingStatusUpdate"
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 items-center">
          <User className="text-blue-600 w-6 h-6" />
          <h2 className="text-xl font-bold">Your Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Mark all read
          </button>
        )}
      </div>

      {userNotifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Bell className="mx-auto mb-4 w-12 h-12 opacity-40" />
          No notifications yet 🎉
        </div>
      ) : (
        userNotifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            isBarber={false}
          />
        ))
      )}
    </div>
  );
};

export default UserNotificationPage;
