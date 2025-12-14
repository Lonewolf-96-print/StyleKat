import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
  name: String,
  role: String,
  phone: String,
  email: String,
  isActive: { type: Boolean, default: true },
  joinDate: { type: Date, default: Date.now },
  services: [String],
  workingHours: String,
  workingDays: [String],
  rating: { type: Number, default: 0 },
});

export default mongoose.model("Staff", staffSchema);
