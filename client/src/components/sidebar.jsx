"use client";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  User,
  Settings,
  ChevronLeft,
  Store 
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNotifications } from "../contexts/UserNotificationsContext";

const navItems = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {href :"/search-salon",label:"Find Salons",icon:Store},
  
  { href: "/my-bookings", label: "My Bookings", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },

];

export function Sidebar({ open, onToggle, isMobile, closeMobile }) {
  const location = useLocation();            // <-- Detect active route
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Mobile background overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col fixed md:static z-50",
          isMobile
            ? open
              ? "w-64 h-full left-0 top-0"
              : "w-0 overflow-hidden"
            : open
            ? "w-64"
            : "w-20"
        )}
      >
        {/* Top */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {open && <h1 className="text-lg font-bold text-sidebar-foreground">StyleKat</h1>}

          {/* Collapse (desktop) */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-sidebar-accent rounded-lg"
            >
              <ChevronLeft
                className={cn(
                  "w-5 h-5 text-sidebar-foreground",
                  !open && "rotate-180"
                )}
              />
            </button>
          )}

          {/* Close (mobile) */}
          {isMobile && (
            <button
              onClick={closeMobile}
              className="p-1 hover:bg-sidebar-accent rounded-lg"
            >
              ✖
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive = location.pathname.startsWith(item.href); // <--- ACTIVE LOGIC

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMobile}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",

                  // ACTIVE MENU STYLING
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />

                  {/* Notification dot */}
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full" />
                  )}
                </div>

                {open && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {open && (
            <p className="text-xs text-sidebar-foreground/60">© 2025 StyleKat</p>
          )}
        </div>
      </aside>
    </>
  );
}
