"use client"

import { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

import { useLanguage } from "../../../components-barber/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components-barber/ui/badge"
import { Button } from "../../../components-barber/ui/button"
import { MapPin, Phone, Mail, Clock, Users, Award, Scissors, Edit, Camera } from "lucide-react"
import DashboardFooter from "../../../components-barber/footer"
import { DashboardHeader } from "../../../components-barber/header"
import { DashboardSidebar } from "../../../components-barber/sidebar"
import { ServicesList } from "../../../components-barber/services-list"
import { StaffList } from "../../../components-barber/staff-list"
import cover from "/cover.jpg"
import { API_URL } from "../../../lib/config"
import { ImageUploadModal } from "../../../components/ImageUploadModal"

export default function CompanyInfoPage() {
  const { t } = useLanguage()
  const barberId = localStorage.getItem("shopId")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [barberData, setBarberData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Carousel for Hero
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])

  useEffect(() => {
    if (!barberId) return
    const fetchBarberData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/barbers/${barberId}`)
        const data = await res.json()
        setBarberData(data)
      } catch (err) {
        console.error("Failed to load barber data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBarberData()
  }, [barberId])


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

  // --- IMAGES ---
  // Ensure we have at least one image (fallback to cover)
  const shopImages = (barberData.images && barberData.images.length > 0)
    ? barberData.images
    : [cover];

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

          {/* 1. HERO SECTION (Redesigned for Mobile) */}
          <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-sm md:shadow-2xl border border-gray-100 bg-white">

            {/* IMAGE AREA (Mobile: 250px, Desktop: 450px) */}
            <div className="relative h-[250px] lg:h-[450px] w-full group">
              {/* CAROUSEL */}
              <div className="absolute inset-0 z-0 bg-gray-900" ref={emblaRef}>
                <div className="flex h-full touch-pan-y">
                  {shopImages.map((src, idx) => (
                    <div className="flex-[0_0_100%] min-w-0 relative h-full" key={idx}>
                      <img
                        src={src}
                        alt={`Slide ${idx}`}
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* GRADIENT OVERLAY (Visible only on Desktop for text readability) */}
              <div className="hidden lg:block absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* EDIT BUTTON (Mobile: Floating Top Right, Desktop: Top Right) */}
              <div className="absolute top-3 right-3 lg:top-6 lg:right-6 z-30">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="secondary"
                  size="sm"
                  className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md h-8 px-3 text-xs md:h-10 md:px-4 md:text-sm"
                >
                  <Camera size={14} className="md:w-4 md:h-4 mr-1.5" />
                  Edit Photos
                </Button>
              </div>
            </div>

            {/* CONTENT AREA */}
            {/* Mobile: Below Image (White bg), Desktop: Overlay (Transparent) */}
            <div className={`
                relative z-20 w-full
                p-5 lg:absolute lg:bottom-0 lg:left-0 lg:p-12
                flex flex-col gap-4 lg:gap-6
                bg-white lg:bg-transparent
            `}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20 lg:bg-primary lg:text-white lg:border-none px-2 py-0.5 text-xs lg:text-sm font-semibold">
                    Premium Salon
                  </Badge>

                  <h1 className="text-3xl lg:text-6xl font-black text-gray-900 lg:text-white tracking-tight leading-tight">
                    {barberData.salonName}
                  </h1>

                  <p className="text-sm lg:text-xl text-gray-500 lg:text-gray-200 font-medium max-w-2xl leading-relaxed">
                    {tagline || "Experience the best grooming services in town."}
                  </p>
                </div>

                {/* RATING BADGE */}
                <div className="flex items-center gap-3 lg:block bg-gray-50 lg:bg-white/10 lg:backdrop-blur-md border border-gray-100 lg:border-white/20 p-3 lg:p-4 rounded-xl shadow-sm lg:shadow-lg min-w-fit">
                  <div className="text-center flex flex-row lg:flex-col items-center gap-2 lg:gap-0">
                    <p className="text-xl lg:text-2xl font-bold flex items-center gap-1 text-gray-900 lg:text-white">
                      4.9 <Star size={16} fill="currentColor" className="text-yellow-500 lg:text-yellow-400" />
                    </p>
                    <p className="text-[10px] lg:text-xs uppercase text-gray-400 lg:text-white/80 font-bold tracking-wider">
                      Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 2. MAIN GRID (Removed the old Shop Photos card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COL: QUICK INFO */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              {/* About */}
              <Card className="border-0 shadow-lg overflow-hidden bg-white">
                <CardHeader className="bg-gray-900 text-white p-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> About Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-gray-600 leading-relaxed text-sm lg:text-base">
                  {barberData.description || "We are a top-tier salon dedicated to providing exceptional grooming services. Our team of professionals ensures you leave looking and feeling your best."}
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gray-50/50 p-6">
                  <CardTitle className="text-lg font-bold">Contact & Location</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 mb-0.5">Address</p>
                      <p className="text-gray-500 leading-snug">{address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 mb-0.5">Phone</p>
                      <p className="text-gray-500">{barberData.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 mb-0.5">Email</p>
                      <p className="text-gray-500 break-all">{email}</p>
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
                <CardContent className="p-6 space-y-4 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span>Mon - Sat</span>
                    <span className="text-white font-medium bg-gray-800 px-2 py-1 rounded">{hours?.monday_saturday}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-800 pt-4">
                    <span>Sunday</span>
                    <span className="text-white font-medium bg-gray-800 px-2 py-1 rounded">{hours?.sunday}</span>
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
                </div>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
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
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <StaffList showAddButton={true} />
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
        <DashboardFooter />

        {/* MODAL */}
        <ImageUploadModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          barberData={barberData}
          setBarberData={setBarberData}
          barberId={barberId}
        />

      </div>
    </div>
  )
}

function Star(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

