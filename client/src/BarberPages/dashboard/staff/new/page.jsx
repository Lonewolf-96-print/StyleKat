import { StaffForm } from "../../../../components-barber/staff-form"
import DashboardFooter from "../../../../components-barber/footer"
import { DashboardHeader } from "../../../../components-barber/header"
import { DashboardSidebar } from "../../../../components-barber/sidebar"

export default function NewStaffPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6">
      {/* Sidebar (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <DashboardHeader />

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Add Staff Member</h1>
            <p className="text-muted-foreground">Add a new team member to your salon</p>
          </div>

          <StaffForm />
        </div>

        <DashboardFooter />
      </div>
    </div>
  )
}
