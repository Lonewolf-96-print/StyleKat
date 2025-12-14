"use client"

import { useEffect, useState } from "react"
import { useApp } from "../contexts/AppContext";
import { API_URL } from "../lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components-barber/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components-barber/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, ShieldMinus, Search, Clock, IndianRupee, ShieldPlus } from "lucide-react"
import { Link } from "react-router-dom"
import { ServiceEditModal } from "./ServiceEditModel"



const categoryColors = {
  Hair: "bg-blue-100 text-blue-800",
  Beard: "bg-green-100 text-green-800",
  Facial: "bg-purple-100 text-purple-800",
  Massage: "bg-orange-100 text-orange-800",
}

export function ServicesList() {
  const barberId = localStorage.getItem("barberId");
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingService, setEditingService] = useState(null);

  // const [filteredServices,setFilteredServices]=useState("")

  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem("token");

      try {

        const res = await fetch(`${API_URL} /api/services / `, {
          headers: {
            Authorization: `Bearer ${token} `,
          },
        });
        console.log("📡 Raw response:", res)


        const data = await res.json();
        if (res.ok) setServices(data);
        console.log("Services info")
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);
  const filteredServices = (services || []).filter(
    (service) =>
    (service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  )




  // Edit service
  const handleSaveService = async (updatedService) => {
    try {
      const token = localStorage.getItem("token");
      const original = services.find((s) => s._id === updatedService._id);
      if (!original) return console.error("Original service not found");
      const changes = {};
      for (const key of Object.keys(updatedService)) {
        if (JSON.stringify(updatedService[key]) !== JSON.stringify(original[key])) {
          changes[key] = { from: original[key], to: updatedService[key] };
        }
      }
      const changeSummary = Object.entries(changes)
        .map(([field, { from, to }]) => `${field} changed from "${from}" → "${to}"`)
        .join(", ");

      if (!changeSummary) {
        console.log("No actual changes detected — skipping update");
        return;
      }

      console.log("🧾 Service changes detected:", changeSummary);
      const res = await fetch(`${API_URL}/${updatedService._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...updatedService,
          changeSummary, // 👈 send along for notifications
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s._id === updatedService._id ? data.service : s))
        );

      }
      console.log("Windows socket object:", window.socket);
      if (window.socket) {
        const payload = {
          type: "SERVICE_UPDATED",
          barberId, // from localStorage
          serviceId: updatedService._id,
          name: updatedService.name,
          category: updatedService.category,
          changes, // detailed breakdown
          summary: changeSummary,
          timestamp: new Date().toISOString(),
        };

        console.log("📡 Emitting socket event:", payload);
        window.socket.emit("serviceUpdated", payload);
      }

    } catch (error) {
      console.error("Error updating service:", error);
    }
  }
  // Toggle status
  const handleToggleStatus = async (id) => {
    try {

      const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        setServices((prev) => prev.map((s) => (s._id === id ? data.service : s)));
        window.socket?.emit("serviceToggled", {
          barberId,
          serviceId: id,
          newStatus: data.service.isActive,
        });
      }
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  // Delete service
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this this service?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s._id !== id));
        window.socket?.emit("serviceDeleted", { barberId, serviceId: id });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };


  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service._id} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm ring-1 ring-gray-100 ${!service.isActive ? "opacity-60 bg-gray-50" : "bg-white"}`}>

            {/* Card Header with Category Banner */}
            <div className={`h-2 w-full rounded-t-xl ${categoryColors[service.category] ? categoryColors[service.category].replace('text-', 'bg-').split(' ')[0] : 'bg-gray-200'}`}></div>

            <CardContent className="p-5 pt-4">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  {service.category && (
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${categoryColors[service.category] || "bg-gray-100 text-gray-600"}`}>
                      {service.category}
                    </span>
                  )}
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{service.name}</h3>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setSelectedService(service)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(service._id)}>
                      {service.isActive ? (
                        <>
                          <ShieldMinus className="mr-2 h-4 w-4" /> Deactivate
                        </>
                      ) : (
                        <>
                          <ShieldPlus className="mr-2 h-4 w-4" /> Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(service._id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 font-medium mb-4">
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {service.price}
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration} min
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-2">
                {service.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-2">
                <Badge variant="outline" className={`font-normal ${service.isActive ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-gray-50"}`}>
                  {service.isActive ? "Active Service" : "Inactive"}
                </Badge>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground group-hover:text-primary" onClick={() => setSelectedService(service)}>
                  View Details &rarr;
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900">No services found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
            Try adjusting your search terms or add a new service to get started.
          </p>
        </div>
      )}

      {selectedService && (
        <ServiceEditModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSave={handleSaveService}
        />
      )}
    </div>
  )
}
