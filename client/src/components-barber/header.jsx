"use client";
import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { API_URL } from "../lib/config";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components-barber/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components-barber/ui/avatar";
import { LanguageToggle } from "../components-barber/language-toggle";
import { useLanguage } from "../components-barber/language-provider";
import { NotificationsPanel } from "../components/NotificationPanel";
import { useNotifications } from "../contexts/UserNotificationsContext";
import { useBarberNotifications } from "../contexts/BarberNotificationContext";
import { useUser } from "../contexts/BarberContext";
export function DashboardHeader() {
  const { setCurrentUser, currentUser, navigate } = useApp();

  const { user, setUser } = useUser();
  const { t } = useLanguage();
  const { notificationsOpen, setNotificationsOpen } = useNotifications();
  const { unreadCount, notificationsOpen: barberOpen, setNotificationsOpen: setBarberOpen } = useBarberNotifications();

  // --------------------------
  // Avatar Fallback
  // --------------------------
  function AvatarFallbackText({ name }) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const initials =
      parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0][0];
    return initials.toUpperCase();
  }

  // --------------------------
  // Fetch user details
  // --------------------------
  const token = localStorage.getItem("token");

  const fetchShopDetails = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch shop details");

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("❌ Error fetching shop details:", error);
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [token]);

  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between relative">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">

        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* <LanguageToggle /> */}

        {/* --------------------------
            Notifications
        --------------------------- */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setBarberOpen(!barberOpen)}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Button>

          {barberOpen && (
            <div className="absolute right-0 top-10 z-50">
              <NotificationsPanel
                isOpen={barberOpen}
                onClose={() => setBarberOpen(false)}
              />
            </div>
          )}
        </div>

        {/* --------------------------
            User Menu
        --------------------------- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.profileImage}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                <AvatarFallback>
                  <AvatarFallbackText name={user?.ownerName} />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            forceMount
            className="w-64 p-0 rounded-xl border bg-white shadow-md"
          >
            {/* Profile Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-base font-semibold">
                <AvatarFallbackText name={user?.ownerName} />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.salonName || "Salon"}
                </p>
                <p className="text-xs text-black">
                  {user?.email || "email@example.com"}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Profile Button */}
            <DropdownMenuItem
              onClick={() => navigate("/company-info")}
              className="cursor-pointer"
            >
              <User className="h-4 w-4 text-muted-foreground mr-0" />
              {t("navigation.profile")}
            </DropdownMenuItem>

            {/* Settings */}
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/settings")}
              className="cursor-pointer"
            >
              {t("navigation.settings")}
            </DropdownMenuItem>

            <div className="h-px bg-gray-200" />

            {/* Logout */}
            <DropdownMenuItem
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");          // 1️⃣ clear local storage
                // setCurrentUser(null);                  // 2️⃣ reset main auth state
                setUser(null);                         // 3️⃣ reset barber context
                navigate("/");             // 4️⃣ send to login
              }}

              className="cursor-pointer text-shadow-red-400"
            >
              {t("navigation.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
