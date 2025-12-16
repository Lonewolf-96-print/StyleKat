import express from "express";
import Barber from "../model/Barber.model.js";
import { protect } from "../middleware/auth.middleware.js";
import { barberSignup, barberLogin, logout } from "../controllers/auth.controller.js"
import { OAuth2Client } from "google-auth-library"
import { googleLoginBarber, googleLoginUser } from "../controllers/google.controller.js";
const Router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

Router.post("/signup/barber", barberSignup)
Router.post("/login/barber", barberLogin)
Router.get("/me", protect, async (req, res) => {
  try {
    //  console.log("🔥 Reached getBarberDetails");
    //  console.log("Authorized barber:", req.barber?._id);
    const barber = await Barber.findById(req.barber._id).select("-password");
    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    res.status(200).json(
      barber,
    );

  } catch (err) {
    console.error("Error fetching barber info:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

Router.post("/google-login/barber", googleLoginBarber);
Router.put("/me", protect, async (req, res) => {
  try {
    const updates = req.body;
    // console.log("Updated fields received:", updates);

    // Map frontend to backend fields
    const normalizedUpdates = {
      salonName: updates.salonName,
      ownerName: updates.ownerName,
      address: updates.address,
      city: updates.city,
      website: updates.website || "",
      phoneNumber: updates.phone,
      email: updates.email,
    };

    // ⭐ ADD THIS: Save coordinates if provided
    if (updates.coords) {
      normalizedUpdates.coordinates = {
        lat: Number(updates.coords.lat),
        lng: Number(updates.coords.lng),
      };
    }

    // Clean undefined fields
    Object.keys(normalizedUpdates).forEach(
      (key) => normalizedUpdates[key] === undefined && delete normalizedUpdates[key]
    );

    const updatedBarber = await Barber.findByIdAndUpdate(
      req.barber._id,
      normalizedUpdates,
      { new: true }
    ).select("-password");

    if (!updatedBarber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    // console.log("✅ Barber updated:", updatedBarber._id);
    // console.log("Updated barber info:", updatedBarber);

    res.status(200).json(updatedBarber);

  } catch (error) {
    console.error("❌ Error updating barber info:", error.message);
    res.status(500).json({ message: "Server error updating barber info" });
  }
});



Router.post("/logout", logout)
Router.post("/google-login", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user = {
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      googleId: payload.sub,
    };
    res.status(200).json({ user })
  } catch (err) {
    res.status(400).json({ error: "Invalid token" })
  }
})

export default Router;