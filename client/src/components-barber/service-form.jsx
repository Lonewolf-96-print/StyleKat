
import { useEffect, useState } from "react";
import { API_URL } from "../lib/config";
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import Box from '@mui/material/Box';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components-barber/ui/switch"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"



const categories = [
  { value: "hair", label: "Hair" },
  { value: "beard", label: "Beard" },
  { value: "facial", label: "Facial" },
  { value: "massage", label: "Body Massage" },
  { value: "head", label: "Head Massage" },
  { value: "other", label: "Other" },
]
const barberId = localStorage.getItem("selectedBarberId");
export function ServiceForm({ serviceId, existingService }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    isActive: true,
  })



  // FIX: Fetch data if serviceId exists but existingService is not provided (Page Refresh scenario)
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId || existingService) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data) {
          setFormData({
            name: data.name || "",
            description: data.description || "",
            price: data.price || "",
            duration: data.duration || "",
            category: data.category || "",
            isActive: data.isActive ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, existingService]);

  useEffect(() => {
    if (existingService) {
      setFormData({
        name: existingService.name || "",
        description: existingService.description || "",
        price: existingService.price || "",
        duration: existingService.duration || "",
        category: existingService.category || "",
        isActive: existingService.isActive ?? true,
      });
    }
  }, [existingService]);
  const handleSubmit = async (e) => {

    e.preventDefault()
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token");
      const method = serviceId ? "PUT" : "POST";
      const url = serviceId ? `${API_URL}/${serviceId}` : API_URL;


      // Update existing service
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/dashboard/services");
        window.socket?.emit("serviceAdded", {
          barberId,
          service: data.service,
        });
      } else {
        alert(data.message || "Failed to save service");
      }
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Failed to save service. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard/services">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Details Card */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="text-lg font-semibold border-b pb-4">Basic Information</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Classic Haircut"
                  required
                  className="font-medium text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the service"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="text-lg font-semibold border-b pb-4">Pricing & Duration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    required
                    className="pl-8 text-lg font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (mins) *</Label>
                <div className="relative">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="30"
                    min="1"
                    required
                    className="pr-12 text-lg font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="text-lg font-semibold border-b pb-4">Settings</h3>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base">Active Status</Label>
                <p className="text-xs text-muted-foreground">Available for booking</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button type="submit" disabled={isLoading} className="w-full text-lg h-12">
              {isLoading ? "Saving..." : serviceId ? "Save Changes" : "Create Service"}
            </Button>
            <Link to="/dashboard/services" className="block">
              <Button type="button" variant="outline" className="w-full">
                Discard Changes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  )
}
