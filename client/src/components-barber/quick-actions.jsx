import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Calendar, Users, Scissors } from "lucide-react"
import { Link } from "react-router-dom"

const actions = [
  {
    title: "Update Shop Info",
    description: "Edit your shop details",
    icon: Calendar,
    href: "/dashboard/settings",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Add Service",
    description: "Create a new service",
    icon: Scissors,
    href: "/dashboard/services/new",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Add Staff",
    description: "Add new team member",
    icon: Users,
    href: "/dashboard/staff/new",
    color: "bg-purple-500 hover:bg-purple-600",
  },
]

export function QuickActions() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {actions.map((action) => (
          <Link key={action.title} to={action.href} className="group">
            <div className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
              <div className={`p-3 rounded-lg ${action.color.split(' ')[0]} bg-opacity-10 ${action.color.replace('bg-', 'text-').split(' ')[0]}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
