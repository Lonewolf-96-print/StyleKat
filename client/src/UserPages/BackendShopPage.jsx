import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "../components/dashboard-layout";
import BackendBookingForm from "../components/BackendBookingForm";
import StaffQueueView from "../components/StaffQueueView.jsx";
import { useCustomer } from "../contexts/CustomerContext.jsx";
import { useApp } from "../contexts/AppContext.jsx";
import { io } from "socket.io-client";
import { SOCKET_URL, API_URL } from "../lib/config.js";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/Navbar.jsx";
import ShopImageCarousel from "../components/ShopImageCarousel";
import { Phone, Mail, MapPin, User, Star, Share2, Heart } from "lucide-react";
import { Button } from "../components/ui/button";

// --- ICONS ---
const userIcon = L.divIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <img src="https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png" style="width:28px;height:28px;" />
      <span style="color:#1d4ed8; font-weight:600; font-size:12px; margin-top:2px;">You</span>
    </div>
  `,
  className: "",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});
const shopIcon = L.divIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <img src="https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png" style="width:28px;height:28px;" />
      <span style="color:#dc2626; font-weight:600; font-size:12px; margin-top:2px;">Salon</span>
    </div>
  `,
  className: "",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

const BackendShopPage = () => {
  const { customer } = useCustomer();
  const { barberId } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Map state
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showStickyFooter, setShowStickyFooter] = useState(true);

  // Refs for scrolling
  const bookingSectionRef = useRef(null);

  // Helper: Get Min Price (User requested Min)
  // const minServicePrice = shop?.services?.length
  //   ? Math.min(...shop.services.map(s => Number(s.price) || 0))
  //   : 199;

  // Intersection Observer to hide sticky footer when booking form is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide if booking form is intersecting (visible), show if not
        // Actually, we want to show ONLY if user is ABOVE the form.
        // If entry.isIntersecting -> Hide
        // If entry.boundingClientRect.top > 0 (Below viewport) -> Show
        // If entry.boundingClientRect.top < 0 (Scrolled past) -> Hide (or Show? "only if user present somewhere above")

        // Logic: Show if Form IS NOT visible AND Form is BELOW the fold.
        // Simplest: If intersecting, Hide.
        setShowStickyFooter(!entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of form is visible
    );

    if (bookingSectionRef.current) {
      observer.observe(bookingSectionRef.current);
    }

    return () => observer.disconnect();
  }, [loading, shop]);
  // useEffect(() => {
  //   console.log("Min Service Price:", minServicePrice);
  //   console.log("Shop details", shop);
  //   console.log("Shop Services:", shop?.services);
  //   console.log("Min pricing", Math.min(...shop.services.map(s => Number(s.price))));
  // }, []);

  // Capitalize Helper
  function capitalizeText(str = "") {
    return str
      .split(/([,])/g)
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

  const handleViewLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setShowMap(true);
      },
      (err) => {
        // console.error(err);
        alert("Failed to get location");
      }
    );
  };

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // SOCKET
  const token = localStorage.getItem("customerToken");
  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
  });

  // Fetch Shop
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch(`${API_URL}/api/barbers/${barberId}`);
        if (!res.ok) throw new Error("Failed to fetch shop");
        const data = await res.json();
        setShop(data);
      } catch (err) {
        // console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [barberId]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !barberId) return;
    socket.emit("joinShopRoom", barberId);
    socket.on("shopQueueUpdate", (updatedShop) => {
      setShop((prev) => ({ ...prev, ...updatedShop }));
    });
    socket.on("queueUpdated", (updatedQueue) => {
      setShop((prev) => ({ ...prev, queue: updatedQueue }));
    });
    return () => {
      socket.off("shopQueueUpdate");
      socket.off("queueUpdated");
    };
  }, [socket, barberId]);

  if (loading) return <div className="text-center py-20 text-lg font-medium text-gray-500">Loading shop details...</div>;
  if (!shop) return <div className="text-center py-20 text-lg font-medium text-gray-500">Shop not found</div>;

  const ShopContent = (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">

      {/* --- DESKTOP VS MOBILE LAYOUT --- */}
      <div className="max-w-7xl mx-auto md:px-6 md:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN (Details) - Spans 12 on mobile, 7 on Desktop */}
          <div className="lg:col-span-7 space-y-6">

            {/* CAROUSEL */}
            <ShopImageCarousel images={shop.images || []} />

            {/* HEADER INFO */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{shop.salonName}</h1>
                  <p className="text-gray-500 text-sm md:text-base mt-1">{capitalizeText(shop.address)}</p>
                </div>
                {/* Rating/Share (Mock UI) */}
                <div className="flex gap-2">
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* Rating Badge */}
              <div className="flex items-center gap-2 mt-4">
                <div className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
                  4.5 <Star size={12} fill="white" />
                </div>
                <span className="text-gray-500 text-sm">(150+ ratings) • Great Experience</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <span className="font-medium">{shop.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-green-600" />
                  <span>{shop.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-purple-600" />
                  <span>{shop.email}</span>
                </div>
              </div>

              {/* LOCATION PREVIEW */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowMap(!showMap);
                    if (!showMap) handleViewLocation();
                  }}
                  className="flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                >
                  <MapPin size={18} />
                  {showMap ? "Hide Map" : "View on Map"}
                </button>

                {showMap && userLocation && shop.coordinates && (
                  <div className="mt-4 w-full h-[300px] rounded-xl overflow-hidden shadow-inner border border-gray-200">
                    <MapContainer
                      center={[
                        (userLocation.lat + shop.coordinates.lat) / 2,
                        (userLocation.lng + shop.coordinates.lng) / 2,
                      ]}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}><Popup>You</Popup></Marker>
                      <Marker position={[shop.coordinates.lat, shop.coordinates.lng]} icon={shopIcon}><Popup>Salon</Popup></Marker>
                      <Polyline positions={[[userLocation.lat, userLocation.lng], [shop.coordinates.lat, shop.coordinates.lng]]} pathOptions={{ color: "green" }} />
                    </MapContainer>
                  </div>
                )}
              </div>
            </div>

            {/* QUEUE INFO */}
            <StaffQueueView barberId={barberId} />

            {/* Booking Form (Visible here on Mobile, but acts as target for scroll) */}
            {/* On Desktop, this is hidden and shown in the right column sidebar */}
            <div ref={bookingSectionRef} className="lg:hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Book Appointment</h2>
              <BackendBookingForm barberId={shop._id} shop={shop} />
            </div>
          </div>

          {/* RIGHT COLUMN (Booking Form - Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <h3 className="text-lg font-bold">Book Slot</h3>
                  <p className="text-blue-100 text-sm">Reserve your seat now</p>
                </div>
                <div className="p-2">
                  <BackendBookingForm barberId={shop._id} shop={shop} isDesktopSidebar={true} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOOK BUTTON */}
      {/* Shown only when map/details are in view, hidden when booking form becomes visible */}
      {showStickyFooter && (
        <div className={`fixed left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-40 flex items-center justify-center transition-transform duration-300 ${customer ? "bottom-16" : "bottom-0"}`}>

          {/* <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Starting from</span>
            <span className="text-xl font-bold text-gray-900">₹{minServicePrice}</span>
          </div> */}
          <Button
            onClick={scrollToBooking}
            className="px-8 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-lg shadow-md"
          >
            Book Now
          </Button>
        </div>
      )}

    </div>
  );

  return (
    <>
      {!customer && <Navbar />}
      {customer ? <DashboardLayout>{ShopContent}</DashboardLayout> : ShopContent}
    </>
  );
};

export default BackendShopPage;

