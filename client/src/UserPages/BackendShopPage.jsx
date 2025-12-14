import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { DashboardHeader } from "../components-barber/header";
import { DashboardLayout } from "../components/dashboard-layout";
import BackendBookingForm from "../components/BackendBookingForm";
import StaffQueueView from "../components/StaffQueueView.jsx";
import { useUser } from "../contexts/BarberContext.jsx";
import { useCustomer } from "../contexts/CustomerContext.jsx";
import { useApp } from "../contexts/AppContext.jsx";
import { io } from "socket.io-client";

import { Button } from "../components/ui/button.jsx";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/Navbar.jsx";

const userIcon =L.divIcon({
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
  const { user } = useUser();
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const { customer } = useCustomer();
  const { navigate } = useApp();
  const { barberId } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error(err);
        alert("Failed to get location");
      }
    );
  };

  // SOCKET
  const token = localStorage.getItem("customerToken");
  const socket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
  });

  // Fetch Shop
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/barbers/${barberId}`);
        if (!res.ok) throw new Error("Failed to fetch shop");
        const data = await res.json();
        console.log("Data fetched ",data)
        setShop(data);
        console.log("MAP IS RENDERING:", data?.coordinates);
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [barberId]);

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

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!shop) return <div className="text-center py-10">Shop not found</div>;

  const ShopContent = (
    <div className="min-h-screen w-full bg-[url('/barbershop1.jpeg')] bg-cover bg-center bg-no-repeat p-6 flex justify-center">
      <div className="max-w-3xl w-full">
      

        <Card className="bg-white/30 backdrop-blur-5xl shadow-2xl">
          <CardContent className="p-6">
            <div className="w-full max-w-4xl mx-auto mb-6 p-6 rounded-2xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
                {shop.salonName}
              </h1>

              <div className="mt-3 space-y-2 text-white/90 text-lg font-medium">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-white">Owner Name:</span> {shop.ownerName}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-white">Phone Number:</span> {shop.phoneNumber}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-white">Email:</span> {shop.email}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-white">Address:</span> {capitalizeText(shop.address)}
                </p>
              </div>

              <div className="mt-4">
                <button
                 onClick={() => {setShowMap(!showMap);
                  if (!showMap) handleViewLocation();
                 }}
                  className="bg-black text-white font-semibold px-4 py-2 rounded-lg shadow"
                >
                  {showMap ? "Hide Location" : "View Location"}
                </button>

                {/* Guarded Map */}
               {showMap && userLocation && shop.coordinates && (
  <div className="transition-all duration-500 ease-in-out overflow-hidden max-h-[500px] opacity-100 mt-4">
    <div className="w-full h-[400px] rounded-xl overflow-hidden">
      <MapContainer
        center={[
          (userLocation.lat + shop.coordinates.lat) / 2,
          (userLocation.lng + shop.coordinates.lng) / 2,
        ]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* USER PIN (BLUE) */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <span className="font-semibold">You</span>
          </Popup>
        </Marker>

        {/* LABEL BELOW PIN */}
        <div className="absolute text-blue-700 text-sm font-semibold"
          style={{
            transform: "translate(-50%, -20px)",
          }}>
          You
        </div>

        {/* SHOP PIN (RED) */}
        <Marker
          position={[shop.coordinates.lat, shop.coordinates.lng]}
          icon={shopIcon}
        >
          <Popup>
            <span className="font-semibold">Salon</span>
          </Popup>
        </Marker>

        {/* LABEL BELOW PIN */}
        <div className="absolute text-red-700 text-sm font-semibold"
          style={{
            transform: "translate(-50%, -20px)",
          }}>
          Salon
        </div>

        {/* ROUTE LINE */}
        <Polyline
          positions={[
            [userLocation.lat, userLocation.lng],
            [shop.coordinates.lat, shop.coordinates.lng],
          ]}
          pathOptions={{ color: "green", weight: 4 }}
        />
      </MapContainer>
    </div>
  </div>
)}

              </div>
            </div>

            <BackendBookingForm barberId={shop._id} shop={shop} />
            <StaffQueueView barberId={barberId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {/* show Navbar for NON-logged users */}
      {!customer && <Navbar />}

      {/* show DashboardLayout for logged-in barber/customer */}
      {customer ? <DashboardLayout>{ShopContent}</DashboardLayout> : ShopContent}
    </>
  )
};

export default BackendShopPage;
