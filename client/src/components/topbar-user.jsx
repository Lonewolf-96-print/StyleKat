"use client"

import { Menu, Bell, User } from "lucide-react"
import { motion } from "framer-motion"



export function TopBarUser({ onMenuClick }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-card border-b border-border px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">Welcome back!</h2>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <User className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.header>
  )
}
