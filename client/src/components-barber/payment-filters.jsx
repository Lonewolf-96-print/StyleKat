"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Input } from "../components/ui/input"
import { Calendar, Download } from "lucide-react"

export function PaymentFilters() {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month")
  const [paymentMethod, setPaymentMethod] = useState("all")

  const periods = [
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "custom", label: "Custom Range" },
  ]

  const methods = [
    { value: "all", label: "All Methods" },
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI/Digital" },
    { value: "card", label: "Card" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-3">
        {/* Period Filter */}
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Method Filter */}
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Date Range (shown when custom is selected) */}
        {selectedPeriod === "custom" && (
          <>
            <Input type="date" className="w-40" />
            <span className="text-muted-foreground">to</span>
            <Input type="date" className="w-40" />
          </>
        )}
      </div>

      {/* Export Button */}
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export Report
      </Button>
    </div>
  )
}
