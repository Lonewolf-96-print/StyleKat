"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components-barber/ui/textarea";
import { useLanguage } from "../../../components-barber/language-provider";
import { MapPin, Save } from "lucide-react";
import DashboardFooter from "../../../components-barber/footer";
import { DashboardSidebar } from "../../../components-barber/sidebar";
import { DashboardHeader } from "../../../components-barber/header";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useApp } from "../../../contexts/AppContext";
import { API_URL } from "../../../lib/config";
// main.jsx OR app.jsx
import "leaflet/dist/leaflet.css";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function SettingsPage() {
  const { t } = useLanguage();
  const user = localStorage.getItem("user");
  console.log("SettingsPage - User from localStorage:", user);
  const { currentUser } = useApp();
  console.log("SettingsPage - Current User:", currentUser);
  const [formData, setFormData] = useState({
    salonName: "",
    ownerName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    website: "",
    coords: {
      lat: 28.480808,
      lng: 77.500617
    }  // ⬅ NEW FIELD
  });

  const mapRef = useRef(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [shopCoords, setShopCoords] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const shopId = localStorage.getItem("shopId");


  // ✅ Fetch current shop info on mount
  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!token) return;



      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetching shop details for shopId:", shopId);

        if (!res.ok) throw new Error("Failed to fetch shop details");
        const data = await res.json();
        console.log("Fetched shop details:", data);
        setShopCoords(data.coords);
        setFormData({
          salonName: data.salonName || "",
          ownerName: data.ownerName || "",
          address: data.address || "",
          city: data.city || "",
          phone: data.phoneNumber || "",
          email: data.email || "",
          website: data.website || "",
          coords: data.coords && data.coords.lat && data.coords.lng
            ? data.coords
            : formData.coords     // ✅ fallback to previous saved coords
        });


      } catch (err) {
        console.error("Error fetching shop info:", err);
        setMessage("⚠️ Failed to load shop info. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId, token]);
  function capitalizeText(str = "") {
    return str
      .split(/([,])/g) // split but keep commas
      .map((chunk) =>
        chunk === ","
          ? chunk
          : chunk
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
      )
      .join(" ");
  }
  const handleBlur = (e) => {
    const id = e.target.id;
    if (["address", "city", "state"].includes(id)) {
      setFormData(prev => ({ ...prev, [id]: capitalizeText(prev[id] || "") }));
    }
  };


  // 🧠 Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // 💾 Handle Save
  const handleSave = async () => {
    if (!shopId || !token) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          ...formData,
          coords: {
            lat: Number(formData.coords?.lat),
            lng: Number(formData.coords?.lng),
          }

        })

      });

      if (!res.ok) throw new Error("Failed to update shop");
      const data = await res.json();
      console.log("Shop updated successfully:", data);
      setFormData({
        salonName: data.salonName,
        ownerName: data.ownerName,
        address: data.address,
        phone: data.phoneNumber,
        email: data.email,
        coords: currentUser?.coords || formData.coords || data.coords


      });

      toast.success(" Settings saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      setMessage("❌ Failed to save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [formData.coords]);


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading shop settings...</p>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6">
      {/* Sidebar (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6">

        <DashboardHeader />

        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        {/* Hero / Identity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Identity & Contact */}
          <div className="xl:col-span-2 space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Salon Identity</CardTitle>
                <CardDescription>How your business appears to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salonName">{t("settings.salonName")}</Label>
                    <Input
                      id="salonName"
                      value={formData.salonName}
                      onChange={handleChange}
                      className="text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">{t("settings.ownerName")}</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("settings.phoneNumber")}</Label>
                    <Input id="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("settings.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Location */}
          <div className="space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Address & Map Position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="address">{t("settings.address")}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleChange} onBlur={handleBlur} />
                  </div>

                </div>


                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Map Location</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShopCoords(formData.coords || [20.5937, 78.9629]);
                        setIsMapOpen(true);
                      }}
                    >
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      Update on Map
                    </Button>
                  </div>

                  {/* Mini Map Preview */}
                  <div className="h-48 min-h-[12rem] w-full rounded-lg overflow-hidden border border-gray-200 relative">

                    {formData.coords && formData.coords.lat ? (
                      <MapContainer
                        ref={mapRef}
                        center={[formData.coords.lat, formData.coords.lng]}
                        zoom={14}
                        scrollWheelZoom={false}
                        dragging={false}
                        zoomControl={false}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[formData.coords.lat, formData.coords.lng]} />
                      </MapContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                        No location set
                      </div>
                    )}
                  </div>
                  {formData.coords?.lat && (
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      {formData.coords.lat.toFixed(6)}, {formData.coords.lng.toFixed(6)}
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : t("settings.saveSettings")}
          </Button>
        </div>



        <DashboardFooter />
      </div >
    </div >
  );
}
