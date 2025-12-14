import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components-barber/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Clock, Calendar } from "lucide-react";

const StaffList = ({ shop }) => {
  const [staff, setStaff] = useState([]);
  const barberId = localStorage.getItem("shopId") || shop?._id;

  useEffect(() => {
    if (!barberId) return;

    const fetchStaff = async () => {
      try {
        const res = await fetch(`https://localhost:5000/api/staff/public/${barberId}`);
        const data = await res.json();
        if (res.ok) {
          setStaff(data);
          console.log("✅ Fetched public staff data:", data);
        } else {
          console.warn("❌ Failed to fetch staff:", data.message);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };

    fetchStaff();
  }, [barberId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {staff.length > 0 ? (
        staff.map((member) => (
          <Card key={member._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={"/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-muted-foreground">{member.role}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {member.ratings ? (
                      <>
                        <p className="ml-4 flex items-center">Ratings</p>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ★ {member.ratings}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {member.services?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Services</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.services.map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.workingHours}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.workingDays?.join(", ")}</span>
                </div>
              </div>


            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No staff members found for this shop.</p>
        </div>
      )}
    </div>
  );
};

export default StaffList;
