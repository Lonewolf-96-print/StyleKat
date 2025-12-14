import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
  method: { type: String, required: true },
  enabled: { type: Boolean, default: true },
});

export default mongoose.model("PaymentMethod", paymentMethodSchema);
