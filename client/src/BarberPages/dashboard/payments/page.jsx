import { PaymentsSummary } from "../../../components-barber/payments-summary"
import { TransactionsList } from "../../../components-barber/transactions-list"
import { PaymentsChart } from "../../../components-barber/payments-chart"
import { PaymentFilters } from "../../../components-barber/payment-filters"
import { useLanguage } from "../../../components-barber/language-provider"
import DashboardFooter from "../../../components-barber/footer"
import { DashboardHeader } from "../../../components-barber/header"
import { DashboardSidebar } from "../../../components-barber/sidebar"

export default function PaymentsPage() {
  const { t } = useLanguage()

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <DashboardHeader />

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("payments.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("payments.subtitle")}
          </p>
        </div>

        {/* Summary Cards */}
        <PaymentsSummary />

        {/* Filters */}
        <PaymentFilters />

        {/* Charts and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <PaymentsChart />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">
                {t("payments.paymentMethods")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("payments.cash")}
                  </span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("payments.upiDigital")}
                  </span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("payments.card")}
                  </span>
                  <span className="font-medium">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <TransactionsList />

        <DashboardFooter />
      </div>
    </div>
  )
}
