"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components-barber/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components-barber/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components-barber/ui/dropdown-menu"
import { MoreHorizontal, Download, Eye, CreditCard, Smartphone, Banknote } from "lucide-react"
import { format } from "date-fns"

// Mock transaction data
const mockTransactions = [
  {
    id: "TXN001",
    customer: {
      name: "Rahul Sharma",
      avatar: null,
    },
    service: "Classic Haircut + Beard Trim",
    amount: 450,
    paymentMethod: "upi",
    status: "completed",
    date: new Date(2024, 11, 20, 10, 30),
    staff: "Amit Kumar",
    transactionId: "UPI123456789",
  },
  {
    id: "TXN002",
    customer: {
      name: "Priya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    service: "Hair Spa Treatment",
    amount: 800,
    paymentMethod: "cash",
    status: "completed",
    date: new Date(2024, 11, 20, 11, 45),
    staff: "Sneha Gupta",
    transactionId: null,
  },
  {
    id: "TXN003",
    customer: {
      name: "Amit Kumar",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    service: "Hair Color",
    amount: 1200,
    paymentMethod: "card",
    status: "completed",
    date: new Date(2024, 11, 20, 14, 15),
    staff: "Ravi Singh",
    transactionId: "CARD987654321",
  },
  {
    id: "TXN004",
    customer: {
      name: "Sneha Gupta",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    service: "Facial Treatment",
    amount: 600,
    paymentMethod: "upi",
    status: "pending",
    date: new Date(2024, 11, 20, 15, 30),
    staff: "Pooja Sharma",
    transactionId: "UPI987654321",
  },
  {
    id: "TXN005",
    customer: {
      name: "Vikram Singh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    service: "Beard Trim",
    amount: 150,
    paymentMethod: "cash",
    status: "failed",
    date: new Date(2024, 11, 19, 16, 0),
    staff: "Amit Kumar",
    transactionId: null,
  },
]

const paymentMethodIcons = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
}

const statusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
}

export function TransactionsList() {
  const [transactions] = useState(mockTransactions)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const PaymentIcon = paymentMethodIcons[transaction.paymentMethod]

            return (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar>
                    <AvatarImage
                      src={transaction.customer.avatar || "/placeholder.svg"}
                      alt={transaction.customer.name}
                    />
                    <AvatarFallback>
                      {transaction.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground">{transaction.customer.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColors[transaction.status]}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{transaction.service}</p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>{format(transaction.date, "MMM dd, hh:mm a")}</span>
                        <span>Staff: {transaction.staff}</span>
                        <div className="flex items-center">
                          <PaymentIcon className="h-4 w-4 mr-1" />
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="font-semibold text-foreground">₹{transaction.amount}</div>
                    </div>

                    {transaction.transactionId && (
                      <p className="text-xs text-muted-foreground mt-1">ID: {transaction.transactionId}</p>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </DropdownMenuItem>
                    {transaction.status === "pending" && <DropdownMenuItem>Mark as Paid</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
