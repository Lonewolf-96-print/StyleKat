// server.js (fixed)
import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { connectData, dropIdIndexIfExists } from "./database/db.js";
import authRouter from "./Routes/Auth.routes.js";
import bookingRouter from "./Routes/Booking.routes.js";
import serviceRoutes from "./Routes/serviceRoute.js";
import staffRouter from "./Routes/staff.routes.js";
import barberRoutes from "./Routes/barberRoutes.js";
import userRoutes from "./Routes/user.routes.js";
import shopRoutes from "./Routes/Shops.routes.js";
import dayjs from "dayjs";
import Barber from "./model/Barber.model.js";
import Booking from "./model/Booking.model.js";
import User from "./model/User.model.js";
import Staff from "./model/Staff.model.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "https://stylkat.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, mobile apps, curl, Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ❗ DO NOT throw error — just disallow silently
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 Explicit preflight handler (VERY IMPORTANT)
// Fixed: Use regex (.*) instead of * for Express 5 / path-to-regexp v3+
app.options(/(.*)/, cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

function getTodayString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // ✅ ONLY websocket
});


export const blockedTimesStore = {};
// attach io to req so routes can use req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* -------------------------
   Helpers
------------------------- */


/* ---------------------------------------------------------
   Socket Authentication & Connection
--------------------------------------------------------- */
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const barber = await Barber.findById(decoded.id).lean();
    const user = barber ? null : await User.findById(decoded.id).lean();

    if (barber) {
      socket.role = "barber";
      socket.barberId = barber._id.toString();
      socket.shopId = barber._id.toString(); // keep both names for clarity
      // don't auto-join rooms here if you want explicit join; but join is fine
      socket.join(`shop-${socket.shopId}`);
      // console.log(`💈 Barber authenticated & joined shop-${socket.shopId}`);
    }

    if (user) {
      socket.role = "user";
      socket.userId = user._id.toString();
      socket.join(`user-${socket.userId}`);
      // console.log(`🙋 User authenticated & joined user-${socket.userId}`);
    }

    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Token invalid"));
  }
});

