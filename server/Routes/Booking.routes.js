// Routes/Booking.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Booking from "../model/Booking.model.js";
import Staff from "../model/Staff.model.js";
import User from "../model/User.model.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { blockedTimesStore } from "../server.js";
import { protectUser } from "../middleware/user.middleware.js";

dayjs.extend(customParseFormat);

const router = express.Router();
const DEFAULT_DURATION_MIN = 30;

/**
 * parseDateTime(dateStr, timeStr)
 * - Accepts: dateStr "YYYY-MM-DD" and timeStr in any common formats:
 *   - "hh:mm A" (12h with AM/PM)
 *   - "HH:mm" (24h)
 *   - "h:mm" or "hh:mm" (best-effort)
 * Returns a dayjs instance or null.
 */
function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  // Normalize whitespace
  const t = String(timeStr).trim();

  // Try the most specific formats first (strict)
  const tries = [
    "YYYY-MM-DD hh:mm A", // "2025-12-02 09:40 PM"
    "YYYY-MM-DD h:mm A",
    "YYYY-MM-DD HH:mm",   // "2025-12-02 21:40"
    "YYYY-MM-DD H:mm",
    "YYYY-MM-DD hh:mm",   // fallbacks (no AM/PM)
    "YYYY-MM-DD h:mm",
  ];

  for (const fmt of tries) {
    const parsed = dayjs(`${dateStr} ${t}`, fmt, true);
    if (parsed.isValid()) return parsed;
  }

  // Last-ditch: try Date constructor (non-strict)
  const fallback = dayjs(new Date(`${dateStr}T${t}`));
  return fallback.isValid() ? fallback : null;
}

/**
 * isTimeBlocked(...) — check blockedTimesStore collisions
 * - block times stored as { startTime: "HH:mm", endTime: "HH:mm" } (24h strings)
 * - uses dayjs to compare full date+time
 */
function isTimeBlocked(store, staffId, date, time, durationMin = DEFAULT_DURATION_MIN) {
  if (!staffId || !date || !time) return false;
  if (!store || !store[staffId] || !store[staffId][date]) return false;

  const start = parseDateTime(date, time);
  if (!start) return false;
  const end = start.add(durationMin, "minute");

  // If booking fully in past, ignore blocking here (client-side should prevent this earlier)
  if (end.isBefore(dayjs())) return false;

  return store[staffId][date].some((block) => {
    // block.startTime / endTime may be "HH:mm" or "HH:mm:ss" — try parsing them via parseDateTime
    const bStart = parseDateTime(date, block.startTime);
    const bEnd = block.endTime ? parseDateTime(date, block.endTime) : (bStart ? bStart.add(DEFAULT_DURATION_MIN, "minute") : null);

    if (!bStart || !bEnd) return false;

    // overlap if start < bEnd && end > bStart
    return start.isBefore(bEnd) && end.isAfter(bStart);
  });
}

