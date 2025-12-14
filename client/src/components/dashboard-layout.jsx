"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import UserDashboardFooter from "./Footer";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <div className="flex h-screen bg-background relative py-4">

        {/* Sidebar (desktop or mobile drawer) */}
        <Sidebar
          open={isMobile ? mobileOpen : sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
          closeMobile={() => setMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <Header
            onMenuClick={() =>
              isMobile ? setMobileOpen(true) : setSidebarOpen(!sidebarOpen)
            }
          />

          {/* Mobile hamburger icon */}
          {isMobile && (
            <button
              className="absolute top-4 left-4 z-50 bg-white shadow p-2 rounded-lg md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>

      <UserDashboardFooter />
    </>
  );
}
