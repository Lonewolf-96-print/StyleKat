import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barberId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Barber",
  required: true
},
  description: String,
  price: { type: Number, required: true },
  duration: Number,
  category: String,
  isActive: { type: Boolean, default: true },
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;
