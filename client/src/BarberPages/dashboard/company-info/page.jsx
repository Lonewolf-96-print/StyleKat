"use client"

import { useEffect, useState } from "react"

import { useLanguage } from "../../../components-barber/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components-barber/ui/badge"
import { Button } from "../../../components-barber/ui/button"
import { MapPin, Phone, Mail, Clock, Users, Award, Scissors, Star, Menu, X } from "lucide-react"
import DashboardFooter from "../../../components-barber/footer"
import { DashboardHeader } from "../../../components-barber/header"
import { DashboardSidebar } from "../../../components-barber/sidebar"
import { ServicesList } from "../../../components-barber/services-list"
import { StaffList } from "../../../components-barber/staff-list"
import cover from "/cover.jpg"
import { API_URL } from "../../../lib/config"

// --- HELPER: Compress Image ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Max dimensions (e.g. 1920x1080 is usually enough for web)
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress
        // 0.7 quality usually gives great results at much lower size
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function CompanyInfoPage() {
  const { t } = useLanguage()
  const barberId = localStorage.getItem("shopId")
  // console.log("BarberId in the company info page", barberId);// /company/[barberId]
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [barberData, setBarberData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewService, setViewService] = useState(false)
  const [viewStaff, setViewStaff] = useState(false)
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!barberId) return
    const fetchBarberData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/barbers/${barberId}`)
        const data = await res.json()
        setBarberData(data)
        // console.log("Fetched barber data:", data)
      } catch (err) {
        console.error("Failed to load barber data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBarberData()
  }, [barberId])

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      // Compress client-side
      const compressed = await compressImage(file);

      // Clone existing images or create new array
      const currentImages = barberData.images ? [...barberData.images] : [];

      // Ensure specific index assignment
      currentImages[index] = compressed;

      // Remove any undefined holes if array expanded weirdly (though index logic prevents this usually)
      // but simpler: just update specific index.

      // Update Local State
      const updatedBarber = { ...barberData, images: currentImages };
      setBarberData(updatedBarber);

      // Save to Server
      const res = await fetch(`${API_URL}/api/barbers/${barberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: currentImages }),
      });

      if (!res.ok) throw new Error("Failed to save image");
      // console.log("Image saved successfully");

    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. It might be too large even after compression.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    if (!confirm("Remove this image?")) return;

    const currentImages = barberData.images ? [...barberData.images] : [];
    currentImages.splice(index, 1);

    const updatedBarber = { ...barberData, images: currentImages };
    setBarberData(updatedBarber);

    try {
      await fetch(`${API_URL}/api/barbers/${barberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: currentImages }),
      });
    } catch (err) {
      console.error("Remove error", err);
    }
  }


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading barber details...
      </div>
    )
  }

  if (!barberData) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Barber data not found.
      </div>
    )
  }

  const { name, tagline, about, address, phone, email, hours, stats, services, team } = barberData

  // --- HERO IMAGE LOGIC ---
  // Priority: 1. barberData.images[0]  2. static cover
  const heroImage = (barberData.images && barberData.images.length > 0)
    ? barberData.images[0]
    : cover;

  // --- IMAGES ARRAY FOR UI ---
  // Ensure we always have 3 slots logic for the UI grid
  const shopImages = barberData.images || [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      {/* Sidebar Components (Fixed) */}
      <DashboardSidebar />

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader />

        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
          {/* 1. HERO SECTION */}
          <div className="relative w-full h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
            <img
              src={heroImage}
              alt="Salon Banner"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 lg:p-12 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <Badge className="mb-4 bg-primary/90 hover:bg-primary text-white border-none px-3 py-1 text-sm backdrop-blur-sm">
                    Premium Salon
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-2">
                    {barberData.salonName}
                  </h1>
                  <p className="text-lg text-gray-200 font-medium max-w-2xl">
                    {tagline || "Experience the best grooming services in town."}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex gap-6 text-white min-w-fit">

                  {/* <div className="w-px bg-white/20"></div> */}
                  <div className="text-center">
                    <p className="text-2xl font-bold">4.9</p>
                    <p className="text-xs uppercase opacity-70">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.5 SHOP PHOTOS UPLOAD SECTION */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-white border-b border-gray-100 p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Shop Photos <span className="text-sm font-normal text-gray-500 ml-2">(Max 3)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((index) => {
                  const imgDetails = shopImages[index];
                  return (
                    <div key={index} className="relative group aspect-video bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
                      {imgDetails ? (
                        <>
                          <img src={imgDetails} alt={`Shop ${index}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-blue-600">
                          <div className="bg-white p-3 rounded-full shadow-sm">
                            <MapPin className="w-6 h-6" /> {/* Placeholder icon */}
                          </div>
                          <span className="text-xs font-semibold">{uploading ? "Processing..." : "Upload Photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, index)}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                * Upload high-quality landscape photos. They will be automatically compressed for optimal performance.
                First photo will be used as the cover image.
              </p>
            </CardContent>
          </Card>

          {/* 2. MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COL: QUICK INFO (Sticky) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              {/* About */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-900 text-white p-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> About Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-gray-600 leading-relaxed">
                  {barberData.description || "We are a top-tier salon dedicated to providing exceptional grooming services. Our team of professionals ensures you leave looking and feeling your best."}
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gray-50/50 p-6">
                  <CardTitle className="text-lg font-bold">Contact & Location</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-500">{address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-gray-500">{barberData.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-500">{email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Card */}
              <Card className="border-0 shadow-lg bg-gray-900 text-gray-300">
                <CardHeader className="p-6 border-b border-gray-800">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span>Mon - Sat</span>
                    <span className="text-white font-medium">{hours?.monday_saturday}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-800 pt-3">
                    <span>Sunday</span>
                    <span className="text-white font-medium">{hours?.sunday}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COL: CONTENT */}
            <div className="lg:col-span-8 space-y-8">

              {/* Services Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Scissors className="w-6 h-6 text-primary" /> Our Services
                  </h3>
                  {/* Optional: Add 'Add Service' button here if it were editable */}
                </div>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <ServicesList showAddButton={true} />
                  </CardContent>
                </Card>
              </div>

              {/* Team Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" /> Meet the Team
                  </h3>
                </div>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <StaffList showAddButton={true} />
                  </CardContent>
                </Card>
              </div>

            </div>

          </div>

        </div>
        <DashboardFooter />
      </div>
    </div>
  )
}
