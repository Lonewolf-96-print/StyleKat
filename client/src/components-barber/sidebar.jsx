import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Scissors,
  Calendar,
  Users,
  Settings,
  Store,
  Building
} from "lucide-react";
import { useLanguage } from "../components-barber/language-provider";
import Image from "/salon.png";

const barberId = localStorage.getItem("shopId");

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "myShop", href: "/my-shop", icon: Store },
  { name: "companyInfo", href: `/dashboard/company-info/${barberId}`, icon: Building },
  { name: "appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const { t } = useLanguage();

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={cn(
          // Base styles (Mobile First - Bottom Bar)
          "fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-lg lg:shadow-none lg:border-t-0",
          "flex flex-row justify-between items-center px-4 py-2",

          // Desktop styles (Sidebar)
          "lg:fixed lg:inset-y-0 lg:left-0 lg:flex-col lg:justify-start lg:w-64 lg:bg-sidebar lg:border-r lg:border-sidebar-border lg:px-0 lg:py-0"
        )}
      >

        {/* Header (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-center h-24 border-b border-sidebar-border bg-primary w-full mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 bg-white rounded-full p-1">
              <img src={Image} alt="Salon Logo" className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground leading-none">StyleKat</h1>
              <p className="text-[10px] text-primary-foreground/80 mt-1 uppercase tracking-wider">
                {t("auth.salonOwner")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className={cn(
          "flex flex-1 w-full justify-between items-center", // Mobile: spread horizontally
          "lg:flex-col lg:justify-start lg:space-y-4 lg:px-4" // Desktop: stack vertically with more space
        )}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  // Base (Mobile)
                  "flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all duration-200 group flex-1 lg:flex-none",

                  // Desktop
                  "lg:flex-row lg:space-y-0 lg:w-full lg:px-4 lg:py-3.5",

                  isActive
                    ? "text-primary lg:bg-sidebar-accent lg:text-sidebar-accent-foreground"
                    : "text-gray-400 hover:text-gray-600 lg:text-sidebar-foreground lg:hover:bg-sidebar-accent lg:hover:text-sidebar-accent-foreground"
                )}
              >
                {/* Icon Wrapper for better active state control */}
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive ? "bg-primary/10 lg:bg-transparent" : "bg-transparent"
                )}>
                  <item.icon className={cn(
                    "h-6 w-6 lg:mr-3 lg:h-5 lg:w-5",
                    isActive ? "fill-current lg:fill-none" : ""
                  )} />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[10px] font-medium lg:text-sm",
                  isActive ? "font-semibold" : ""
                )}>
                  {t(`navigation.${item.name}`)}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Spacer/Footer area on Desktop (Optional) */}
        <div className="hidden lg:block mt-auto p-4 w-full">
          {/* Could add Logout here later */}
          <div className="text-xs text-center text-gray-400">
            v1.0.0
          </div>
        </div>

      </div>
      {/* Spacer for mobile to prevent content being hidden behind bottom bar */}
      <div className="lg:hidden h-20 w-full" />
    </>
  );
}