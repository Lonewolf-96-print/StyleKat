import { ServiceForm } from "../../../../components-barber/service-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components-barber/ui/card"
import { useParams } from "react-router-dom"
import DashboardFooter from "../../../../components-barber/footer"
import { DashboardHeader } from "../../../../components-barber/header"
import { DashboardSidebar } from "../../../../components-barber/sidebar"

export default function EditServicePage() {
  const { id } = useParams()

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-0">
        <DashboardHeader />

        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Service</h1>
          <p className="text-muted-foreground">
            Update your service details
          </p>
        </div>

        {/* Service Form Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Update the information for this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm serviceId={id} />
          </CardContent>
        </Card>

        <DashboardFooter />
      </div>
    </div>
  )
}
