import { io } from "socket.io-client";
import { useRef, useState, useEffect } from "react";
import { SOCKET_URL } from "../lib/config";
import { useApp } from "../contexts/AppContext";
import { useBookings } from "../contexts/BookingsContext";
import { statusColors } from "./recent-appointments";
import CalendarStrip from "./CalenderStrip";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "./ui/button";
import scissors from "/scissors.png";
import { StatsCards } from "../components-barber/stats-cards";
import { RecentAppointments } from "../components-barber/recent-appointments";
import { RevenueChart } from "../components-barber/revenue-chart";
import { QuickActions } from "../components-barber/quick-actions";
import { useLanguage } from "../components-barber/language-provider";
import DashboardFooter from "../components-barber/footer";
import { DashboardHeader } from "../components-barber/header";
import { DashboardSidebar } from "../components-barber/sidebar";

export default function DashboardContent() {
  const { currentUser, setCurrentUser, navigate, token, isAuthReady } = useApp();
  const [socket, setSocket] = useState(null);
  const { t } = useLanguage();
  const { allBookings, setAllBookings } = useBookings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const socketRef = useRef(null);
  const shopId = currentUser?.shopId;
  console.log("DashboardContent - Current User:", currentUser);
  useEffect(() => {
    if (!shopId) return;
    const room = `shop - ${shopId} `;
    socket.emit("joinRoom", room);
    console.log("💈 Barber joined:", room);
  }, [shopId]);
  useEffect(() => {
    if (!isAuthReady) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found → redirecting");
      navigate("/login/barber");
      return;
    }
    console.log("Token used in the dashboard socket connection:", token);

    // ✅ Initialize socket only once
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      withCredentials: true,
      autoConnect: false,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Barber socket connected:", socket.id);
      socket.emit("joinAsBarber");
      socket.emit("joinShopTest", "68f88ca7d12733c84cb598f6");
    });
    socket.on("shopPresenceUpdate", (data) => {
      console.log("📢 Presence Update:", data);
    });

    socket.on("testMessageReceived", (data) => {
      console.log("💬 Message Received:", data);
    });
    setTimeout(() => {
      socket.emit("testMessage", {
        shopId: "68f88ca7d12733c84cb598f6",
        from: socket.id,
        message: "Hello from the other side 👋",
      });
    }, 3000);
    socket.on("bookingNotification", (data) => {
      alert(`New booking: ${data.customerName} booked ${data.service} at ${data.time} `);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    });

    return () => {
      socket.disconnect();
      console.log("🧹 Socket disconnected");
    };
  }, [isAuthReady, token]);



  // ✅ If user isn’t logged in, don’t render anything yet
  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-gray-500">
        Loading dashboard...
      </div>
    );
  }
  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-gray-500">
        Redirecting to login...
      </div>
    );
  }

  return (

    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      {/* Sidebar Components (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <div className="flex-1 space-y-8 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">{t("dashboard.title")}</h1>
              <p className="text-muted-foreground mt-1 text-base">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Shop Status / Toggle (Future placeholder) */}
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-medium text-green-600 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Shop is Live
            </div>
          </div>

          {/* Stats Row */}
          <StatsCards />

          {/* Appointments – Full width on all screens */}
          <div className="space-y-8">
            <RecentAppointments />
          </div>

          {/* Quick Actions & Revenue – BELOW appointments */}
          <div className="max-w-4xl mx-auto space-y-8">
            <QuickActions />
            {/* <RevenueChart /> */}
          </div>


          <DashboardFooter />
        </div>
      </div>
    </div>
  );

}
