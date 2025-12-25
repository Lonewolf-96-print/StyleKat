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
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
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
            <Card key={member._id}>
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <Badge>{member.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedStaff(member)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(member._id)}>
                        Toggle Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <div className="col-span-full text-center py-20">
          <p>No staff members found</p>
          <Link to="/dashboard/staff/new">
            <Button className="mt-4">Add Staff</Button>
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