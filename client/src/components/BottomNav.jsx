
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User, Store, Scissors, LayoutDashboard, Building, Settings, Bell } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { cn } from '../lib/utils'; // Assuming you have a utils file for merging classes, or I'll just use template literals

import { useNotifications } from '../contexts/UserNotificationsContext';

export default function BottomNav() {
    const { currentUser } = useApp();
    const { unreadCount } = useNotifications(); // Get unread count
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
        {
            label: "Notifications",
            icon: Bell,
            path: "/notifications",
            badge: unreadCount // Pass unread count for badge
        },
        { label: "Profile", icon: User, path: "/profile" },
    ];
    const barberId = localStorage.getItem("shopId");

    // Simplified Barber Tabs
    const barberTabs = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "My Shop", icon: Store, path: "/my-shop" },
        { label: "Company Info", icon: Building, path: `/dashboard/company-info/${barberId}` },
        { label: "Appointments", icon: Calendar, path: "/dashboard/appointments" },
        { label: "Settings", icon: Settings, path: "/dashboard/settings" },
    ];

    const storedRole = localStorage.getItem("role");
    const role = currentUser?.role || storedRole;

    const tabs = role === "barber" ? barberTabs : userTabs;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 z-50 lg:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
            <div className={`flex justify-between items-center max-w-md mx-auto`}>
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
                p-2 rounded-xl transition-all duration-300 ease-out relative
                ${isActive
                                    ? 'bg-primary/10 text-primary translate-y-[-4px]'
                                    : 'text-gray-400 hover:text-gray-600'
                                }
              `}>
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />

                                {/* Notification Red Dot */}
                                {tab.badge > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>

                            <span className={`
                text-[10px] font-medium transition-all duration-300
                ${isActive ? 'text-primary' : 'text-gray-400'}
              `}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
