"use client"

import { useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { API_URL } from "../lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components-barber/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components-barber/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, Phone, Mail, Calendar, Clock } from "lucide-react"
import EditStaffModal from "./edit-staff"
import { Link } from "react-router-dom"




export function StaffList({ showAddButton = false }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const barberId = localStorage.getItem("token"); // or from context if you store it
  // console.log("🔑 Barber ID:", barberId)
  // console.log("🗄️ Staff Data:", staff);
  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem("token");
      try {

        if (!token) throw new Error("No token found");
        setLoading(true);
        const res = await fetch(`${API_URL}/api/staff`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // <-- critical
          },
        });
        // console.log("📡 Raw response:", res);

        const data = await res.json();
        setStaff(data);
      } catch (err) {
        // console.error("❌ Error fetching staff:", err);
      } finally {
        setLoading(false);
      }
    };

    if (barberId) fetchStaff();
  }, [barberId]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/staff/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete");

      setStaff((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      // console.error("❌ Failed to delete staff:", err);
      // Optional: Add toast notification here
    }
  };
  function capitalizeWord(word) {
    if (!word) return ""; // handle empty string
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }
  const handleSave = (updatedStaff) => {
    if (!updatedStaff) return;

    setStaff(prev =>
      prev.map(s =>
        s?._id === updatedStaff._id ? updatedStaff : s
      )
    );
  };


  const toggleStatus = async (id) => {
    const token = localStorage.getItem("token");

    // Optimistic Update
    const originalStaff = staff;
    const updated = staff.map((member) =>
      member._id === id ? { ...member, isActive: !member.isActive } : member
    );
    setStaff(updated);

    try {
      const target = updated.find((m) => m._id === id);
      const res = await fetch(`${API_URL}/api/staff/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: target.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update status");

    } catch (err) {
      // console.error("❌ Failed to update status:", err);
      setStaff(originalStaff); // Revert on error
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-48 bg-gray-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {staff.length > 0 ? (
        <>
          {showAddButton && (
            <div className="col-span-full flex justify-end mb-4">
              <Link to="/dashboard/staff/new">
                <Button>Add New Staff</Button>
              </Link>
            </div>
          )}
          {staff.map((member) => (
            <Card key={member._id} className={`group border-0 shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden ${!member.isActive ? "opacity-75 bg-gray-50/50" : "bg-white"}`}>

              {/* Status Strip */}
              <div className={`h-1.5 w-full ${member.isActive ? "bg-green-500" : "bg-gray-300"}`} />

              <CardContent className="p-0">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-2 ring-gray-50">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name?.charAt(0) || 'S'}</AvatarFallback>

                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{capitalizeWord(member.role)}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 border-0 font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {member.isActive ? "Active Now" : "Inactive"}
                          </Badge>
                          {member.rating > 0 && (
                            <span className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-md font-medium">
                              ★ {member.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 -mr-2">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setSelectedStaff(member)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(member._id)}>
                          {member.isActive ? (
                            <>
                              <span className="w-4 h-4 mr-2 block rounded-full border border-gray-400" /> Mark Inactive
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 mr-2 block rounded-full bg-green-500" /> Mark Active
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(member._id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm group/link">
                      <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 group-hover/link:bg-blue-50 transition-colors">
                        <Phone className="h-4 w-4 text-gray-500 group-hover/link:text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{member.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-center text-sm group/link">
                      <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 group-hover/link:bg-purple-50 transition-colors">
                        <Mail className="h-4 w-4 text-gray-500 group-hover/link:text-purple-600" />
                      </div>
                      <span className="text-gray-700 truncate">{member.email || "No email provided"}</span>
                    </div>
                  </div>

                  {/* Schedule & Services */}
                  <div className="bg-gray-50/50 rounded-lg p-4 space-y-4 border border-gray-100">

                    {/* Services */}
                    {member.services?.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-1.5">
                          {member.services.map((service) => (
                            <Badge key={service} variant="secondary" className="bg-white hover:bg-white border-gray-200 text-gray-600 font-normal shadow-sm">
                              {capitalizeWord(service)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No services assigned</p>
                    )}

                    <div className="h-px bg-gray-200/50 w-full my-2" />

                    {/* Working Hours */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        <span>{member.workingHours}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground overflow-hidden max-w-[50%] justify-end">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        <span className="truncate" title={member.workingDays?.join(", ")}>
                          {member.workingDays && member.workingDays.length > 0
                            ? member.workingDays.map(d => d.slice(0, 3)).join(", ")
                            : "No schedule"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Joined {new Date(member.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-gray-500 hover:text-primary" onClick={() => setSelectedStaff(member)}>
                      View Full Profile &rarr;
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 border border-dashed rounded-xl">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Avatar className="h-10 w-10 opacity-50">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No staff members found</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-1 mb-6">
            Get started by adding your first team member.
          </p>
          <Link to="/dashboard/staff/new">
            <Button>Add Staff Member</Button>
          </Link>
        </div>
      )}

      {selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}