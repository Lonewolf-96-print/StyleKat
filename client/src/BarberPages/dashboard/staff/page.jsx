import { StaffList } from "../../../components-barber/staff-list"
import { Button } from "../../../components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "../../../components-barber/language-provider"
import DashboardFooter from "../../../components-barber/footer"
import { DashboardHeader } from "../../../components-barber/header"
import { DashboardSidebar } from "../../../components-barber/sidebar"

export default function StaffPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6">
      {/* Sidebar (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <DashboardHeader />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("staff.title")}</h1>
            <p className="text-muted-foreground">{t("staff.subtitle")}</p>
          </div>
          <Link to="/dashboard/staff/new">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              {t("staff.addStaffMember")}
            </Button>
          </Link>
        </div>

        {/* Staff List */}
        <StaffList />

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  )
}
