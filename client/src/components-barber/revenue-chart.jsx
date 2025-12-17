"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { useLanguage } from "./language-provider"
import { useBookings } from "../contexts/BookingsContext"
import { useMemo } from "react"

const WEEK_DAYS = [
  { key: 1, label: "day.Mon" },
  { key: 2, label: "day.Tue" },
  { key: 3, label: "day.Wed" },
  { key: 4, label: "day.Thu" },
  { key: 5, label: "day.Fri" },
  { key: 6, label: "day.Sat" },
  { key: 0, label: "day.Sun" },
]

function getWeekRange() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const opts = { day: "numeric", month: "short" }
  return `${monday.toLocaleDateString("en-US", opts)} - ${sunday.toLocaleDateString("en-US", opts)}`
}

export function RevenueChart() {
  const { t } = useLanguage()
  const { allBookings } = useBookings()

  const weekRange = getWeekRange()

  const weeklyRevenue = useMemo(() => {
    const base = WEEK_DAYS.map(d => ({
      key: d.key,
      name: t(d.label),
      revenue: 0
    }))

    if (!allBookings?.length) return base

    const REVENUE_STATUSES = ["confirmed", "in-service", "completed"]

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    allBookings.forEach(b => {
      if (!REVENUE_STATUSES.includes(b.status)) return

      const date = new Date(b.date)
      if (date < startOfWeek || date > endOfWeek) return

      const day = date.getDay()
      const target = base.find(d => d.key === day)

      if (target) {
        target.revenue += Number(b.price || 0)
      }
    })

    return base
  }, [allBookings, t])


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.weeklyRevenue")}</CardTitle>
        <CardDescription>
          {t("charts.weeklyRevenueDescription")}
        </CardDescription>
        <p className="text-sm text-muted-foreground">
          {t("charts.weekRange")}: {weekRange}
        </p>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyRevenue}>
            {/* Gradient definition */}
            <defs>
              <linearGradient id="revenueGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />

            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={(v) => `₹${v}`}
              allowDecimals={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(34,197,94,0.1)" }}
              formatter={(v) => [`₹${v}`, t("charts.revenue")]}
            />

            <Bar
              dataKey="revenue"
              radius={[8, 8, 0, 0]}
              fill="url(#revenueGreen)"
            />
          </BarChart>

        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
