"use client"

import { Card } from "../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", bookings: 4 },
  { month: "Feb", bookings: 3 },
  { month: "Mar", bookings: 2 },
  { month: "Apr", bookings: 5 },
  { month: "May", bookings: 4 },
  { month: "Jun", bookings: 6 },
]

export function BookingTrendChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Booking Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ fill: "var(--color-primary)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
