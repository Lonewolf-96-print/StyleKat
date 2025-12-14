import { StaffForm } from "../../../../components-barber/staff-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components-barber/ui/card"
import DashboardFooter from "../../../../components-barber/footer"
import { DashboardHeader } from "../../../../components-barber/header"
import { DashboardSidebar } from "../../../../components-barber/sidebar"
import { useParams } from "react-router-dom"
export default function EditStaffPage() {
  const params = useParams();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <DashboardHeader />

        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Staff Member</h1>
          <p className="text-muted-foreground">Update staff member information</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Staff Details</CardTitle>
            <CardDescription>Update the information for this staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffForm staffId={params.id} />
          </CardContent>
        </Card>

        <DashboardFooter />
      </div>
    </div>
  )
}
