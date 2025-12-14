"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useLanguage } from "./language-provider"
import { useBookings } from "../contexts/BookingsContext"
import { useMemo } from "react"

function getWeekRange() {
  const now = new Date()
  const first = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Monday
  const last = new Date(first)
  last.setDate(first.getDate() + 6)

  const options = { day: "numeric", month: "short" }
  const startStr = first.toLocaleDateString("en-US", options)
  const endStr = last.toLocaleDateString("en-US", options)

  return `${startStr} - ${endStr}`
}

export function RevenueChart() {
  const { t } = useLanguage()
  const { allBookings } = useBookings()
  console.log("Booking info in the revenue chart",allBookings)
  const weekRange = getWeekRange()

  // 🟦 7-Day Week Structure
  const baseWeek = [
    { key: 1, name: "day.Mon", revenue: 0 },
    { key: 2, name: "day.Tue", revenue: 0 },
    { key: 3, name: "day.Wed", revenue: 0 },
    { key: 4, name: "day.Thu", revenue: 0 },
    { key: 5, name: "day.Fri", revenue: 0 },
    { key: 6, name: "day.Sat", revenue: 0 },
    { key: 0, name: "day.Sun", revenue: 0 },
  ]

  // 🟩 Compute revenue per day dynamically
  const weeklyRevenue = useMemo(() => {
    if (!allBookings?.length) return baseWeek

    const updated = [...baseWeek]

    allBookings.forEach((b) => {
      const bookingDate = new Date(b.date)
      const dayIndex = bookingDate.getDay() // Sun = 0

      const targetDay = updated.find((d) => d.key === dayIndex)
      if (targetDay && b.status === "completed") {
        const price = b?.servicePrice || 0
        targetDay.revenue += price
      }
    })

    return updated.map((d) => ({
      ...d,
      name: t(d.name) // translate "day.Mon" → सोम
    }))
  }, [allBookings, t])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.weeklyRevenue")}</CardTitle>
        <CardDescription>{t("charts.weeklyRevenueDescription")}</CardDescription>

        <p className="text-sm text-muted-foreground mt-1">
          {t("charts.weekRange")}: {weekRange}
        </p>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, t("charts.revenue")]} />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
