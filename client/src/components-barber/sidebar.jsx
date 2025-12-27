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
import Image from "/tech-support.png";

const barberId = localStorage.getItem("shopId");

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "myShop", href: "/my-shop", icon: Store },
  { name: "shopInfo", href: `/dashboard/company-info/${barberId}`, icon: Building },
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
          // Mobile: Bottom Bar
          "fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)] lg:shadow-none lg:border-t-0",
          "flex flex-row justify-around items-center px-2 py-3 safe-area-bottom",

          // Desktop: Sidebar
          "lg:fixed lg:inset-y-0 lg:left-0 lg:flex-col lg:justify-start lg:w-72 lg:bg-[#0f172a] lg:text-white lg:px-0 lg:py-0 transition-all duration-300 ease-in-out"
        )}
      >

        {/* Header (Desktop Only) */}
        <div className="hidden lg:flex flex-col items-center justify-center h-32 w-full bg-[#1e293b]/50 mb-6 border-b border-white/5">
          <div className="relative w-16 h-16 bg-white rounded-full p-1.5 shadow-lg shadow-black/20 mb-3 ring-4 ring-white/10">
            <img src={Image} alt="Salon Logo" className="object-contain w-full h-full rounded-full" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">StyleKat</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-medium">
              {t("auth.salonOwner")}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className={cn(
          "flex flex-1 w-full justify-between items-center", // Mobile
          "lg:flex-col lg:justify-start lg:space-y-2 lg:px-4 lg:py-2" // Desktop
        )}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  // Base (Mobile)
                  "flex flex-col items-center justify-center space-y-1 p-2 rounded-xl transition-all duration-200 group flex-1 lg:flex-none relative overflow-hidden",

                  // Desktop
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

                {/* Icon Wrapper */}
                <item.icon className={cn(
                  "h-6 w-6 lg:mr-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "fill-current lg:fill-none" : ""
                )} />

                {/* Label */}
                <span className={cn(
                  "text-[10px] font-medium lg:text-sm tracking-wide lg:tracking-normal",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {t(`navigation.${item.name}`)}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 p-6 w-full mt-auto bg-gradient-to-t from-[#0f172a] to-transparent">
          <div className="bg-[#1e293b] rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-semibold text-slate-300 mb-1">Need Help?</h4>
            <p className="text-[10px] text-slate-500 mb-2">Contact Us:salon@stylekat.in</p>
            <div className="text-[10px] text-center text-slate-600 mt-2 font-mono">
              v1.0.0
            </div>
          </div>
        </div>

      </div>

      {/* Spacer for mobile bottom bar */}
      <div className="lg:hidden h-20 w-full" />
    </>
  );
}