/* ---------------------------
   GET /api/bookings
---------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    let bookings = [];

    if (req.barber) {
      bookings = await Booking.find({
        barberId: req.barber._id,
        status: { $ne: "barber_deleted" },
      }).sort({ createdAt: -1 }).lean();
    } else if (req.user) {
      bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    }

    // dedupe by _id just in case
    const unique = Array.from(new Map(bookings.map((b) => [String(b._id), b])).values());
    return res.json(unique);
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------
   POST /api/bookings (create booking)
---------------------------- */
router.post("/request", protectUser, async (req, res) => {
  try {
    const {
      id,
      shopId,
      shopName,
      barberId,
      staffId: reqStaffId,
      staffName,
      customerName,
      customerPhone,
      service,
      price,
      date,
      time,
      userId, // optional
      duration: requestedDuration,
    } = req.body;

    // required fields
    if (!customerName || !customerPhone || !service || !date || !time) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    // Prevent duplicate creation by client id
    const existing = await Booking.findOne({ id }).lean();
    if (existing) {
      return res.status(200).json({ message: "Booking already exists", booking: existing });
    }

    // duration (minutes)
    const duration = Number(requestedDuration) || DEFAULT_DURATION_MIN;

    // parse start/end
    const startDt = parseDateTime(date, time);
    if (!startDt || !startDt.isValid()) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }
    const endDt = startDt.add(duration, "minute");

    // no past bookings
    if (endDt.isBefore(dayjs())) {
      return res.status(400).json({ message: "Cannot create booking in the past" });
    }

    // pick staff (explicit or auto)
    let staffId = reqStaffId;
    if (!staffId) {
      const staffList = await Staff.find({ barberId }).lean();
      if (!staffList.length) {
        return res.status(400).json({ message: "No staff available to assign" });
      }

      // bookings for this barber on the same date (relevant statuses)
      const todaysBookings = await Booking.find({
        barberId,
        date,
        status: { $in: ["pending", "confirmed", "accepted", "ongoing", "in-service"] },
      }).lean();

      // compute light load map and pick least-loaded staff
      const loadMap = staffList.map((s) => {
        const count = todaysBookings.filter((b) => String(b.staffId) === String(s._id)).length;
        return { staffId: s._id, count };
      });

      loadMap.sort((a, b) => a.count - b.count);
      staffId = loadMap[0].staffId;
    }

    // Ensure blockedTimesStore slots exist
    if (!blockedTimesStore[staffId]) blockedTimesStore[staffId] = {};
    if (!blockedTimesStore[staffId][date]) blockedTimesStore[staffId][date] = [];

    // Check in-memory blocked times first
    if (isTimeBlocked(blockedTimesStore, staffId, date, time, duration)) {
      return res.status(400).json({ message: "This time slot is already blocked or booked" });
    }

    // Final DB-level overlap check using startTime/endTime Date fields if present
    const startISO = startDt.toDate();
    const endISO = endDt.toDate();

    const overlapping = await Booking.findOne({
      staffId,
      date,
      status: { $nin: ["cancelled", "completed", "barber_deleted"] },
      $or: [
        // existing booking with Date start/end
        { startTime: { $lt: endISO }, endTime: { $gt: startISO } },
        // additional checks could go here if your DB stores only string times
      ],
    }).lean();

    if (overlapping) {
      return res.status(400).json({ message: "Overlapping booking exists (server-side check)" });
    }

    // Build and save booking (store startTime/endTime as Date objects)
    const bookingDoc = new Booking({
      id,
      shopId,
      shopName,
      barberId,
      staffId,
      staffName,
      customerName,
      customerPhone,
      service,
      price,
      duration,
      date,
      time,
      startTime: startISO,
      endTime: endISO,
      userId: req.user?._id || userId,
      status: "pending",
    });

    const saved = await bookingDoc.save();
    // console.log("✅ Booking saved to DB:", saved._id);

    // Update in-memory blockedTimesStore (store HH:mm 24h strings)
    blockedTimesStore[staffId][date].push({
      startTime: startDt.format("HH:mm"),
      endTime: endDt.format("HH:mm"),
    });

    // Emit block to staff (strings only)
    req.io.to(`staff-${staffId}`).emit("bookingTime:blocked", {
      staffId,
      date,
      startTime: startDt.format("HH:mm"),
      endTime: endDt.format("HH:mm"),
    });

    // Build queue payload (get active staff list)
    const staffListLive = await Staff.find({ barberId, isActive: true }).lean();

    const todaysBookingsForQueue = await Booking.find({
      barberId,
      date,
      status: { $in: ["pending", "confirmed", "accepted", "ongoing", "in-service"] },
    })
      .lean()
      .sort({ startTime: 1 });

    const queueData = staffListLive.map((s) => {
      const items = todaysBookingsForQueue.filter((b) => String(b.staffId) === String(s._id));
      return {
        barberId,
        staffId: s._id,
        staffName: s.name,
        current: items[0] || null,
        queue: items.slice(1),
      };
    });

    // Sockets — emit consistently
    const shopRoom = `shop-${shopId}`;
    const userRoom = `user-${saved.userId}`;

    // main emits used by frontend (kept same names as earlier)
    req.io.to(shopRoom).emit("queueUpdated", queueData);
    req.io.to(shopRoom).emit("newBookingRequest", saved);
    req.io.to(`staff-${staffId}`).emit("staff:bookingAdded", saved);
    if (saved.userId) req.io.to(userRoom).emit("user:bookingCreated", saved);
    req.io.to(shopRoom).emit("booking:new", saved);

    // console.log("✅ Booking created and emitted:", saved._id);
    return res.status(201).json({ message: "Booking created successfully", booking: saved });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    return res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
});

