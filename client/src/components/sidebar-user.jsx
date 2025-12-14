"use client"

import {Link} from "react-router-dom"
import {useParams} from "react-router-dom"
import { motion } from "framer-motion"
import { LayoutDashboard, Calendar, Bell, User, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"



export function SidebarUser({ open, setOpen }) {
  const pathname = useParams()

  const navItems = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/bookings", label: "My Bookings", icon: Calendar },
    { href: "/user/notifications", label: "Notifications", icon: Bell },
    { href: "/user/profile", label: "Profile", icon: User },
    { href: "/user/settings", label: "Settings", icon: Settings },
  ]

  const isActive = (href) => pathname === href

  return (
    <motion.aside
      initial={{ width: open ? 280 : 80 }}
      animate={{ width: open ? 280 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-card border-r border-border flex flex-col h-screen"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        {open && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold text-foreground"
          >
            Salon
          </motion.h1>
        )}
        <button onClick={() => setOpen(!open)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          {open ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
                {active && open && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-6 bg-primary-foreground rounded-l-full"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <motion.button
          whileHover={{ x: 4 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {open && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium"
            >
              Logout
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.aside>
  )
}
