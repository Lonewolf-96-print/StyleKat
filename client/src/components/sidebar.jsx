"use client";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  User,
  Settings,
  Store,
  Building
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNotifications } from "../contexts/UserNotificationsContext";

const navItems = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search-salon", label: "Find Salons", icon: Store },
  { href: "/my-bookings", label: "My Bookings", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar({ open, onToggle, isMobile, closeMobile }) {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <>
      <div
        className={cn(
          // Base (Mobile Bottom Bar)
          "fixed bottom-0 left-0 bg-white border-t border-gray-200 z-50 w-full flex flex-row justify-between items-center px-4 py-2 shadow-lg lg:shadow-none lg:border-t-0",

          // Desktop (Sidebar)
          "lg:fixed lg:inset-y-0 lg:left-0 lg:flex-col lg:justify-start lg:w-64 lg:bg-sidebar lg:border-r lg:border-sidebar-border lg:px-0 lg:py-0"
        )}
      >
        {/* Header - Desktop Only */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-sidebar-border w-full">
          <h1 className="text-xl font-bold text-sidebar-foreground">StyleKat</h1>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex flex-1 w-full justify-between items-center", // Mobile
          "lg:flex-col lg:justify-start lg:space-y-2 lg:px-4 lg:py-6" // Desktop
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
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group flex-1 lg:flex-none",

                  // Desktop Item
                  "lg:flex-row lg:items-center lg:justify-start lg:space-y-0 lg:w-full lg:px-4 lg:py-3",

                  isActive
                    ? "text-primary lg:bg-sidebar-accent lg:text-sidebar-accent-foreground font-semibold"
                    : "text-gray-400 hover:text-gray-600 lg:text-sidebar-foreground lg:hover:bg-sidebar-accent"
                )}
              >
                <div className="relative p-1">
                  <Icon className={cn("w-6 h-6 lg:w-5 lg:h-5 lg:mr-3", isActive ? "fill-current lg:fill-none" : "")} />

                  {/* Notification Dot */}
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <span className={cn(
                  "text-[10px] font-medium lg:text-sm",
                  isActive ? "text-primary lg:text-inherit" : "text-gray-400 lg:text-gray-500"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Desktop Only */}
        <div className="hidden lg:block p-4 border-t border-sidebar-border w-full mt-auto">
          <p className="text-xs text-sidebar-foreground/60 text-center">© 2025 StyleKat</p>
        </div>
      </div>

      {/* Mobile Spacer */}

    </>
  );
}
