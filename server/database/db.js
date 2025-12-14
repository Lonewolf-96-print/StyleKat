import mongoose from "mongoose";
import dotenv from "dotenv"
import Booking from "../model/Booking.model.js";
dotenv.config();

export const connectData=async() =>{
   const DB_URI = process.env.MONGO_URI;
    try{
    const connect = await mongoose.connect(DB_URI)
    console.log("Database connected successfully")

}catch(error){
    console.error("Error connecting Database",error.message)
}
}
export async function dropIdIndexIfExists() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const indexes = await Booking.collection.indexes();
    const idIndex = indexes.find(index => index.name === "id_1");

    if (idIndex) {
      await Booking.collection.dropIndex("id_1");
      console.log("✅ Dropped duplicate id index");
    } else {
      console.log("ℹ️ Index id_1 does not exist, nothing to drop");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error dropping index:", err);
  }
}