

import { useState } from "react"
import { useNavigate} from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components-barber/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import {Link} from "react-router-dom"

const services = [
  { id: "1", name: "Classic Haircut", duration: 45, price: 300 },
  { id: "2", name: "Beard Trim & Shape", duration: 30, price: 150 },
  { id: "3", name: "Hair Spa Treatment", duration: 90, price: 800 },
  { id: "4", name: "Hair Color", duration: 120, price: 1200 },
  { id: "5", name: "Facial Treatment", duration: 60, price: 600 },
]



export function AppointmentForm() {
  const navigate =useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    notes: "",
  })

  const selectedService = services.find((s) => s.id === formData.serviceId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect back to appointments list
    navigate("/dashboard/appointments")
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/appointments">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>
      </Link>

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange("customerPhone", e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email (Optional)</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange("customerEmail", e.target.value)}
            placeholder="customer@example.com"
          />
        </div>
      </div>

      {/* Appointment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Appointment Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service *</Label>
            <Select value={formData.serviceId} onValueChange={(value) => handleInputChange("serviceId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ₹{service.price} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffId">Staff Member *</Label>
            <Select value={formData.staffId} onValueChange={(value) => handleInputChange("staffId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>

        {selectedService && (
          <div className="p-4 bg-card rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{selectedService.name}</p>
                <p className="text-sm text-muted-foreground">Duration: {selectedService.duration} minutes</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">₹{selectedService.price}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Any special requirements or notes..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Booking..." : "Book Appointment"}
        </Button>
        <Link href="/dashboard/appointments">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
