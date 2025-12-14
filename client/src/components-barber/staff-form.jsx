
import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useApp } from "../contexts/AppContext"
import { API_URL } from "../lib/config"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components-barber/ui/switch"
import { Checkbox } from "../components-barber/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { Textarea } from "../components-barber/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"



const roles = [
  { value: "senior-stylist", label: "Senior Stylist" },
  { value: "hair-specialist", label: "Hair Specialist" },
  { value: "color-expert", label: "Color Expert" },
  { value: "beauty-therapist", label: "Beauty Therapist" },
  { value: "junior-stylist", label: "Junior Stylist" },
]

const services = [
  { id: "haircut", name: "Classic Haircut" },
  { id: "beard-trim", name: "Beard Trim" },
  { id: "hair-spa", name: "Hair Spa" },
  { id: "hair-color", name: "Hair Color" },
  { id: "facial", name: "Facial Treatment" },
  { id: "massage", name: "Head Massage" },
  { id: "styling", name: "Hair Styling" },
  { id: "highlights", name: "Highlights" },
]

const workingDays = [
  { id: "monday", name: "Monday", short: "Mon" },
  { id: "tuesday", name: "Tuesday", short: "Tue" },
  { id: "wednesday", name: "Wednesday", short: "Wed" },
  { id: "thursday", name: "Thursday", short: "Thu" },
  { id: "friday", name: "Friday", short: "Fri" },
  { id: "saturday", name: "Saturday", short: "Sat" },
  { id: "sunday", name: "Sunday", short: "Sun" },
]

export function StaffForm({ staffId, initialData, onSuccess, isModal = false }) {
  const { navigate } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    role: initialData?.role || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    startTime: initialData?.startTime || "09:00",
    endTime: initialData?.endTime || "18:00",
    isActive: initialData?.isActive ?? true,
    selectedServices: initialData?.services || [],
    selectedDays: initialData?.workingDays || [],
    notes: initialData?.notes || "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        role: initialData.role || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        startTime: initialData.startTime || "09:00",
        endTime: initialData.endTime || "18:00",
        isActive: initialData.isActive ?? true,
        selectedServices: initialData.services || [],
        selectedDays: initialData.workingDays || [], // Assuming backend sends array of day IDs or formatted strings matching IDs
        notes: initialData.notes || "",
      })
    }
  }, [initialData])
  const handleSelectAll = () => {
    if (formData.selectedDays.length === workingDays.length) {
      // If all are selected → unselect all
      setFormData({ ...formData, selectedDays: [] });
    } else {
      // Select all
      setFormData({
        ...formData,
        selectedDays: workingDays.map((d) => d.id)
      });
    }
  };
  const handleCancel = () => {
    navigate("/dashboard/staff");
    console.log("Cancelled, going back to staff list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token");
      const url = staffId || initialData?._id
        ? `${API_URL}/api/staff/${staffId || initialData._id}`
        : `${API_URL}/api/staff`;

      const method = staffId || initialData?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save staff");
      }

      const data = await res.json();
      console.log("✅ Staff saved:", data);

      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate("/dashboard/staff");
      }

    } catch (err) {
      console.error("❌ Error saving staff:", err);
      // alert(err.message); // Consider using a toast notification instead
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }))
  }

  const handleDayToggle = (dayId) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter((id) => id !== dayId)
        : [...prev.selectedDays, dayId],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isModal ? "p-1" : ""}`}>
      {/* Back Button - Only show if NOT in modal */}
      {!isModal && (
        <Link to="/dashboard/staff">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff
          </Button>
        </Link>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="staff@salon.com"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Select the services this staff member can provide</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={service.id}
                  checked={formData.selectedServices.includes(service.id)}
                  onCheckedChange={() => handleServiceToggle(service.id)}
                />
                <Label htmlFor={service.id} className="text-sm cursor-pointer flex-1">
                  {service.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Working Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Working Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Working Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {workingDays.map((day) => {
                const isSelected = formData.selectedDays.includes(day.id);
                return (
                  <div
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`cursor-pointer rounded-lg border p-2 text-center text-sm font-medium transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                    {day.short}
                  </div>
                );
              })}
            </div>

            {/* Select All */}
            <div className="text-right">
              <Button type="button" variant="link" size="sm" onClick={handleSelectAll} className="h-auto p-0">
                {formData.selectedDays.length === workingDays.length ? "Unselect all" : "Select all"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Notes & Status */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes about this staff member..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <div className="flex flex-col">
              <Label htmlFor="isActive" className="font-semibold">Active Status</Label>
              <span className="text-sm text-muted-foreground">Staff member is visible and available for booking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background z-10 pb-2">
        {isModal && (
          <Button type="button" variant="outline" onClick={onSuccess ? () => onSuccess(null) : undefined}>
            Cancel
          </Button>
        )}
        {!isModal && (
          <Button onClick={handleCancel} type="button" variant="outline">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
          {isLoading ? "Saving..." : (staffId || initialData?._id) ? "Update Staff" : "Add Staff"}
        </Button>
      </div>
    </form>
  )
}
