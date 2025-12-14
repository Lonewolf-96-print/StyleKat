// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    
    shopId: {
      type: String,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 30, // safe fallback
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
     
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      staffName: { type: String, trim: true },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled","in-service","barber_deleted"], // ✅ safer
      default: "pending",
    },
      barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
  }
);

export default mongoose.model("Booking", bookingSchema);
