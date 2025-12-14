import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {connectSocket, getSocket, disconnectSocket } from "../lib/socket";
import { useApp } from "../contexts/AppContext";
import ServiceBanner from "../components/ServiceBanner";
import { useLanguage } from "../components-barber/language-provider";
import { io } from "socket.io-client"
import { Scissors } from "lucide-react";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar";
import DashboardFooter from "../components-barber/footer";
import { DashboardHeader } from "../components-barber/header";
// import { mockSalons } from "./ServiceInfo";
// ✅ Fixed mock services
const mockServices = [
  { id: "service-1", salonId: "salon-1", name: "Premium Haircut & Style", price: 85, duration: 60 },
  { id: "service-2", salonId: "salon-1", name: "Hair Color & Highlights", price: 150, duration: 120 },
  { id: "service-3", salonId: "salon-1", name: "Beard Trim & Shave", price: 45, duration: 30 },
  { id: "service-4", salonId: "salon-2", name: "Classic Mens Cut", price: 35, duration: 45 },
  { id: "service-5", salonId: "salon-2", name: "Hot Towel Shave", price: 40, duration: 30 },
  { id: "service-6", salonId: "salon-3", name: "Signature Facial", price: 95, duration: 75 },
  { id: "service-7", salonId: "salon-3", name: "Eyebrow Shaping", price: 35, duration: 30 },
];

// ✅ Fixed mock staff
const mockStaff = [
  { id: "staff-1", salonId: "salon-1", name: "Emma Rodriguez" },
  { id: "staff-2", salonId: "salon-1", name: "Michael Chen" },
  { id: "staff-3", salonId: "salon-2", name: "Isabella Martinez" },
];
const product = {
        name: "Nike Pegasus 41 shoes",
        category: "Sports",
        price: 189,
        offerPrice: 159,
        rating: 4,
        images: [
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage.png",
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage2.png",
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage3.png",
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage4.png"
        ],
        description: [
            "High-quality material",
            "Comfortable for everyday use",
            "Available in different sizes"
        ]
    };

    


