import { ServicesList } from "../../../../components-barber/services-list"
import { Button } from "../../../../components-barber/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import DashboardFooter from "../../../../components-barber/footer"
import { DashboardHeader } from "../../../../components-barber/header"
import { DashboardSidebar } from "../../../../components-barber/sidebar"
import { useApp } from "../../../../contexts/AppContext"
import { useLanguage } from "../../../../components-barber/language-provider"
export default function ServicesPage() {
  const { t } = useLanguage();
  const { currentUser } = useApp();
  // console.log("CurrentUser ", currentUser)
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        <DashboardHeader />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("services.title")}</h1>
            <p className="text-muted-foreground">
              {t("services.subtitle")}
            </p>
          </div>

          <Link to="/dashboard/services/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("services.addService")}
            </Button>
          </Link>
        </div>

        <ServicesList />
        <DashboardFooter />
      </div>
    </div>
  )
}
