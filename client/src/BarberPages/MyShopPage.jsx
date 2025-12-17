"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useBookings } from "../contexts/BookingsContext";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from "../lib/config";

import SeatCard from "../components-barber/seat-card";
import { Button } from "../components-barber/ui/button";
import { DashboardHeader } from "../components-barber/header";
import { DashboardSidebar } from "../components-barber/sidebar";
import DashboardFooter from "../components-barber/footer";
import { Clock, Menu, Scissors, X } from "lucide-react";
import { useStepContext } from "@mui/material/Step";
import { useLanguage } from "../components-barber/language-provider";
export default function MyShopPage() {
  const [expandedStaff, setExpandedStaff] = useState({});

  const [shopQueue, setShopQueue] = useState({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { t } = useLanguage();
  const shopId = localStorage.getItem("shopId");
  const [startVisible, setStartVisible] = useState(true)
  const [staff, setStaff] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [socket, setSocket] = useState(null);


  // ---------------------------------------------------------
  // 1️⃣ FETCH STAFF + BOOKINGS (HTTP)
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      // STAFF
      const resStaff = await fetch(`${API_URL}/api/staff/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} `,
        },
      });
      const staffData = await resStaff.json();
      setStaff(staffData);
      console.log("Loaded staff:", staffData);

      // BOOKINGS
      const resBookings = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} `,
        },
      });
      const bookingData = await resBookings.json();
      setBookings(bookingData);
      console.log("Loaded bookings:", bookingData);
    }

    loadData();
  }, []);
  const toggleExpand = (staffId) => {
    setExpandedStaff((prev) => ({
      ...prev,
      [staffId]: !prev[staffId],
    }));
  };



  // ---------------------------------------------------------
  // 2️⃣ SOCKET FOR LIVE QUEUE UPDATES
  // ---------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],

      withCredentials: true,
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
      s.emit("requestShopQueue", shopId);
    });

    // LIVE QUEUE UPDATES
    s.on("shopQueueUpdate", (data) => {
      console.log("🔴 shopQueueUpdate:", data);
      setShopQueue(data); // ✅ THIS WAS MISSING
    });

    s.on("queueUpdated", (data) => {
      console.log("🟢 queueUpdated:", data);
    });

    // NEW: HANDLE USER CANCELLATIONS
    s.on("bookingStatusUpdate", (data) => {
      console.log("📢 bookingStatusUpdate:", data);

      if (data.status === "cancelled") {
        const cancelledId = data._id;

        // Remove globally loaded bookings (if used)
        setBookings((prev) => prev.filter((b) => b._id !== cancelledId));

        // ALWAYS refresh queue for this shop
        s.emit("requestShopQueue", shopId);
      }
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ---------------------------------------------------------
  // 3️⃣ MERGE STAFF + QUEUE
  // ---------------------------------------------------------
  // 1. Helper to parse time
  const parseBookingTime = (booking) => {
    // If we have a full ISO date
    if (booking.startTime) return new Date(booking.startTime).getTime();

    // Fallback for simple time strings like "10:30 AM"
    if (booking.time) {
      const [time, modifier] = booking.time.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      const now = new Date();
      return new Date(now.setHours(hours, minutes, 0, 0)).getTime();
    }
    return Infinity; // Push to end if no time
  };

  // ---------------------------------------------------------
  // 3️⃣ MERGE STAFF + QUEUE
  // ---------------------------------------------------------
  const seats = useMemo(() => {
    if (!staff.length) return [];

    const queueData = shopQueue?.[shopId] || [];

    return staff.map((st) => {
      const live = queueData.find((q) => q.staffId === st._id);

      // Extract current and queue safely
      let current = live?.current || null;
      let queue = live?.queue || [];

      // ❌ RULE: "pending" booking cannot be on chair
      if (current?.status === "pending") {
        // Put the pending back into queue
        queue = [current, ...queue];
        current = null;
      }

      // RULE: Queue should not contain duplicate current
      queue = queue.filter((q) => q._id !== current?._id);

      // RULE: queue items should also not appear on chair if they are pending
      queue = queue.map((q) => ({
        ...q,
        blocked: q.status === "pending"
      }));

      // ✅ FIX: Sort Queue Chronologically
      queue.sort((a, b) => parseBookingTime(a) - parseBookingTime(b));

      return {
        staffId: st._id,
        staffName: st.name,
        role: st.role,
        services: st.services,
        current,
        queue,
        inService: current?.status === "in-service",
        serviceStarted: current?.status === "in-service",
      };
    });
  }, [staff, shopQueue, shopId]);

  // Sort seats by who has the earliest booking? Or just keep staff order? 
  // User asked for "bookings in chronological order". Usually means the queue itself.
  // We'll keep staff order stable (or by name/role) to avoid jumping cards.
  const sortedQueue = seats; // Remove the undefined 'slotTime' sort which was breaking things
  // ---------------------------------------------------------
  // 4️⃣ START / FINISH SERVICE
  // ---------------------------------------------------------
  const handleStartService = async (booking) => {
    if (!booking || !socket) return;
    const token = localStorage.getItem("token");

    socket.emit("service:started", { bookingId: booking._id });

    await fetch(`${API_URL}/api/bookings/status/${booking._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token} `,
      },
      body: JSON.stringify({
        status: "in-service",
        staffId: booking.staffId,
      }),
    });

    socket.emit("requestShopQueue", shopId);
  };

  const handleFinishService = async (booking) => {
    if (!booking || !socket) return;
    const token = localStorage.getItem("token");

    socket.emit("service:finished", { bookingId: booking._id });

    await fetch(`${API_URL}/api/bookings/status/${booking._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token} `,
      },
      body: JSON.stringify({ status: "completed" }),
    });

    socket.emit("requestShopQueue", shopId);
  };

  const formatTime = (t) => {
    if (!t) return "N/A";
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------------------------------------------------------
  // 5️⃣ RENDER
  // ---------------------------------------------------------
  return (
    <div className="flex flex-col lg:flex-row">



      <div className="w-full lg:w-64 flex-shrink-0">

        <DashboardSidebar />
      </div>



      <div className="flex-1 p-6 space-y-6">



        <DashboardHeader />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("myShop.title")}</h1>
            <p className="text-muted-foreground">{t("myShop.subtitle")}</p>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {sortedQueue.map((seat) => (
            <SeatCard key={seat.staffId} seat={{ name: seat.staffName }}>

              <div className="relative space-y-3">

                {/* 🔥 SERVICE STARTED BADGE */}
                {(seat.current?.status === "in-service" || seat.serviceStarted) && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow">
                    Service Started
                  </div>
                )}

                {seat.current ? (
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Customer : </span>
                      {seat.current.customerName || "No one on chair"}

                    </p>
                    <div className="text-sm text-gray-600">
                      {seat.current.service || "Waiting..."}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />

                      {seat.current.startTime
                        ? `Expected Start Time: ${formatTime(seat.current.startTime)} `
                        : "Not started"}
                    </div>

                    {/* 🔥 BUTTONS */}
                    {/* BUTTONS */}
                    <div className="flex gap-2 mt-2">

                      {/* START BUTTON — only visible if service not started */}
                      {seat.current && seat.current.status !== "in-service" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={async () => {
                            await handleStartService(seat.current);

                            // mark this seat as "service started"
                            setStaff((prev) =>
                              prev.map((s) =>
                                s._id === seat.staffId
                                  ? { ...s, serviceStarted: true }
                                  : s
                              )
                            );
                          }}
                        >
                          Start
                        </Button>
                      )}

                      {/* FINISH button appears always when customer exists */}
                      {seat.current && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFinishService(seat.current)}
                        >
                          Finish
                        </Button>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                    Chair free
                  </div>
                )}

                {/* QUEUE LIST */}
                {/* QUEUE LIST */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
                    <span>Up next</span>
                    <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] text-secondary-foreground">
                      {seat.queue.length} in waiting
                    </span>
                  </div>

                  {seat.queue.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4 text-center italic">No queued customers</div>
                  ) : (
                    <>
                      <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {seat.queue.slice(0, 10).map((q) => (
                          <div
                            key={q._id}
                            className="p-2 border rounded-md flex justify-between items-center bg-card/50 hover:bg-accent/5 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="font-medium truncate text-sm">{q.customerName}</div>
                              <div className="text-xs text-muted-foreground truncate">{q.service}</div>
                            </div>
                            <div className="flex flex-col items-end shrink-0 ml-2">
                              {/* TIME */}
                              <div className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {q.startTime
                                  ? new Date(q.startTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : q.time}
                              </div>

                              {/* 🔥 PENDING BADGE */}
                              {q.status === "pending" && (
                                <span className="mt-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium border border-yellow-200">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {seat.queue.length > 10 && (
                        <div className="pt-2 text-center border-t mt-2">
                          <span className="text-xs text-muted-foreground">
                            + {seat.queue.length - 10} more bookings
                          </span>
                          {/* You could add a dialog trigger here to view all */}
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>
            </SeatCard>

          ))}
        </div>

        <DashboardFooter />
      </div>
    </div>
  );
}