const BookingsPage = () => {
//  const {t} =useLanguage();
//   const {id} = useParams()
//     console.log("Id of the shop",id)
//   const [status, setStatus] = useState("")
//   const [thumbnail, setThumbnail] = React.useState(product.images[0]);

//   const {salons,setSalons,shop, setShop, currentUser,
//     setCurrentUser,} = useApp()
//    const [error, setError] = useState("");
//   const [customerName, setCustomerName] = useState("");
//   const [customerPhone, setCustomerPhone] = useState("");
//   const [selectedService, setSelectedService] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
// const validatePhone = (value) => {
 
//   const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers only
//     if (!phoneRegex.test(value)) {
//       setError("Please enter a valid 10-digit phone number starting with 6-9");
//       return false;
//     } else {
//       setError("");
//       return true;
//     }
//   };

//   // ✅ Get shop by id from mock data
//   useEffect(() => {
//     if (id) {
//       const foundShop = mockSalons.find((s) => s.id === Number(id));
//       setShop(foundShop || null);
//     }
//   },[])
//    useEffect(() => {
//   const fetchShop = async () => {
//     if (!id) return;

//     let foundShop = null;

//     // If it's a number → check in mockSalons
   
//       foundShop = mockSalons.find((s) => s.id === Number(id));
//     if(foundShop){
//       setShop(foundShop);
//       return;
//     }

//     // If it's not numeric → fetch from backend (MongoDB shop)
//     if (!foundShop) {
//       try {
//         const response = await fetch(`http://localhost:5000/api/bookings/${id}`,{
//           headers: { "Content-Type": "application/json" ,
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//         }});
//         if (!response.ok) throw new Error("Failed to fetch shop");
//         const data = await response.json();
//         console.log("Fetched backend shop:", data);

//         // Standardize data structure for frontend compatibility
//         foundShop = {
//           id: data._id,
//           name: data.name,
//           location: data.location,
//           address: data.address,
//           services: data.services || [],
//           rating: data.rating || null,
//           price: data.price || 0,
//           isOpen: data.isOpen || false,
//           queueLength: data.queueLength || 0,
//           estimatedWaitTime: data.estimatedWaitTime || 0,
//           description: data.description || "",
//         };
//       } catch (error) {
//         console.error("Error fetching backend shop:", error);
//       }
//     }

//     setShop(foundShop);
//   };

//   fetchShop();
// }, [id]);

//    useEffect(() => {
//   const socket = connectSocket();

//   socket.on("shops", (data) => {
//     console.log("Received shops:", data);
//     // convert shopsState object into an array for rendering
//     const formatted = Object.entries(data).map(([id, shop]) => ({
//       id,
//       ...shop,
//     }));
//     setSalons(formatted);
//   });
//   return () => {
//     socket.off("shops");
//   };
// }, [setSalons]);

    
//     const socketInstance = connectSocket();

//     socketInstance.on("connect", () => {
//       console.log("User connected to server");
//       setIsConnected(true);
//       setSocket(socketInstance);
//     });

//     socketInstance.on("disconnect", () => {
//       console.log("User disconnected from server");
//       setIsConnected(false);
//     });

//     socketInstance.on("bookingStatusUpdate", (data) => {
//       console.log("Booking status update:", data);
//       alert(`Booking ${data.status}: ${data.message}`);
//     });


//   // ✅ Booking submit handler
//   const handleSubmitBooking = async (e) => {
//   e.preventDefault();
//   if (!shop || !customerName || !selectedService || !selectedDate || !selectedTime || !socket || !isConnected) return;

//   if (!validatePhone(customerPhone)) {
//     alert("Enter valid phone number");
//     return;
//   }

//   setIsSubmitting(true);

//   const bookingData = {
//     id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//     shopId: shop.id,
//     shopName: shop.name,
//     customerName,
//     customerPhone,
//     service: selectedService,
//     date: selectedDate,
//     time: selectedTime,
//     status: "pending",
//     createdAt: new Date().toISOString(),
//    open :shop.isOpen,
//   };

//   console.log("Sending booking request:", bookingData);
//    try{
//     const token = localStorage.getItem("token");
//      const response = await fetch("http://localhost:5000/api/bookings", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" ,
//         Authorization: `Bearer ${token}`, 
//       },

//       body: JSON.stringify(bookingData),
//     });
//     const result = await response.json();
//     console.log("Booking response:", result);
//     if (response.ok){
//  socket.emit("submitBookingRequest", bookingData, (response) => {
//   if (response.success) {
//     console.log(response.message);
//     setStatus("Booking request sent successfully ✅");
//   } else {
//     console.error("Booking failed:", response.message);
//     setStatus("Booking failed ❌");
//   }
// });
     
//       setCustomerName("");
//       setCustomerPhone("");
//       setSelectedService("");
//       setSelectedDate("");
//       setSelectedTime("");
//     }else {
//       setStatus("Failed to send booking ❌");
     
//     }
//   }catch(error){
//     console.error(error);
//     setStatus("Error sending booking");
//   }finally{
// setIsSubmitting(false);
//   }
// } 
  

//   // ✅ If shop not found
//   if (!shop) {
//     return (
//     <>
//      <Navbar/>
//       <div className="min-h-screen flex mt-10 p-4">
       
//       <DashboardHeader/>
         
//         {/* <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Shop not found</h1>
//           <Link to="/services" className="text-blue-600 hover:text-blue-700 font-medium">
//             ← Back to Shops
//           </Link>
//         </div> */}
//       </div>
//       </>
//     );
//   }

//   // ✅ Date picker restriction
//   const today = new Date().toISOString().split("T")[0];

//   // ✅ Time slots
//   const timeSlots = [
//     "9:00 AM",
//     "9:30 AM",
//     "10:00 AM",
//     "10:30 AM",
//     "11:00 AM",
//     "11:30 AM",
//     "12:00 PM",
//     "12:30 PM",
//     "1:00 PM",
//     "1:30 PM",
//     "2:00 PM",
//     "2:30 PM",
//     "3:00 PM",
//     "3:30 PM",
//     "4:00 PM",
//     "4:30 PM",
//     "5:00 PM",
//     "5:30 PM",
//   ];


//   return (
//      <>
//      <Navbar/>
//   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:mt-13 md:mt-13">
//      <DashboardHeader/>
//   <div className="max-w-6xl mx-auto space-y-8">
//     {/* Header */}
//     <div className="text-center mb-6">
//       <Link
//         to="/services"
//         className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
//       >
//         ← Back to Shops
//       </Link>
//       <h1 className="text-2xl font-bold mb-2">Book Appointment</h1>
//       <p className="text-gray-600">{shop.name}</p>
//       <div className="flex items-center justify-center gap-2 mt-2">
//         <div
//           className={`w-2 h-2 rounded-full ${
//             isConnected ? "bg-green-500" : "bg-red-500"
//           }`}
//         />
//         <span className="text-xs">
//           {isConnected ? "Connected" : "Connecting..."}
//         </span>
//       </div>
//     </div>

//     {/* Service Banner + Shop Info */}
//     <div className="flex flex-col lg:flex-row gap-6">
//       {/* Service Banner */}
//       <div className="w-full lg:w-2/3 xl:w-4/4">
//         <ServiceBanner />
//       </div>

//       {/* Shop Info */}
          
//       <div className="w-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-8">
//   {/* Shop Header */}
//   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//     <h3 className="text-2xl font-semibold text-gray-800">{shop.name}</h3>
//     <div className="flex items-center gap-2 text-sm text-gray-600">
//       <span className="flex items-center">
//         ⭐ <span className="ml-1 font-medium">{shop.rating}</span>
//       </span>
//       <span className="text-green-600 font-semibold text-base">₹{shop.price}</span>
//     </div>
//   </div>

//   {/* Address */}
//   <p className="text-gray-500 text-sm leading-relaxed mb-4">
    
//     {shop.address}
//     </p>

//   {/* Shop Status Info */}
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 mb-6">
//     <div className="flex items-center gap-2">
//       <span className="font-medium text-gray-800">Status:</span>
//       <span className={shop.isOpen ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
//         {shop.isOpen ? "Open ✅" : "Closed ❌"}
//       </span>
//     </div>

//     <div className="flex items-center gap-2">
//       <span className="font-medium text-gray-800">Queue Length:</span>
//       <span>{shop.queueLength}</span>
//     </div>

//     <div className="flex items-center gap-2">
//       <span className="font-medium text-gray-800">Wait Time:</span>
//       <span>{shop.estimatedWaitTime} mins</span>
//     </div>
//   </div>

//   {/* Product Description */}
//   <div>
//     <h4 className="text-lg font-semibold text-gray-800 mb-2">About Product</h4>
//     <ul className="list-disc list-inside text-gray-600 space-y-1">
//       {product.description.map((desc, index) => (
//         <li key={index}>{desc}</li>
//       ))}
//     </ul>
//   </div>
  

// </div>

//     </div>
//     </div>

//     {/* Shops Grid */}
    

//     {/* Booking Form */}
//     <div className="flex justify-center mt-4">
//     <form
//       onSubmit={handleSubmitBooking}
//       className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
//     >
//       {/* Name */}
//       <div>
//         <label className="block text-sm font-medium mb-2">Your Name</label>
//         <input
//           type="text"
//           value={customerName}
//           onChange={(e) => setCustomerName(e.target.value)}
//           className="w-full px-3 py-2 border rounded-lg"
//           placeholder="Enter your name"
//           required
//         />
//       </div>

//       {/* Phone */}
//       <div>
//         <label className="block text-sm font-medium mb-2">Phone Number</label>
//         <input
//           type="tel"
//           value={customerPhone}
//           onChange={(e) => setCustomerPhone(e.target.value)}
//           className="w-full px-3 py-2 border rounded-lg"
//           placeholder="Enter your phone number"
//           required
//         />
//       </div>

//       {/* Service Dropdown */}
//       <div>
//         <label className="block text-sm font-medium mb-2">Service</label>
//         <select
//           value={selectedService}
//           onChange={(e) => setSelectedService(e.target.value)}
//           className="w-full px-3 py-2 border rounded-lg"
//           required
//         >
//           <option value="">Select a service</option>
//          {shop.services && shop.services.length > 0 ? (
//   shop.services.map((service, i) => (
//     <option key={service._id || i} value={service.name}>
//       {service.name} — ₹{service.price} ({service.duration} mins)
//     </option>
//   ))
// ) : (
//   <option disabled>No services available</option>
// )}
//         </select>
//       </div>

//       {/* Date */}
//       <div>
//         <label className="block text-sm font-medium mb-2">Date</label>
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           min={today}
//           className="w-full px-3 py-2 border rounded-lg"
//           required
//         />
//       </div>

//       {/* Time */}
//       <div>
//         <label className="block text-sm font-medium mb-2">Time</label>
//         <select
//           value={selectedTime}
//           onChange={(e) => setSelectedTime(e.target.value)}
//           className="w-full px-3 py-2 border rounded-lg"
//           required
//         >
//           <option value="">Select a time</option>
//           {timeSlots.map((time, index) => (
//             <option key={index} value={time}>
//               {time}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Submit */}
//        <button
//         type="submit"
     
//         disabled={isSubmitting || !isConnected}
//         className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
//       >
//         {isSubmitting ? "Sending Request..." : "Send Booking Request"}
//       </button>
//       {status && (
//         <p className="mt-2 text-sm text-gray-700">{status}</p>
//       )}
//       {!shop.isOpen && (
//         <p className="text-center text-red-600 text-sm mt-2">
//           This shop is currently closed. Your request will be reviewed when they
//           reopen.
//         </p>
//       )}
//     </form>
//   </div>
//   <DashboardFooter/>
//   </div>
//   </>



      

//   );
// };
}

export default BookingsPage;
