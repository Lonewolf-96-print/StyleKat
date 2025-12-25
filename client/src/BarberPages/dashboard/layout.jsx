
import { DashboardSidebar } from "../../components-barber/sidebar"
import { DashboardHeader } from "../../components-barber/header"
import DashboardFooter from "../../components-barber/footer"

export default function DashboardLayout({
  children,
}) {
  return (
    <div className="flex h-screen bg-background salon-bg-pattern">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
          <div className="pb-20 lg:pb-0">
            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  )
}
