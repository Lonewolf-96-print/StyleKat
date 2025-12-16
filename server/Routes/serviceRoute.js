import express from "express";
import { updateService, toggleServiceStatus, deleteService, getAllServices, createService } from "../controllers/serviceController.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();
import Service from "../model/Service.js";
import Barber from "../model/Barber.model.js";
// PUT → Edit service details
router.get("/", protect, async (req, res) => {

  try {
    if (!req.barber) {
      return res.status(401).json({ message: "Barber not authorized" });
    }
    // console.log("✅ Barber verified:", req.barber._id);
    const barberId = req.barber._id; // ✅ comes from token
    const services = await Service.find({ barberId });
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});
// Get public services for a barber (no auth required)
router.get("/public/:barberId", async (req, res) => {
  // console.log("🔥 Reached public services endpoint");
  // console.log("📥 Public services request for user:", req.params.barberId);
  const { barberId } = req.params;

  if (!barberId || barberId === "undefined") {
    return res.status(400).json({ message: "Invalid or missing barberId" });
  }
  try {
    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ message: "Barber not found" });

    const services = await Service.find({ barberId, isActive: true }).select(
      "name price duration category description"
    );

    if (!services || services.length === 0) {
      return res.status(404).json({ message: "No services found for this barber" });
    }

    res.json(services);
  } catch (err) {
    console.error("Error fetching public services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

router.put("/:barberId", protect, updateService);
router.post("/", protect, createService);

// PATCH → Toggle active/inactive status
router.patch("/:serviceId/toggle", toggleServiceStatus);

// DELETE → Delete service
router.delete("/:serviceId", deleteService);

export default router;
