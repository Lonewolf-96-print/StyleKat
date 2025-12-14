

import { useState } from "react"
import { AppointmentForm } from "../../../../components-barber/appointment-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components-barber/ui/card"
import DashboardFooter from "../../../../components-barber/footer"
import { DashboardHeader } from "../../../../components-barber/header"
import { DashboardSidebar } from "../../../../components-barber/sidebar"
import { Button } from "../../../../components-barber/ui/button"
import { Menu, X } from "lucide-react"

export default function NewAppointmentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Desktop) */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <DashboardSidebar />
      </div>

      {/* Sidebar Drawer (Mobile/Tablet) */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 lg:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-white transform transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <DashboardSidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Header */}
        <DashboardHeader />

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Appointment</h1>
          <p className="text-muted-foreground">
            Book a new appointment for a customer
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>
              Fill in the appointment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentForm />
          </CardContent>
        </Card>

        <DashboardFooter />
      </div>
    </div>
  )
}
