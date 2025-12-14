"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useState } from "react"
import { Button } from "../components/ui/button"

const dailyData = [
  { name: "Mon", revenue: 4200, transactions: 12 },
  { name: "Tue", revenue: 3800, transactions: 10 },
  { name: "Wed", revenue: 5600, transactions: 16 },
  { name: "Thu", revenue: 4900, transactions: 14 },
  { name: "Fri", revenue: 6200, transactions: 18 },
  { name: "Sat", revenue: 8100, transactions: 22 },
  { name: "Sun", revenue: 5400, transactions: 15 },
]

const monthlyData = [
  { name: "Jan", revenue: 85000, transactions: 320 },
  { name: "Feb", revenue: 92000, transactions: 350 },
  { name: "Mar", revenue: 78000, transactions: 290 },
  { name: "Apr", revenue: 105000, transactions: 410 },
  { name: "May", revenue: 118000, transactions: 450 },
  { name: "Jun", revenue: 125000, transactions: 480 },
]

export function PaymentsChart() {
  const [chartType, setChartType] = useState("daily")
  const [viewType, setViewType] = useState("revenue")

  const data = chartType === "daily" ? dailyData : monthlyData

  return (
    <Card className="w-full lg:w-auto">
  <CardHeader>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>
          {chartType === "daily" ? "Daily" : "Monthly"} {viewType} overview
        </CardDescription>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={chartType === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("daily")}
        >
          Daily
        </Button>
        <Button
          variant={chartType === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={viewType === "revenue" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewType("revenue")}
        >
          Revenue
        </Button>
        <Button
          variant={viewType === "transactions" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewType("transactions")}
        >
          Transactions
        </Button>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        {viewType === "revenue" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name]} />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${value}`, name]} />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
  )
}
