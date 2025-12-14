import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  duration: Number,
  category: String,
  isActive: { type: Boolean, default: true },
});

const shopSchema = new mongoose.Schema({
  name: String,
  city: String,
  address: String,
  services: [serviceSchema],
});

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
