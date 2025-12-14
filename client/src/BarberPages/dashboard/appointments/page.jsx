

import { useState } from "react"
import { AppointmentsList } from "../../../components-barber/appointments-list"
import { AppointmentFilters } from "../../../components-barber/appointment-filters"
import { Button } from "../../../components-barber/ui/button"
import { Plus, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "../../../components-barber/language-provider"
import DashboardFooter from "../../../components-barber/footer"
import { DashboardHeader } from "../../../components-barber/header"
import { DashboardSidebar } from "../../../components-barber/sidebar"

export default function AppointmentsPage() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <DashboardHeader />

        {/* Page Header */}
         <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("appointments.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("appointments.subtitle")}
            </p>
          </div>
          
        </div>


        {/* Staff List */}
       <AppointmentsList />

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>

  )
}
