"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Input } from "../components/ui/input"
import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useBookings } from "../contexts/BookingsContext"
export function AppointmentFilters() {
  const {selectedFilter, setSelectedFilter} = useBookings();
  const { t } = useTranslation()

  const [searchTerm, setSearchTerm] = useState("")

  const filters = [
    { value: "all", label: t("appointments.filters.all") },
    { value: "today", label: t("appointments.filters.today") },
    { value: "comfirmed", label: t("appointments.confirmed") },
   
    { value: "cancelled", label: t("appointments.filters.cancelled") },
    { value: "pending", label: t("appointments.filters.pending") },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.slice(0, 4).map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 flex-1 max-w-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("appointments.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("appointments.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
              
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