/* ---------------------------
   GET /api/bookings/my  (user)
---------------------------- */
router.get("/my", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const hidden = user.userHiddenBookings || [];
    const bookings = await Booking.find({ userId: req.user._id, _id: { $nin: hidden } }).sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------------------
   DELETE /my/:id (cancel)
---------------------------- */
router.delete("/my/:id", protectUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled",
      });
    }

    if (String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot cancel others' bookings" });
    }

    // ✅ Extract from DB (NOT req.body)
    const { staffId, date, startTime, endTime } = booking;

    /* -----------------------------
       UNBLOCK TIME SLOT (SAFE)
    ------------------------------ */
    if (
      staffId &&
      date &&
      blockedTimesStore[staffId] &&
      blockedTimesStore[staffId][date]
    ) {
      blockedTimesStore[staffId][date] =
        blockedTimesStore[staffId][date].filter(
          (b) =>
            !(
              b.startTime === dayjs(startTime).format("HH:mm") &&
              b.endTime === dayjs(endTime).format("HH:mm")
            )
        );
    }

    /* -----------------------------
       UPDATE STATUS
    ------------------------------ */
    booking.status = "cancelled";
    await booking.save();
    /* -----------------------------
   RECOMPUTE QUEUE AFTER CANCEL
------------------------------ */
    const todayStr = booking.date;

    // Fetch active staff
    const staffListLive = await Staff.find({
      barberId: booking.barberId,
      isActive: true,
    }).lean();

    // Fetch today's active bookings (EXCLUDING cancelled)
    const todaysBookings = await Booking.find({
      barberId: booking.barberId,
      date: todayStr,
      status: {
        $in: ["pending", "confirmed", "accepted", "ongoing", "in-service"],
      },
    })
      .lean()
      .sort({ startTime: 1 });

    // Build queue per staff
    const queueData = staffListLive.map((staff) => {
      const staffBookings = todaysBookings.filter(
        (b) => String(b.staffId) === String(staff._id)
      );

      return {
        barberId: booking.barberId,
        staffId: staff._id,
        staffName: staff.name,
        current: staffBookings[0] || null,
        queue: staffBookings.slice(1),
      };
    });

    /* -----------------------------
       SOCKET EMITS
    ------------------------------ */
    const shopRoom = `shop-${booking.shopId}`;
    const userRoom = `user-${booking.userId}`;
    const staffRoom = staffId ? `staff-${staffId}` : null;


    const payload = booking.toObject();
    req.io.to(shopRoom).emit("bookingStatusUpdate", payload);

    req.io.to(shopRoom).emit("queueUpdated", queueData);
    if (userRoom) {
      req.io.to(userRoom).emit("bookingStatusUpdate", booking);
    }
    if (staffRoom) {
      req.io.to(staffRoom).emit("bookingTime:unblocked", {
        staffId,
        date,
        startTime: dayjs(startTime).format("HH:mm"),
        endTime: dayjs(endTime).format("HH:mm"),
      });
    }

    return res.json({
      success: true,
      message: "Booking cancelled",
      booking,
    });
  } catch (err) {
    console.error("❌ Cancel booking error:", err);
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
});


/* ---------------------------
   Other routes (delete/permanent/archive/status/today) — unchanged except emits kept consistent
---------------------------- */
router.delete("/my/:id/permanent", protectUser, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.userId) !== String(req.user._id)) return res.status(403).json({ message: "Not your booking" });
    if (booking.status !== "cancelled") return res.status(400).json({ message: "You can only delete bookings that are cancelled" });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { userHiddenBookings: bookingId } });
    const shopRoom = `shop-${booking.shopId}`;
    const userRoom = `user-${booking.userId}`;
    const payload = booking.toObject();
    req.io.to(shopRoom).emit("bookingStatusUpdate", payload);
    req.io.to(userRoom).emit("bookingStatusUpdate", payload);

    return res.json({ success: true, message: "Booking deleted from user view only", _id: bookingId });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete booking" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    if (!req.barber) return res.status(403).json({ message: "Only barbers can delete bookings" });
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "barber_deleted";
    await booking.save();
    req.io.to(`shop-${booking.shopId}`).emit("bookingStatusUpdate", booking);
    req.io.to(`user-${booking.userId}`).emit("bookingStatusUpdate", booking);
    return res.json({ success: true, message: "Booking archived for barber", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to archive booking" });
  }
});

router.put("/status/:id", protect, async (req, res) => {
  try {
    if (!req.barber) return res.status(403).json({ message: "Only barbers can update booking status" });
    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be updated",
      });
    }

    const { id } = req.params;
    const { status, staffId } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    if (status === "confirmed" || status === "accepted") {
      if (!staffId) return res.status(400).json({ message: "Staff ID required for confirmation" });
      booking.staffId = staffId;
    }
    await booking.save();
    if (booking.status !== "barber_deleted") req.io.to(`user-${booking.userId}`).emit("bookingStatusUpdate", booking);
    req.io.to(`shop-${booking.shopId}`).emit("bookingStatusUpdate", booking);
    return res.json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update booking status" });
  }
});

router.get("/today", protect, async (req, res) => {
  try {
    if (!req.barber) return res.status(403).json({ message: "Only barbers can fetch today's bookings" });
    const todayStr = new Date().toISOString().split("T")[0];
    const todaysBookings = await Booking.find({
      barberId: req.barber._id,
      date: todayStr,
      status: { $nin: ["cancelled", "completed"] },
    }).sort({ time: 1 }).lean();
    return res.json(todaysBookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

export default router;
