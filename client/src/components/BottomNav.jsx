
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User, Store, Scissors, LayoutDashboard, Building } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { cn } from '../lib/utils'; // Assuming you have a utils file for merging classes, or I'll just use template literals

export default function BottomNav() {
    const { currentUser } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    // Hide on auth pages or 404
    const hideOnRoutes = [
        "/login",
        "/signup",
        "/login/user",
        "/login/barber",
        "/signup/user",
        "/auth/signup"
    ];

    if (hideOnRoutes.includes(location.pathname)) {
        return null;
    }

    const userTabs = [
        { label: "Dashboard", icon: Home, path: "/user/dashboard" },
        { label: "Find Salons", icon: Search, path: "/search-salon" },
        { label: "My Bookings", icon: Calendar, path: "/my-bookings" },
        { label: "Notifications", icon: User, path: "/notifications" },
        { label: "Profile", icon: User, path: "/profile" },
    ];

    const barberTabs = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "My Shop", icon: Store, path: "/my-shop" },
        { label: "Company Info", icon: Building, path: "/dashboard/company-info" },
        { label: "Services", icon: Scissors, path: "/dashboard/services" }, // Quick access to services
        { label: "Appointments", icon: Calendar, path: "/dashboard/appointments" }, // Quick access to services
        { label: "Staff", icon: User, path: "/dashboard/staff" }, // Quick access to services
        { label: "Settings", icon: Settings, path: "/dashboard/settings" }, // Quick access to services
    ];

    const tabs = currentUser?.role === "barber" ? barberTabs : userTabs;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 z-50 lg:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.path;

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className="group flex flex-col items-center justify-center w-16 space-y-1 relative"
                        >
                            <div className={`
                p-2 rounded-xl transition-all duration-300 ease-out
                ${isActive
                                    ? 'bg-primary/10 text-primary translate-y-[-4px]'
                                    : 'text-gray-400 hover:text-gray-600'
                                }
              `}>
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            <span className={`
                text-[10px] font-medium transition-all duration-300
                ${isActive ? 'text-primary' : 'text-gray-400'}
              `}>
                                {tab.label}
                            </span>

                            {/* Active Indicator Dot */}
                            {/* {isActive && (
                <span className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full animate-fade-in" />
              )} */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