/* ---------------------------------------------------------
   Queue broadcaster (matches booking schema: date/time strings)
   - Builds payload grouped by staff
   - Ensures booking.duration, startTime, endTime are present & normalized
   - Emits the payload to the shop room
--------------------------------------------------------- */
async function broadcastShopQueue(shopId, targetDate = null) {
  if (!shopId) return [];
  const findQuery = {
    shopId: shopId,
    status: { $in: ["pending", "confirmed", "accepted", "ongoing", "in-service"] }
  };
  // 1. Load all bookings for this shop (only relevant statuses)
  if (targetDate) {
    findQuery.date = targetDate; // "YYYY-MM-DD"
  }

  // Now fetch
  const bookings = await Booking.find(findQuery).lean();
  // 2. Load all staff of this shop
  const staffList = await Staff.find({ barberId: shopId }).lean();

  // Helper: build a normalized startTime (Date) from date + time strings
  const computeStartAndEndTimes = (b) => {
    // 1. If DB already has valid Date objects, use them!
    if (b.startTime && b.endTime) {
      const s = new Date(b.startTime);
      const e = new Date(b.endTime);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        return {
          startTime: s.toISOString(),
          endTime: e.toISOString()
        };
      }
    }

    // 2. Fallback: Parse from strings (using dayjs for consistency with routes)
    const durationNum = Number(b.duration ?? b.serviceDuration ?? 30);
    const dateStr = b.date; // "2025-12-02"
    const timeStr = b.time; // "09:40 PM"

    let start = dayjs(`${dateStr} ${timeStr}`, "YYYY-MM-DD hh:mm A");
    if (!start.isValid()) {
      // try simpler format
      start = dayjs(`${dateStr} ${timeStr}`);
    }

    if (!start.isValid()) {
      // Last resort fallback
      return {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + durationNum * 60000).toISOString(),
      };
    }

    const end = start.add(durationNum, "minute");

    return {
      startTime: start.toISOString(),
      endTime: end.toISOString()
    };
  };


  const payload = staffList.map((staff) => {
    // find bookings for this staff and normalize them
    const staffBookings = bookings
      .filter((b) => String(b.staffId) === String(staff._id))
      .map((b) => {
        const { startTime, endTime } = computeStartAndEndTimes(b);

        return {
          ...b,
          startTime,
          endTime,
        };
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const current = staffBookings[0] || null;
    const queue = staffBookings.slice(1);

    return {
      staffId: staff._id,
      staffName: staff.name,
      current,
      queue,
    };
  });

  // Emit payload to room (two event names used by frontend)
  try {
    io.to(`shop-${shopId}`).emit("shopQueueUpdate", { [shopId]: payload });
    io.to(`shop-${shopId}`).emit("queueUpdated", { [shopId]: payload });
  } catch (err) {
    console.error("Failed to emit queue for shop:", shopId, err);
  }

  return payload;
}



/* ---------------------------------------------------------
   Socket events
--------------------------------------------------------- */
io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id);

  /* ---------------------------------------------
     JOIN ROOMS
  --------------------------------------------- */
  socket.on("joinShopRoom", ({ barberId }) => {
    if (!barberId) return;
    socket.join(`shop-${barberId}`);
    // console.log("Joined shop room:", barberId);
  });

  socket.on("joinStaffRoom", (staffId) => {
    if (!staffId) return;
    socket.join(`staff-${staffId}`);
    // console.log("Joined staff room:", staffId);
  });

  socket.on("joinUserRoom", (userId) => {
    if (!userId) return;
    socket.join(`user-${userId}`);
    // console.log("Joined user room:", userId);
  });

  /* ---------------------------------------------
     NEW BOOKING (Socket Version)
  --------------------------------------------- */
  socket.on("newBookingRequest", async (bookingData) => {
    try {
      if (!bookingData.barberId || !bookingData.date) {
        return socket.emit("booking:error", { message: "Invalid booking data" });
      }

      const created = await Booking.create(bookingData);

      const shopRoom = `shop-${created.barberId}`;
      const staffRoom = `staff-${created.staffId}`;
      const userRoom = `user-${created.userId}`;

      // console.log("Created booking via SOCKET:", created._id);

      // 1️⃣ Staff time block (your existing logic)
      io.to(staffRoom).emit("staff:timeBlocked", {
        staffId: created.staffId,
        date: created.date,
        startTime: created.startTime,
        endTime: created.endTime
      });

      // 2️⃣ MATCH REST API → Emit newBookingRequest
      io.to(shopRoom).emit("newBookingRequest", created);

      // 3️⃣ MATCH REST API → Emit booking:new
      io.to(shopRoom).emit("booking:new", created);

      // 4️⃣ MATCH REST API → Emit user:bookingCreated
      if (created.userId) {
        io.to(userRoom).emit("user:bookingCreated", created);
      }

      // 5️⃣ MATCH REST API → Emit staff:bookingAdded
      io.to(staffRoom).emit("staff:bookingAdded", created);

      // 6️⃣ MATCH REST API → Emit queueUpdated
      // 6️⃣ Correct queue broadcast
      await broadcastShopQueue(created.barberId, created.date);

      // 7️⃣ WEB PUSH: Notify Barber
      await NotificationService.send(
        created.barberId,
        'barber',
        'New Booking Request',
        `New appointment from ${bookingData.customerName || 'Customer'}`,
        '/dashboard/bookings'
      );

    } catch (err) {
      // console.error("newBookingRequest error:", err);
      socket.emit("booking:error", { message: "Failed to create booking." });
    }
  });

  /* ---------------------------------------------
     UPDATE BOOKING STATUS (Socket Version)
  --------------------------------------------- */
  socket.on("updateBookingStatus", async ({ bookingId, status }) => {
    try {
      if (!bookingId) return;

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
      );

      if (!booking) return;

      const shopRoom = `shop-${booking.shopId}`;
      const userRoom = `user-${booking.userId}`;

      // 1️⃣ MATCH REST API → bookingStatusUpdate
      io.to(shopRoom).emit("bookingStatusUpdate", booking);
      if (booking.status !== "barber_deleted") {
        io.to(userRoom).emit("bookingStatusUpdate", booking);

        // WEB PUSH: Notify User
        // Only if user exists (booking.userId)
        if (booking.userId) {
          await NotificationService.send(
            booking.userId,
            'user',
            `Booking ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
            `Your appointment at ${booking.shopName || 'the salon'} is now ${booking.status}.`,
            '/dashboard/appointments'
          );
        }
      }

      // 2️⃣ MATCH REST API → queueUpdated
      await broadcastShopQueue(booking.barberId, booking.date);


      // 3️⃣ Keep your socket-specific event
      io.to(shopRoom).emit("booking:updated", booking);

    } catch (err) {
      console.error("updateBookingStatus error:", err);
    }
  });
  socket.on("requestShopQueue", async (shopId) => {
    if (!shopId) return;
    // console.log("⏳ Shop requested queue:", shopId);

    const payload = await broadcastShopQueue(shopId);
    io.to(`shop-${shopId}`).emit("shopQueueUpdate", { [shopId]: payload });
  });

  /* ---------------------------------------------
     DELETE BOOKING (Socket Version)
  --------------------------------------------- */
  socket.on("deleteBooking", async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) return;

      booking.status = "cancelled";
      await booking.save();

      const shopRoom = `shop-${booking.shopId}`;
      const userRoom = `user-${booking.userId}`;

      // MATCH REST API → bookingStatusUpdate
      io.to(shopRoom).emit("bookingStatusUpdate", booking);
      io.to(userRoom).emit("bookingStatusUpdate", booking);

      // WEB PUSH: Notify User of Cancellation
      if (booking.userId) {
        await NotificationService.send(
          booking.userId,
          "user",
          "Booking Cancelled",
          `Your appointment has been cancelled.`,
          "/dashboard/appointments"
        );
      }

      // queue refresh
      await broadcastShopQueue(booking.shopId, booking.date);


    } catch (err) {
      console.error("deleteBooking error:", err);
    }
  });

  /* ---------------------------------------------
     DISCONNECT
  --------------------------------------------- */
  socket.on("disconnect", () => {
    // console.log("Socket disconnected:", socket.id);
  });
});

/* ---------------------------------------------------------
   Cron reminders (keeps your existing logic but safer)
--------------------------------------------------------- */
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const plus10 = new Date(now.getTime() + 10 * 60000);
    const plus15 = new Date(now.getTime() + 15 * 60000);

    // NOTE: your Booking schema stores date/time as strings; if you also have startTime Date fields keep this query,
    // otherwise you may want a different approach. This keeps your original intent.
    const soonBookings = await Booking.find({
      // If booking has startTime Date, use it; otherwise skip this cron or adapt to string parse
      startTime: { $gte: plus10, $lt: plus15 },
      status: { $nin: ["cancelled", "completed"] },
    }).lean();

    for (const b of soonBookings) {
      if (b.userId) {
        const minutes = Math.round((new Date(b.startTime) - now) / 60000);
        const payload = {
          bookingId: b._id,
          staffName: b.staffName,
          message: `Reminder: Your appointment with ${b.staffName} is in ${minutes} minutes.`,
        };
        io.to(`user-${b.userId}`).emit("booking:reminder", payload);
        // console.log("Reminder sent to user:", b.userId, "for booking:", b._id);
      }
    }
  } catch (err) {
    // console.error("Cron reminder error:", err);
  }
});


/* ---------------------------------------------------------
   Routes
--------------------------------------------------------- */
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRouter);
app.use("/api/staff", staffRouter);
app.use("/api/barbers", barberRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/shops", shopRoutes);

// Back-compat helper route (optional) — returns queue for a barber
app.get("/api/live/:barberId", async (req, res) => {
  try {
    const shopId = req.params.barberId;
    const payload = await broadcastShopQueue(shopId)
    // pure, no sockets
    return res.json({ [shopId]: payload });
  } catch (err) {
    console.error("Error in /api/live/:barberId", err);
    return res.status(500).json({ message: err.message });
  }
});


/* ---------------------------------------------------------
   Health check & server start
--------------------------------------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "Server running" });
});

// --- WEB PUSH SETUP ---
import webpush from "web-push";
import { NotificationService } from "./services/NotificationService.js";

// Generate keys if not in env (For Demo/Dev). In prod, store these in .env!
// webpush.generateVAPIDKeys()
const HARDCODED_PUBLIC = "BJDyArv_gCxbB0lwoCniyX7k3lOqjwL4l3KEQfqlRk5vBTzlE_vYOBKwLMPNt5nFYolkbCD2hihEXtqw0MPPLtTs";
const HARDCODED_PRIVATE = "jklKScmDYopUPP2aDwCurEVoKwWQF5KbEg6yF6OXilw";

let publicVapidKey = process.env.VAPID_PUBLIC_KEY;
let privateVapidKey = process.env.VAPID_PRIVATE_KEY;

// validation: fallback if env var is "placeholder" or invalid string or too short
// A valid public key is ~87 chars base64url. 
if (!publicVapidKey || publicVapidKey.includes("placeholder") || publicVapidKey.length < 50) {
  console.log("⚠️ VAPID_PUBLIC_KEY env invalid or missing. Using hardcoded fallback.");
  publicVapidKey = HARDCODED_PUBLIC;
}
if (!privateVapidKey || privateVapidKey.includes("placeholder") || privateVapidKey.length < 20) {
  console.log("⚠️ VAPID_PRIVATE_KEY env invalid or missing. Using hardcoded fallback.");
  privateVapidKey = HARDCODED_PRIVATE;
}

try {
  webpush.setVapidDetails(
    "mailto:naitikprateek347@gmail.com",
    publicVapidKey,
    privateVapidKey
  );
  console.log("✅ WebPush VAPID details set successfully.");
} catch (err) {
  console.error("❌ Failed to set VAPID details. Push notifications will fail.", err.message);
}

// --- NOTIFICATION ROUTES ---
app.post("/api/notifications/subscribe", async (req, res) => {
  // Expected body: { subscription, role, userId }
  const { subscription, role, userId } = req.body;

  if (!subscription || !userId) {
    return res.status(400).json({ error: "Missing subscription or userId" });
  }

  try {
    let entity;
    if (role === "barber") {
      entity = await Barber.findById(userId);
    } else {
      entity = await User.findById(userId);
    }

    if (entity) {
      // Add if unique
      const exists = entity.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
      if (!exists) {
        console.log(`[Subscribe] New sub for ${role} ${userId}`);
        entity.pushSubscriptions.push(subscription);
        await entity.save();
        console.log(`[Subscribe] Saved. Total subs: ${entity.pushSubscriptions.length}`);
      } else {
        console.log(`[Subscribe] Sub already exists for ${userId}`);
      }
      res.status(201).json({});
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Subscription Error", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Send Test Notification (Dev only)
app.get("/api/notifications/ping", (req, res) => {
  res.json({ success: true, message: "Notifications API is reachable" });
});

app.post("/api/notifications/test-send", async (req, res) => {
  try {
    const { userId, role } = req.body;
    let entity;
    if (role === 'barber') {
      entity = await Barber.findById(userId);
    } else {
      entity = await User.findById(userId);
    }

    if (!entity) {
      console.warn(`[test-send] ${role} ID ${userId} not found in database.`);
      return res.status(404).json({
        error: `Database Error: ${role} ID not found`,
        foundOnServer: false,
        advice: "Ensure you are testing with a valid ID from the CURRENT database."
      });
    }

    const subCount = entity.pushSubscriptions?.length || 0;

    await NotificationService.send(userId, role, "Test Notification", "This is a test alert from the server!");

    res.json({
      success: true,
      subscriptionCount: subCount,
      message: subCount > 0 ? "Notification triggered" : "No active subscriptions found for this device"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications/test-direct", async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "Database Error: User ID not found",
        foundOnServer: false,
        advice: "Try logging out and logging back in."
      });
    }

    const subCount = user.pushSubscriptions?.length || 0;
    console.log(`[TEST] Found user ${user._id}. Subscriptions: ${subCount}`);

    if (subCount === 0) {
      return res.status(400).json({
        error: "No subscriptions found for user",
        subscriptionCount: 0
      });
    }

    await NotificationService.send(
      userId,
      "user",
      "Test DIRECT",
      "This is a direct test message."
    );

    res.json({
      success: true,
      subscriptionCount: subCount,
      message: "Direct notification triggered"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

(async () => {
  await dropIdIndexIfExists();
  await connectData();

  server.listen(PORT, () => {
    // console.log(`🚀 Server running on port ${PORT}`);
    // console.log("Socket.IO ready ✅");

  });
})();
