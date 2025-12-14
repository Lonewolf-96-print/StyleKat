import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Calendar, IndianRupee, BarChart3 } from "lucide-react"
import { useLanguage } from "../components-barber/language-provider"
import { useBookings } from "../contexts/BookingsContext"
import { CalendarDays } from "lucide-react"
import { color } from "framer-motion"

export function StatsCards() {
  const { t } = useLanguage()
  const { todayBookings, allBookings } = useBookings()

  // -----------------------------
  // 1. TOTAL BOOKINGS + REVENUE
  // -----------------------------
  const totalBookings = allBookings.length
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.price || 0), 0)

  // -----------------------------
  // 2. MONTHLY BOOKINGS + REVENUE
  // -----------------------------
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const validExpectedStatuses = ["confirmed", "in-service", "completed"]

  const monthlyBookingsList = allBookings.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const monthlyBookings = monthlyBookingsList.length
  const monthlyRevenue = monthlyBookingsList.reduce((sum, b) => sum + (b.price || 0), 0)
  const expectedBookingsList = allBookings.filter(b =>
    validExpectedStatuses.includes(b.status)
  )

  const expectedBookings = expectedBookingsList.length
  const expectedRevenue = expectedBookingsList.reduce(
    (sum, b) => sum + (b.price || 0),
    0
  )

  // -----------------------------
  // 3. TODAY BOOKINGS + REVENUE
  // -----------------------------
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.price || 0), 0)

  // -----------------------------
  // 4. EXPECTED REVENUE
  // (confirmed + in-service + completed)
  // -----------------------------


  // -----------------------------
  // FINAL CARDS
  // -----------------------------
  const cards = [
    {
      title: "Total Bookings",
      icon: IndianRupee,
      color: "text-blue-600",

      bookingValue: totalBookings,
      revenueValue: `₹${totalRevenue}`,
    },
    {
      title: "Monthly Bookings",
      icon: CalendarDays,
      bookingValue: monthlyBookings,
      revenueValue: `₹${monthlyRevenue}`,
      color: "text-green-600",

    },

    {
      title: "Expected Revenue",
      icon: BarChart3,
      bookingValue: expectedBookings,   // ✔ Correct
      revenueValue: `₹${expectedRevenue}`,
      color: "text-purple-600",
    },
    {
      title: "Today's Bookings",
      icon: Calendar,
      bookingValue: todayBookings.length,
      revenueValue: `₹${todayRevenue}`,
      color: "text-orange-600",
    },

  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <Card key={idx} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200">
          {/* Color Accent Bar */}
          <div className={`absolute top-0 right-0 p-3 opacity-10 ${card.color.replace('text-', 'bg-')}`}>
            <card.icon className="h-24 w-24" />
          </div>

          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.color.replace('text-', 'bg-').replace('600', '100')}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-gray-900">
              {card.revenueValue}
            </div>
            <div className="flex items-center text-xs font-medium text-muted-foreground mt-1">
              <span className={`${card.bookingValue > 0 ? "text-emerald-600" : "text-gray-500"} mr-1`}>
                {card.bookingValue}
              </span>
              Bookings
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
