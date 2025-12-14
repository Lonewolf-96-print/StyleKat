import { useState, useEffect } from "react";
import { useCustomer } from "../contexts/CustomerContext.jsx";
import { User } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components-barber/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Clock, Calendar, Scissors } from "lucide-react";

import { io } from "socket.io-client";
import { Button } from "./ui/button.jsx";
import { useApp } from "../contexts/AppContext.jsx";
import toast from "react-hot-toast";
import CustomTimeClock from "../components/CustomTimeClock";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

import CalendarDate from "./Calendar.jsx";
import AuthPage from "./UserAuthModel.jsx";

export default function BackendBookingForm({ shop, barberId }) {

  const [socket, setSocket] = useState(null);

  const [showClock, setShowClock] = useState(false)
  const [staff, setStaff] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [liveQueues, setLiveQueues] = useState({});


  const resolvedBarberId = barberId || localStorage.getItem("shopId") || shop?._id;

  const userId = localStorage.getItem("userId");
  const shopId = shop?._id || shop?.id;
  const { navigate } = useApp()

  //  const {barberId} = useParams()
  const [blockedTimes, setBlockedTimes] = useState({});


  const { customer, login, logout, loading, setLoading } = useCustomer();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [services, setServices] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [showStaffList, setShowStaffList] = useState(false);

  const API_URL = "https://localhost:5000/api/bookings";
  const today = new Date().toISOString().split("T")[0];
  const fetchLiveState = async (resolvedBarberId) => {
    try {
      if (!resolvedBarberId) return;
      console.log("Barber Id inside fetch live status ", resolvedBarberId)
      const res = await fetch(
        `https://localhost:5000/api/live/${resolvedBarberId}`
      );
      const data = await res.json();

      setLiveQueues((prev) => ({
        ...prev,
        [resolvedBarberId]: data,
      }));

    } catch (err) {
      console.error("Live state fetch error:", err);
    }
  };
  useEffect(() => {
    fetchLiveState(resolvedBarberId);
    setLoading(false);
  }, [resolvedBarberId]);



  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const shopId = localStorage.getItem("shopId");
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("customerToken");

    if (!token) {
      console.warn("⚠ No token found. Skipping socket connect.");
      return;
    }

    const newSocket = io("https://localhost:5000", {
      auth: token ? { token } : {},
      autoConnect: !!token,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("⚡ Connected to server");
      newSocket.emit("joinShopRoom", `shop-${resolvedBarberId}`);
      console.log("🔵 Joining shop room:", `shop-${resolvedBarberId}`);
      // Join user room
      if (userId) newSocket.emit("joinUserRoom", userId);

      // ---- BOOKING TIME BLOCK EVENT ----

    });



    newSocket.on("connect_error", (err) => {
      console.error("❌ connect error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 disconnected:", reason);
    });

    return () => {

    };
  }, []);


  // ⭐ SECOND USEEFFECT — but using same ONE socket
  useEffect(() => {
    if (!socket) return;
    if (bookings.length === 0) return;

    // Join all barber/shop rooms
    bookings.forEach((b) => {
      socket.emit("joinShopRoom", `shop-${b.resolvedBarberId}`);
    });

    // Queue updated from barber side
    const handleQueueUpdate = (updatedQueue) => {
      if (!updatedQueue.length) return;

      const resolvedBarberId = updatedQueue[0]?.resolvedBarberId;
      if (!resolvedBarberId) return;

      setLiveQueues((prev) => ({
        ...prev,
        [resolvedBarberId]: updatedQueue,
      }));
    };

    socket.on("queueUpdated", handleQueueUpdate);

    return () => {
      socket.off("queueUpdated", handleQueueUpdate);
    };
  }, [socket, bookings]);
  // Join ONLY the correct barberId room
  useEffect(() => {
    if (!socket || !selectedStaff) return;
    console.log("🔵 Joining staff room:", selectedStaff._id);
    socket.emit("joinStaffRoom", selectedStaff._id);
    socket.on("bookingTime:all", (data) => {
      // data = { "2025-12-01": [ ... ], ... }
      // Wrap it under the staffId so state remains consistent { staffId: { date: [...] } }
      setBlockedTimes((prev) => ({
        ...prev,
        [selectedStaff._id]: data,
      }));
    });

    // ---- BLOCK EVENT ----
    const handleBlocked = (data) => {

      const blockStart = dayjs(`${data.date} ${data.startTime}`);
      if (blockStart.isBefore(dayjs())) return;

      const endTime = dayjs(`${data.date} ${data.startTime}`)
        .add(data.duration, "minute")
        .format("HH:mm");

      const formatted = { ...data, endTime };

      setBlockedTimes(prev => ({
        ...prev,
        [data.staffId]: {
          ...(prev[data.staffId] || {}),
          [data.date]: [
            ...(prev[data.staffId]?.[data.date] || []),
            formatted
          ]
        }
      }));
    };


    // ---- UNBLOCK EVENT ----
    const handleUnblocked = (data) => {
      setBlockedTimes(prev => ({
        ...prev,
        [data.staffId]: {
          ...(prev[data.staffId] || {}),
          [data.date]: (prev[data.staffId]?.[data.date] || []).filter(
            t => t.startTime !== data.startTime
          )
        }
      }));
    };
    socket.emit("bookingTime:getAll", { staffId: selectedStaff._id });
    socket.on("bookingTime:blocked", handleBlocked);
    socket.on("bookingTime:unblocked", handleUnblocked);

    return () => {
      socket.off("bookingTime:blocked", handleBlocked);
      socket.off("bookingTime:unblocked", handleUnblocked);
    };
  }, [socket, selectedStaff]);

  useEffect(() => {
    if (!shop) return;

    // Removed redundant state updates that were causing race conditions
    // The specific fetch hooks (fetchServices/fetchStaff) below will handle data population

    setSelectedService("");
    setSelectedStaff(null);
    setSelectedDate("");
    setSelectedTime("");

  }, [shop]);


  useEffect(() => {
    console.log("🔥 BLOCKED TIMES UPDATED:", blockedTimes);
  }, [blockedTimes]);


  function generateSlots(start = "09:00", end = "23:00") {
    const slots = [];
    let current = dayjs(start, "HH:mm");
    const last = dayjs(end, "HH:mm");

    while (current <= last) {
      slots.push(current.format("HH:mm"));
      current = current.add(5, "minute");
    }
    return slots;
  }
  function isTimeBlocked(date, time) {
    const blocks = blockedTimes[selectedStaff?._id]?.[date];
    if (!blocks) return false;

    return blocks.some(block => {
      return time >= block.startTime && time < block.endTime;
    });
  }

  /* -------------------------------------------
      Helper: Get user's queue position
  ------------------------------------------- */
  const getUserQueueInfo = (booking) => {
    const queueData = liveQueues[booking.barberId];
    if (!queueData) return null;

    const staffQueue = queueData.find(
      (s) => s.staffId === booking.staffId
    );

    if (!staffQueue) return null;

    const { current, queue } = staffQueue;

    // User is currently being served
    if (current && current._id === booking._id) {
      return { status: "current", position: 0, staffQueue };
    }

    // User is in the waiting queue
    const index = queue.findIndex((q) => q._id === booking._id);
    if (index !== -1) {
      return {
        status: "waiting",
        position: index + 1,
        staffQueue,
      };
    }

    // Not found anywhere (staff free or booking completed)
    return { status: "none", position: null, staffQueue };
  };

  // -------------------------------------------
  // 1. PUBLIC DATA FETCHING (Services & Staff)
  // -------------------------------------------
  useEffect(() => {
    if (!resolvedBarberId) return;

    // A. Fetch Services
    const fetchServices = async () => {
      try {
        const res = await fetch(`https://localhost:5000/api/services/public/${resolvedBarberId}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setServices(data);
        } else {
          console.warn("❌ Error fetching services:", data.message);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };

    // B. Fetch Staff
    const fetchStaff = async () => {
      try {
        const res = await fetch(`https://localhost:5000/api/staff/public/${resolvedBarberId}`);
        const data = await res.json();
        if (res.ok) {
          setStaff(data);
        } else {
          console.warn("❌ Failed to fetch staff:", data.message);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };

    fetchServices();
    fetchStaff();

  }, [resolvedBarberId]);

  // -------------------------------------------
  // 2. SOCKET EVENT LISTENERS (Authenticated/Live Updates)
  // -------------------------------------------
  useEffect(() => {
    if (!socket || !shop?._id) return;

    const onServiceUpdated = (payload) => {
      if (payload.barberId !== shop._id) return;
      setServices(prev => prev.map(s => s._id === payload.service._id ? payload.service : s));
    };
    const onServiceAdded = (payload) => {
      if (payload.barberId !== shop._id) return;
      setServices(prev => [...prev, payload.service]);
    };
    const onServiceDeleted = (payload) => {
      if (payload.barberId !== shop._id) return;
      setServices(prev => prev.filter(s => s._id !== payload.serviceId));
    };

    socket.on("serviceUpdated", onServiceUpdated);
    socket.on("serviceAdded", onServiceAdded);
    socket.on("serviceDeleted", onServiceDeleted);

    return () => {
      socket.off("serviceUpdated", onServiceUpdated);
      socket.off("serviceAdded", onServiceAdded);
      socket.off("serviceDeleted", onServiceDeleted);
    };
  }, [socket, shop?._id]);

  // -------------------------------------------
  // 3. USER ROOM JOINING (If Logged In)
  // -------------------------------------------
  useEffect(() => {
    if (!socket || !userId) return;
    const room = `user-${userId}`;
    socket.emit("joinRoom", room);
  }, [socket, userId]);
  // Debug logs removed to reduce noise
  // useEffect(() => {
  //   console.log("fetchServices barberId:", barberId, "shopId:", shopId);
  // }, [barberId, shopId]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customer) {
      navigate("/login/user");
      return;
    }
    setIsSubmitting(true);
    setStatus("");

    const token = localStorage.getItem("customerToken");
    if (!token) {
      setStatus("⚠️ Please log in first.");
      navigate("/login/user");
      setIsSubmitting(false);
      return;
    }

    // Resolve duration properly from services array (services items assumed { _id, name, price, duration })
    const serviceObj = services.find(s => s.name === selectedService || s._id === selectedService);
    const duration = (serviceObj && Number(serviceObj.duration)) || 30; // fallback 30

    // Normalize time to server-friendly format. The server's router expects "hh:mm A" or "HH:mm".
    // Keep the same format you send in other places; here we send "hh:mm A" so server.parseDateTime handles it.
    const normalizedTime = selectedTime; // e.g. "06:45 PM" from your TimeClock

    const body = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shopId: shop._id || shop.id,
      shopName: shop.salonName || shop.name || "Unknown Shop",
      barberId: shop._id,
      customerName,
      staffId: selectedStaff?._id,
      staffName: selectedStaff?.name,
      customerPhone,
      service: selectedService,
      price: services.find(s => s.name === selectedService)?.price || selectedService?.price || 0,
      duration,                     // <-- important!
      date: selectedDate,           // "YYYY-MM-DD"
      time: normalizedTime,         // "hh:mm A"
      userId: customer._id || customer.id,
    };

    if (!selectedStaff) {
      toast.error("Please select a staff member before booking.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Booking payload:", body);
      const res = await fetch(`${API_URL}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // show server error message (e.g. blocked slot)
        toast.error(data?.message || "Failed to create booking");
        setStatus(`❌ Failed to send booking: ${data?.message || "Server error"}`);
        setIsSubmitting(false);
        return;
      }

      // booking created successfully on server — use the server's booking object (authoritative)
      const created = data.booking;

      // Optionally emit a small socket event to update local blocked store if you want a client-side instant update.
      // IMPORTANT: keep the format consistent with server: use HH:mm for blockedTimesStore
      const startDt = dayjs(`${created.date} ${created.time}`, "YYYY-MM-DD hh:mm A");
      const endDt = startDt.add(created.duration || duration || 30, "minute");

      if (socket && socket.connected) {
        // Use server-emitted events for canonical updates — but a small "local tell" is okay:
        socket.emit("bookingTime:block", {
          staffId: created.staffId,
          date: created.date,
          startTime: startDt.format("HH:mm"),
          endTime: endDt.format("HH:mm"),
          duration: created.duration || duration,
          bookingId: created._id,
        });
      }

      toast.success("Booking request sent successfully. You'll be notified shortly.");
      navigate("/user/dashboard");

      // clear form
      setStatus("✅ Booking request sent successfully!");
      setCustomerName("");
      setCustomerPhone("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedStaff(null);
    } catch (err) {
      console.error("Error sending booking:", err);
      setStatus("❌ Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const barberQueue = liveQueues[barberId] || [];
  return (


    <div className="flex justify-center mt-4">
      {/* <AuthPage
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      /> */}

      <form
        onSubmit={handleSubmitBooking}
        className="
    bg-white/10 
    backdrop-blur-2xl 
    p-8 
    space-y-6 
    w-full 
    max-w-lg 
    rounded-3xl 
    border border-white/20
    shadow-2xl
    relative 
    z-[1]
  "
      >

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white/90 ml-1">Your Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white/90 ml-1">Phone Number</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Service */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white/90 ml-1">Select Service</label>
          <div className="relative">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer"
              required
            >
              <option value="" className="bg-gray-800 text-gray-400">Choose a service...</option>
              {services.map((s) => (
                <option key={s._id} value={s.name} className="bg-gray-800 text-white py-2">
                  {s.name} — ₹{s.price} ({s.duration} min)
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              <Scissors size={18} />
            </div>
          </div>
        </div>

        <div className="relative space-y-2">
          <label className="block text-sm font-semibold text-white/90 ml-1">Preferred Staff</label>
          <div
            onClick={() => setShowStaffList((prev) => !prev)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white cursor-pointer hover:bg-white/10 transition-colors flex justify-between items-center"
          >
            <span>{selectedStaff ? selectedStaff.name : "Select Staff Member"}</span>
            <User size={18} className="text-white/50" />
          </div>

          {showStaffList && (
            <div
              className="
    absolute left-0 mt-2 
    w-[360px] max-h-[420px]
    overflow-auto
    backdrop-blur-xl bg-white/20
    border border-white/30
    shadow-2xl rounded-2xl
    p-4
    custom-scroll
    z-[9999]   /* <- FIX */
  "
            >
              {staff.map((member) => (
                <div
                  key={member._id}
                  onClick={() => {
                    setSelectedStaff(member);
                    setShowStaffList(false);
                  }}
                  className={`
            mb-4 p-4 rounded-xl border
            bg-white/40 backdrop-blur-lg
            transition-all cursor-pointer
            hover:shadow-lg
            ${selectedStaff?._id === member._id
                      ? "ring-2 ring-blue-500 scale-[1.02]"
                      : "hover:scale-[1.01]"
                    }
          `}
                >
                  {/* Staff Info */}
                  <div className="flex items-center space-x-3">
                    <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                      {member.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{member.name}</p>
                      <p className="text-sm text-gray-700">{member.role}</p>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mt-3">
                    <p className="font-medium mb-1 text-gray-800">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {member.services?.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Working Days */}
                  <div className="mt-3 text-sm text-gray-700">
                    {member.workingDays?.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Date */}
        {/* Date */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white/90 ml-1">Select Date</label>

          <CalendarDate
            onChange={(date) => {
              // Store as yyyy-mm-dd (same format your old input used)
              setSelectedDate(date.format("YYYY-MM-DD"));
            }}
          />

          {/* Show selected date visually (optional) */}

        </div>


        {/* Time */}
        <div className="space-y-2">
          <label onClick={() => setShowClock(true)} className="block text-sm font-semibold text-white/90 ml-1 cursor-pointer hover:text-blue-400 transition-colors">Select Time</label>
          <CustomTimeClock
            blockedTimes={blockedTimes[selectedStaff?._id]?.[selectedDate] || []}
            selectedDate={selectedDate}
            serviceDuration={(() => {
              const s = services.find(srv => srv.name === selectedService);
              return s ? (s.duration || 30) : 30;
            })()}
            onChange={(selected) => {
              if (selected === null) {
                setSelectedTime(null);
              }
              else {
                setSelectedTime(selected.format("hh:mm A"))
              }
            }
            }

          />

          <button
            className="mt-4 p-2 bg-blue-500 text-white rounded"
            onClick={() => console.log("Selected Booking Time:", selectedTime)}
          >
            Confirm
          </button>
        </div>



        {/* Submit */}
        <Button
          type="submit"
          disabled={!selectedTime}
          className="w-full disabled:bg-gray-400/50 disabled:text-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-[0.98] text-lg"
        >
          {isSubmitting ? "Sending Request..." : "Book Appointment"}
        </Button>

        {status && (
          <p className="mt-2 text-sm text-gray-700 text-center">{status}</p>
        )}
      </form>



    </div >


  );
}
