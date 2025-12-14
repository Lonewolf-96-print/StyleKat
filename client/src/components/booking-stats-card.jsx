"use client"

import { motion } from "framer-motion"
import { Card } from "../components/ui/card"

import { cn } from "../lib/utils"



export function BookingStatsCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="relative overflow-hidden p-6 hover:shadow-xl transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-card/50">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl bg-opacity-10 ring-1 ring-inset ring-black/5 dark:ring-white/10", color)}>
            <Icon className="w-6 h-6" />
          </div>
          {/* Optional: Add a sparkline or mini-chart here later */}
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>

        {trend && (
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <span className="font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px] mr-2">
              {trend}
            </span>
          </div>
        )}

        {/* Decorational background blob */}
        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-2xl", color.split(" ")[0].replace("/10", ""))} />
      </Card>
    </motion.div>
  )
}
