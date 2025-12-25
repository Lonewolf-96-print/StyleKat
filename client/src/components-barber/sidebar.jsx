import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Scissors,
  Calendar,
  Users,
  Settings,
  Menu,
  X,
  Store
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../components-barber/language-provider";
import Image from "/salon.png";

const barberId = localStorage.getItem("shopId");

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "myShop", href: "/my-shop", icon: Store },
  { name: "companyInfo", href: `/dashboard/company-info/${barberId}`, icon: Store },
  { name: "services", href: "/dashboard/services", icon: Scissors },
  { name: "appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "staff", href: "/dashboard/staff", icon: Users },
  { name: "settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[90] bg-white border rounded-md p-2 shadow"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar Drawer */}
      <div
        className={cn(
          // Base styles
          "fixed inset-y-0 left-0 w-64 bg-sidebar z-[80] transform transition-transform duration-300",

          // Mobile slide effect
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",

          // Desktop: ALWAYS visible and FIXED
          "lg:translate-x-0 lg:fixed lg:left-0 lg:top-0 lg:h-full"
        )}
      >
        {/* Mobile Menu Button */}
        {!isMobileMenuOpen && (
          <button
            className="lg:hidden fixed top-4 left-4 z-[90] bg-white border rounded-md p-2 shadow"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-sidebar-border bg-primary lg:justify-center">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <img src={Image} alt="Salon Logo" className="object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">StyleKat</h1>
              <p className="text-xs text-primary-foreground/80">
                {t("auth.salonOwner")}
              </p>
            </div>
          </div>

          {/* Close button mobile only */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {t(`navigation.${item.name}`)}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[70] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}