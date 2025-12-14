"use client"

import { Menu, Bell, User } from "lucide-react"
import { useCustomer } from "../contexts/CustomerContext";
import { DropdownMenu,DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components-barber/ui/avatar";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../components-barber/ui/dropdown-menu";
import { useLanguage } from "../components-barber/language-provider";
import { useApp } from "../contexts/AppContext";
import { use } from "react";
import { useEffect } from "react";
export function Header({ onMenuClick }) {
  const { customer, setCustomer, loading } = useCustomer();
  const { navigate } = useApp();
  function AvatarFallbackText({ name }) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const initials =
      parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0][0];
    return initials.toUpperCase();
  }
  const { t } = useLanguage();
  // console.log("Header - Current Customer:", customer);
  // ✨ Prevent header from rendering until customer is loaded
  if (loading) return null;
 
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
  <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
      <Avatar className="h-8 w-8">
       
        <AvatarFallback>
                  <AvatarFallbackText name={customer?.name} />
                </AvatarFallback>
      
      </Avatar>
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    className="p-0 border rounded-xl w-64"
    align="end"
    forceMount
  >
    {/* --- Your clean profile card --- */}
    <div className="rounded-xl bg-white p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
          {customer?.name?.charAt(0) || "U"}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {customer?.name}
          </p>
          <p className="text-xs text-gray-500">
            {customer?.email}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-200" />
        <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer  hover:bg-gray-100 hover:text-black flex items-center gap-2"
            >
              <User className="h-4 w-4 text-muted-foreground mr-0" />
              {t("navigation.profile")}
            </DropdownMenuItem>


      <button
        onClick={() => {
          setCustomer(null);
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerUser");
          navigate("/login/user");
        }}
        className="w-full text-left px-2 py-0 flex items-center gap-2 cursor-pointer  text-red-600 hover:bg-red-50 transition rounded-none"
      >
        Logout
      </button>
     
    </div>
  </DropdownMenuContent>
</DropdownMenu>


      </div>
    </header>
  );
}
