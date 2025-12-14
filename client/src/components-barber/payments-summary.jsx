import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, Users } from "lucide-react"

const summaryData = [
  {
    title: "Today's Revenue",
    value: "₹16,450",
    change: "+12% from yesterday",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "This Month",
    value: "₹10,45,600",
    change: "+18% from last month",
    trend: "up",
    icon: Calendar,
    color: "text-blue-600",
  },
  {
    title: "Total Transactions",
    value: "508",
    change: "+8 from yesterday",
    trend: "up",
    icon: CreditCard,
    color: "text-purple-600",
  },
  {
    title: "Avg. per Customer",
    value: "₹569",
    change: "-2% from last week",
    trend: "down",
    icon: Users,
    color: "text-orange-600",
  },
]

export function PaymentsSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="flex items-center text-xs mt-1">
              {item.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={item.trend === "up" ? "text-green-600" : "text-red-600"}>{item.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
