// routes/shopRoutes.js

import express from "express";
import Shop from "../model/Shop.model.js";
import Booking from "../model/Booking.model.js";
import Staff from "../model/Staff.model.js";
import Barber from "../model/Barber.model.js";

const Router = express.Router();

/* ---------------------------------------------------------
   1) LIVE STATE (GET)
--------------------------------------------------------- */


/* ---------------------------------------------------------
   2) SEARCH SHOPS BY CITY (POST)
--------------------------------------------------------- */
Router.get("/:city", async (req, res) => {
  const city = req.city || "";

  try {
    const shops = await Barber.find({
      address: { $regex: city, $options: "i" }
    });

    return res.json(shops);

  } catch (err) {
    console.error("❌ Error in /by-city:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   3) SHOP LIST (POST)
--------------------------------------------------------- */
Router.post("/search", async (req, res) => {
  const q = req.query.q || "";

  try {
    const shops = await Shop.find({
      name: { $regex: q, $options: "i" }
    }).populate("services");

    return res.json(shops);

  } catch (err) {
    console.error("❌ Error in /search:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   EXPORT
--------------------------------------------------------- */
export default Router;
