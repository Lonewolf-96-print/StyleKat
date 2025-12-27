import express from "express";
import Barber from "../model/Barber.model.js";

const router = express.Router();

// ✅ Get single barber (shop) details
router.get("/:id", async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id)
      .select("-password")
      .populate("services");

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

// ✅ Update barber details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Safety check: don't allow password update via this route if unrelated
    delete updates.password;

    const updated = await Barber.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Barber not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating barber:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// ✅ Update barber preferences
router.put("/:id/preferences", async (req, res) => {
  try {
    const { id } = req.params;
    const { notificationPreferences } = req.body;

    const updated = await Barber.findByIdAndUpdate(
      id,
      { notificationPreferences },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Barber not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
