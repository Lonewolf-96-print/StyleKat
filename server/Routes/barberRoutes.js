import express from "express";
import Barber from "../model/Barber.model.js";

const router = express.Router();

// ✅ Get single barber (shop) details
router.get("/:id", async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id).select("-password");

    // console.log("Barber fetched:", barber);
    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    res.status(200).json(
      barber,
    );

  } catch (error) {
    console.error("Error fetching barber:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
