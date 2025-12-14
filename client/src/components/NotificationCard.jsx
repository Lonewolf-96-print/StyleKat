import React from "react";
import { X, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const NotificationCard = ({ notification, onMarkRead, onDelete, isBarber }) => {
  const {
    id,
    message,
    type,
    read,
    createdAt,
    customerName,
    customerPhone,
    service,
    shopName,
    date,
    time,
    status,
    data,
  } = notification;

  // Format the date nicely
  const formatTime = (t) =>
    new Date(t).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });

   const renderNotificationDetails = () => {
    // 🧾 Booking-related notifications
    if (
      [
        "newBookingRequest",
        "bookingUpdated",
        "bookingCancelled",
        "bookingCompleted",
        "bookingStatusUpdate",
      ].includes(type)
    ) {
      return isBarber ? (
        <>
          <p>
            <span className="font-medium">{customerName}</span> requested{" "}
            <span className="font-medium">{service}</span>
          </p>
          <p>📅 {date} at {time}</p>
          <p>📞 {customerPhone}</p>
        </>
      ) : (
        <>
          <p>
            Your booking with{" "}
            <span className="font-medium">{shopName}</span> for{" "}
            <span className="font-medium">{service}</span> has been{" "}
            <span
              className={`font-semibold ${
                status === "accepted"
                  ? "text-green-600"
                  : status === "rejected"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {status}
            </span>
            .
          </p>
          <p>📅 {date} at {time}</p>
        </>
      );
    }

    // 💈 Service update notifications
    if (["serviceAdded", "serviceUpdated", "serviceRemoved"].includes(type)) {
      return (
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium flex items-center gap-1">
            <Scissors size={16} className="text-purple-600" />
            {type === "serviceAdded" && `New service added:`}
            {type === "serviceUpdated" && `Service updated:`}
            {type === "serviceRemoved" && `Service removed:`}
          </p>

          {data && (
            <div className="pl-5 text-gray-700">
              <p>
                <strong>Name:</strong> {data.name || "N/A"}
              </p>
              {"price" in data && (
                <p>
                  <strong>Price:</strong> ₹{data.price}
                </p>
              )}
              {"duration" in data && (
                <p>
                  <strong>Duration:</strong> {data.duration} mins
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    // 🏪 Shop or staff profile updates
    if (["shopUpdated", "staffUpdated", "profileUpdated"].includes(type)) {
      return (
        <p className="text-sm text-gray-600">
          {message || "Your profile/shop details were updated."}
        </p>
      );
    }

    // 🔔 Default fallback
    return <p className="text-sm text-gray-600">{message}</p>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`p-4 mb-3 rounded-xl shadow-sm border ${
        read ? "bg-gray-50 border-gray-200" : "bg-white border-blue-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Title */}
          <h4 className="font-semibold text-gray-800 mb-1 capitalize">
            {type.replace(/([A-Z])/g, " $1")}
          </h4>

          {/* Dynamic content */}
          {renderNotificationDetails()}

          {/* Time */}
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Clock size={14} /> {formatTime(createdAt || Date.now())}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 ml-4">
          {!read && (
            <button
              onClick={() => onMarkRead(id)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Mark as Read"
            >
              <CheckCircle size={18} />
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default NotificationCard;
