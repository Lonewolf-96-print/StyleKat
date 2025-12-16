import express from "express";
import Staff from "../model/Staff.model.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();

// ✅ GET all staff for a specific barber
router.get("/", protect, async (req, res) => {
  try {
    const barberId = req.barber._id;
    const staff = await Staff.find({ barberId })

    res.json(staff);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});
router.get("/debug", protect, async (req, res) => {
  const staff = await Staff.find({ barberId: req.barber._id });
  res.json({ barberId: req.barber._id, count: staff.length, staff });
});
// ✅ Add new staff member
router.post("/", protect, async (req, res) => {
  try {
    const barberId = req.barber._id;  // <-- critical
    //console.log("📥 New staff data:", req.body);
    const {
      name,
      role,
      phone,
      email,
      startTime,
      endTime,
      isActive,
      selectedServices,
      selectedDays,
      notes,
    } = req.body;
    const workingHours = `${startTime} - ${endTime}`;
    const newStaff = await Staff.create({
      barberId,
      name,
      role,
      phone,
      email,
      isActive,
      services: selectedServices,
      workingDays: selectedDays,
      workingHours,
      notes,
    });

    res.status(201).json({ message: "Staff added successfully", staff: newStaff });
  } catch (err) {
    console.error("❌ Error creating staff:", err);
    res.status(500).json({ message: "Server error while creating staff" });
  }
});

// ✅ Update staff
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ message: "Failed to update staff" });
  }
});

// ✅ Delete staff
router.delete("/:id", protect, async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff removed successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: "Failed to delete staff" });
  }
});

// ✅ Public route: Get all staff for a specific shop (no auth)
router.get("/public/:barberId", async (req, res) => {

  try {

    //console.log("📥 Public staff request for user:", req.params.barberId);
    const { barberId } = req.params;

    const staffList = await Staff.find({ barberId, isActive: true })

    // 🧹 Clean sensitive data manually
    const publicStaff = staffList.map((staff) => ({
      _id: staff._id,
      name: staff.name,
      role: staff.role,
      services: staff.services,
      workingDays: staff.workingDays,
      workingHours: staff.workingHours,
      isActive: staff.isActive,
      ratings: staff.rating,
    }));

    //console.log(`✅ Sent ${publicStaff.length} sanitized staff records`);
    //console.log("📤 STAFF FOUND:", staffList);
    res.json(publicStaff);
    //console.log("Public staff sent to the client.",publicStaff);
  } catch (err) {
    console.error("❌ Error fetching public staff:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});



export default router;
