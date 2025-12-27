"use client";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  User,
  Store,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNotifications } from "../contexts/UserNotificationsContext";
import Image from "/salon.png";

const navItems = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search-salon", label: "Find Salons", icon: Store },
  { href: "/my-bookings", label: "Bookings", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <>
      <div
        className={cn(
          // Base (Mobile Bottom Bar)
          "fixed bottom-0 left-0 bg-white border-t border-gray-200 z-50 w-full flex flex-row justify-around items-center px-2 py-3 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)] lg:shadow-none lg:border-t-0 safe-area-bottom",

          // Desktop (Sidebar)
          "lg:fixed lg:inset-y-0 lg:left-0 lg:flex-col lg:justify-start lg:w-72 lg:bg-[#0f172a] lg:text-white lg:px-0 lg:py-0 transition-all duration-300 ease-in-out"
        )}
      >
        {/* Header - Desktop Only */}
        <div className="hidden lg:flex flex-col items-center justify-center h-32 w-full bg-[#1e293b]/50 mb-6 border-b border-white/5">
          <div className="relative w-16 h-16 bg-white rounded-full p-1.5 shadow-lg shadow-black/20 mb-3 ring-4 ring-white/10">
            <img src={Image} alt="StyleKat Logo" className="object-contain w-full h-full rounded-full" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">StyleKat</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-medium">
              Customer Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex flex-1 w-full justify-between items-center", // Mobile
          "lg:flex-col lg:justify-start lg:space-y-2 lg:px-4 lg:py-2" // Desktop
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  // Mobile Item
                  "flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all duration-200 group flex-1 lg:flex-none relative overflow-hidden",

                  // Desktop Item
                  "lg:flex-row lg:space-y-0 lg:w-full lg:px-5 lg:py-4 lg:rounded-xl",

                  isActive
                    ? "text-primary lg:bg-indigo-600 lg:text-white shadow-md lg:shadow-indigo-900/20"
                    : "text-gray-400 hover:text-gray-600 lg:text-slate-400 lg:hover:bg-white/5 lg:hover:text-white"
                )}
              >
                {/* Active Indicator (Desktop) */}
                {isActive && (
                  <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                )}

                <div className="relative">
                  <Icon className={cn(
                    "h-6 w-6 lg:mr-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "fill-current lg:fill-none" : ""
                  )} />

                  {/* Notification Dot */}
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white lg:border-[#0f172a] flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    </span>
                  )}
                </div>

                <span className={cn(
                  "text-[10px] font-medium lg:text-sm tracking-wide lg:tracking-normal",
                  isActive ? "font-bold text-primary lg:text-white" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Desktop Only */}
        <div className="hidden lg:flex flex-col gap-4 p-6 w-full mt-auto bg-gradient-to-t from-[#0f172a] to-transparent">
          <div className="bg-[#1e293b] rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-semibold text-slate-300 mb-1">Need Help?</h4>
            <p className="text-[10px] text-slate-500 mb-2">support@stylekat.in</p>
            <div className="text-[10px] text-center text-slate-600 mt-2 font-mono">
              v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-20 w-full" />
    </>
  );
}
