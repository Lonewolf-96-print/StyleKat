// import React, { useState, useEffect } from "react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
// import { Badge } from "../components/ui/badge";
// import { MapPin, Star, Users, Scissors, Calendar, Car } from "lucide-react";
// import { useApp } from "../contexts/AppContext";
// import cover from "/salon-cover.jpg";
// import {useBarberStore} from "../lib/store"
// import * as turf from '@turf/turf';
// import { useParams } from "react-router-dom";

// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Polyline,
//   Popup
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import axios from "axios";
// const features = {
//   "geometry": {
//     "type": "LineString",
//     "coordinates": [
//       [ -77.03653, 38.897676 ],
//       [ -77.009051, 38.889939 ]
//     ]
//   }
// }
// // Fix leaflet icons
// delete (L.Icon.Default.prototype )._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
// });

// export const TrendingSalons = () => {
//   const {id} = useParams();
  
//   const [ selectedShop,setSelectedShop] = useState(null)
//   const {shopState} = useBarberStore()
//    const [visibleCount, setVisibleCount] = useState(8);
//   const { salons,city,setCity,navigate} = useApp();
//   const [selectedSalon, setSelectedSalon] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [route, setRoute] = useState([]);
//   const [isMapOpen, setIsMapOpen] = useState(false);
// const mockServices = [  { id: 'service-1', salonId: 'salon-1', name: 'Premium Haircut & Style', price: 85, duration: 60, description: 'Professional haircut with consultation, wash, cut, and styling', category: 'Hair' }, { id: 'service-2', salonId: 'salon-1', name: 'Hair Color & Highlights', price: 150, duration: 120, description: 'Full color service with premium products and styling', category: 'Hair' }, { id: 'service-3', salonId: 'salon-1', name: 'Beard Trim & Shave', price: 45, duration: 30, description: 'Classic beard trimming with hot towel treatment', category: 'Grooming' },] // Urban Barbershop services { id: 'service-4', salonId: 'salon-2', name: 'Classic Mens Cut', price: 35, duration: 45, description: 'Traditional barbershop cut with precision and style', category: 'Hair' }, { id: 'service-5', salonId: 'salon-2', name: 'Hot Towel Shave', price: 40, duration: 30, description: 'Relaxing hot towel shave experience', category: 'Grooming' }, // Bella Beauty services { id: 'service-6', salonId: 'salon-3', name: 'Signature Facial', price: 95, duration: 75, description: 'Customized facial treatment for all skin types', category: 'Skincare' }, { id: 'service-7', salonId: 'salon-3', name: 'Eyebrow Shaping', price: 35, duration: 30, description: 'Professional eyebrow shaping and styling', category: 'Beauty' } ];
//   // Mock salons with coordinates (replace with real lat/lng later)
//  const mockStaff = [ { id: 'staff-1', salonId: 'salon-1', name: 'Emma Rodriguez', specialties: ['Hair Cutting', 'Hair Coloring', 'Styling'], rating: 4.9, avatar: '/placeholder.svg' }, { id: 'staff-2', salonId: 'salon-1', name: 'Michael Chen', specialties: ['Beard Trimming', 'Classic Cuts', 'Hot Towel Shave'], rating: 4.8, avatar: '/placeholder.svg' }, { id: 'staff-3', salonId: 'salon-2', name: 'Isabella Martinez', specialties: ['Facials', 'Eyebrow Shaping', 'Makeup'], rating: 4.9, avatar: '/placeholder.svg' } ];
//   const mockSalons = [ { id: 1, ownerId: 1, name: "FOCUS SALON", location: "Plot No.75, Kp-III,near Saraswati Niwas",coords:[28.475544,77.475361], services: mockServices.filter(s => s.salonId === 'salon-1'), address: "Plot No.75, Kp-III, near Saraswati Niwas", services: ["Hair salon"], ratings: 4.5, description: null, createdAt: null, duration:"57 min", price:"70", }, 
//  { id: 2, ownerId: 2, name: "Shades A Unisex Salon", location: "Guru Taq bhadur market", address: "Guru Taq bhadur market",coords :[28.481657,77.500212], services: mockServices.filter(s => s.salonId === 'salon-1'), staff: mockStaff.filter(s => s.salonId === 'salon-1'), services: ["Beauty Parlour"], ratings:   4.7, description: "The salon's atmosphere was relaxing, and I left with a fabulous haircut.", createdAt: null, duration:"2.5hr+", price:"35", }, 
//  { id: 3, ownerId: 3, name: "New Looks Salon ", location: "Shop No - 132, Gurbaksh Plaza", services: mockServices.filter(s => s.salonId === 'salon-1'), staff: mockStaff.filter(s => s.salonId === 'salon-1'), address: "Shop No - 132, Gurbaksh Plaza", services: ["Beauty Parlour"], ratings: 4.5, description: "A best place to have haircuts at very affordable rates.", createdAt: null, duraction : "18 min", price:"50", }, 
//  { id: 4, ownerId: 4, name: "KB Beauty Salon", location: "Shop no. 231,1st floor, Gurbaksh Plaza", coords:[28.480603,77.500464],services: mockServices.filter(s => s.salonId === 'salon-2'), staff: mockStaff.filter(s => s.salonId === 'salon-2'), address: "Shop no. 231, 1st floor, Gurbaksh Plaza, Market", services: ["Beauty Parlour"], ratings: 4.7, description: null, createdAt: null, duration:"25 min", price:"45", },
//   { id: 5, ownerId: 5, name: "CLONE A UNISEX SALON", location: "Shop no 17/18 First Floor, GTB Market", coords:[28.481642,77.555118],services: mockServices.filter(s => s.salonId === 'salon-2'), staff: mockStaff.filter(s => s.salonId === 'salon-2'), address: "Shop no 17/18 First Floor, GTB Market", services: ["Beauty Parlour"], ratings: 4.8, description: "Fantastic haircut and smoothening I'm very happy service by rehan", createdAt: null, duration:"35 min", price:"44", }, 
//   { id: 6, ownerId: 6, name: "Geetanjali Studio", location: "Ground Floor, India Expo Mart",coords:[28.458043,77.498936], services: mockServices.filter(s => s.salonId === 'salon-2'), staff: mockStaff.filter(s => s.salonId === 'salon-2'), address: "Ground Floor, India Expo Mart Cir", services: ["Hairdresser"], ratings: 4.9, description: "Excellent experience.. Faiz gave me amazing hair cut and wonderful look.", createdAt: null, duration:"1hr", price:"65", },
//    { id: 7, ownerId: 7, name: "Adaa makeup salon and academy", location: "232, 1st floor, Gurbaksh Plaza",coors:[28.480976,77.500339], services: mockServices.filter(s => s.salonId === 'salon-3'), staff: mockStaff.filter(s => s.salonId === 'salon-3'), address: "232, 1st floor, Gurbaksh Plaza", services: ["Beauty Parlour"], ratings: 4.9, description: "They work with high quality products so had a very relaxing hair wash.", createdAt: null }, 
//    { id: 8, ownerId: 8, name: "Elements beauty parlour", location: "Shop No.106, GM Mall",coors:[28.479437,77.500311], services: mockServices.filter(s => s.salonId === 'salon-3'), staff: mockStaff.filter(s => s.salonId === 'salon-3'), address: "Shop No.106, GM Mall", services: ["Beauty Parlour"], ratings: 4.9, description: null, createdAt: null }, 
//    { id: 9, ownerId: 9, name: "Looks Salon, Greater Noida - Unisex Salon", location: "Shop no 14 - 15, Omaxe Connaught place mall", coord:[28.489364,77.514120],services: mockServices.filter(s => s.salonId === 'salon-3'), staff: mockStaff.filter(s => s.salonId === 'salon-3'), address: "Shop no 14 - 15, Omaxe Connaught place mall", services: ["Beauty Parlour"], ratings: 4.5 , description: "He really listened to what I wanted and nailed the cut.", createdAt: null }, 
//    { id: 10,
//     ownerId: 10,
//     name: "Alee & Barbers Unisex Salon",
//     location: "Ground Floor, Omaxe India Trade Centre, B-25, (Near Freshlee, Block I, Sector Alpha II, Greater Noida, Uttar Pradesh 201308",
//     address: "Ground Floor, Omaxe India Trade Centre, B-25, (Near Freshlee, Block I, Sector Alpha II, Greater Noida, Uttar Pradesh 201308",
//     coords: null,
//     services: ["Beauty Parlour"],
//     ratings: 5.0,
//     contact: "080095 00939",
//     openingTime: "Not Specified",
//     closingTime: "9:30 PM",
//     topReviews: [
//       "Service was worth it with a reasonable price. Staff behaviour was very good.",
//       "The prices are unbeatable for the quality you receive.",
//       "Highly recommend this salon for excellent grooming at a great price!",
//     ],
//     numberOfExtraReviews: 574,
//     websiteAvailable: true,
//     websiteInfo: ["aleeandbarbers.com", "instagram.com"],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",
//   },
//   { id: 11, ownerId: 11,
//     name: "Max Unisex Salon",
//     location: "CGJ3+WXP, Chi V, Greater Noida, Uttar Pradesh 201312",
//     address: "CGJ3+WXP, Chi V, Greater Noida, Uttar Pradesh 201312",
//     coords: null,
//     services: ["Barber Shop"],
//     ratings: 4.9,
//     contact: "078348 48694",
//     openingTime: "Not Specified",
//     closingTime: "10:00 PM",
//     topReviews: [
//       "The prices are reasonable, and the quality of service is excellent.",
//       "She gave a very soothing facial and massage which was very relaxing.",
//       "Well place for grooming and the staff are really appreciable.",
//     ],
//     numberOfExtraReviews: 232,
//     websiteAvailable: false,
//     websiteInfo: [],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",
//   },
//   { id: 12, ownerId: 12,name: "Menn & Co Salon Sector 142",
//     location: "Plot no- A-107, Shahdara, Sector 142, Noida, Uttar Pradesh 201304",
//     address: "Plot no- A-107, Shahdara, Sector 142, Noida, Uttar Pradesh 201304",
//     coords: null,
//     services: ["Hairdresser"],
//     ratings: 4.9,
//     contact: "Not Provided",
//     openingTime: "Not Specified",
//     closingTime: "9:00 PM",
//     topReviews: [
//       "Great services polite staff. Must try hydra facial.",
//       "Shakib good hair cut and quality haircut.",
//       "Service, ambience and everything is 5 star.",
//     ],
//     numberOfExtraReviews: 60,
//     websiteAvailable: false,
//     websiteInfo: [],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",
//   },
//  {
//     id: 13,
//     ownerId: 13,
//     name: "Gentleman The Barbershop",
//     location: "HA 117, Main Market, Hazipur, Sector 104, Noida, Uttar Pradesh 201301",
//     address: "HA 117, Main Market, Hazipur, Sector 104, Noida, Uttar Pradesh 201301",
//     coords: null,
//     services: ["Barber Shop"],
//     ratings: 4.9,
//     contact: "073038 80491",
//     openingTime: "Not Specified",
//     closingTime: "9:00 PM",
//     topReviews: [
//       "Have my haircut, shave, facial, hair spa, pedicure, manicure.",
//       "Excellent quality of service and customer centric service.",
//       "They charge 150 rupees for men's haircut and 100 rupees for beard or trimming.",
//     ],
//     numberOfExtraReviews: 304,
//     websiteAvailable: true,
//     websiteInfo: ["gentlemanthebarbershop.in"],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",
//   },
//   { id: 14,
//     ownerId: 14,
//     name: "Relax Hair Salon",
//     location: "Block A, Ansal Golf Links 1, Greater Noida, Uttar Pradesh 201315",
//     address: "Block A, Ansal Golf Links 1, Greater Noida, Uttar Pradesh 201315",
//     coords: null,
//     services: ["Barber Shop"],
//     ratings: 5.0,
//     contact: "098730 97860",
//     openingTime: "Not Specified",
//     closingTime: "8:30 PM",
//     topReviews: [
//       "Great service and very experienced in their work.",
//       "Nice facilities by staff must visit.",
//       "Good behaviour and good haircut.",
//     ],
//     numberOfExtraReviews: 49,
//     websiteAvailable: false,
//     websiteInfo: [],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",},
//     {id: 15,
//     ownerId: 15,
//     name: "Cute Salon",
//     location: "Shop N. 20, Amrit puran Market, Jagat Farm, Block E, Chandila, Gamma 1, Greater Noida, Uttar Pradesh 201308",
//     address: "Shop N. 20, Amrit puran Market, Jagat Farm, Block E, Chandila, Gamma 1, Greater Noida, Uttar Pradesh 201308",
//     coords: null,
//     services: ["Barber Shop"],
//     ratings: 4.5,
//     contact: "098711 29250",
//     openingTime: "Not Specified",
//     closingTime: "9:30 PM",
//     topReviews: [
//       "Bad 👎 hair cutting.. Maximum charge... Not worth it..",
//       "Services Beard trim, Children, Eyebrow trimming, Hair colouring, Haircut…",
//       "Positive Quality…",
//     ],
//     numberOfExtraReviews: 10,
//     websiteAvailable: false,
//     websiteInfo: [],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",},
//     {id: 16,
//     ownerId: 16,
//     name: "Max Madonna Unisex Salon",
//     location: "Shop 201-202, 1st Floor, Jagatfarm GMMall, Amritpuram, Block E, Chandila, Gamma 1, Greater Noida, Uttar Pradesh 201308",
//     address: "Shop 201-202, 1st Floor, Jagatfarm GMMall, Amritpuram, Block E, Chandila, Gamma 1, Greater Noida, Uttar Pradesh 201308",
//     coords: null,
//     services: ["Beauty Parlour"],
//     ratings: 4.4,
//     contact: "0120 427 1188",
//     openingTime: "10:00 AM",
//     closingTime: "8:00 PM",
//     topReviews: [
//       "Very Good Service, Ambiance and Staff very friendly.",
//       "The class of their haircuts is truly remarkable and prices too are reasonable.",
//       "Nominal price for all the services.",
//     ],
//     numberOfExtraReviews: 61,
//     websiteAvailable: false,
//     websiteInfo: [],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",
//   },
//   { id: 17,
//     ownerId: 17,
//     name: "Kings & Queens Unisex Salon",
//     location: "White House Apartment, near SILVER CITY, near Kaushalya World School, Purvanchal Silver City - 2, Pi I & II, Greater Noida, Uttar Pradesh 201310",
//     address: "White House Apartment, near SILVER CITY, near Kaushalya World School, Purvanchal Silver City - 2, Pi I & II, Greater Noida, Uttar Pradesh 201310",
//     coords: null,
//     services: ["Hairdresser"],
//     ratings: 5.0,
//     contact: "093543 40690",
//     openingTime: "10:00 AM",
//     closingTime: "8:00 PM",
//     topReviews: [
//       "Very good service in cheap prices. Friendly staff.",
//       "This salon offers great haircuts, trendy styles, and expert coloring.",
//       "Lovely place to relax and feel pampered. Thank you excellent staff and services.",
//     ],
//     numberOfExtraReviews: 75,
//     websiteAvailable: true,
//     websiteInfo: ["instagram.com"],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—"},
//     {id: 18,
//     ownerId: 18,
//     name: "The Master Cut Unisex Saloon",
//     location: "Shop no. 3 Ground Floor, SKA Metro Ville Society Rd, Eta II, Greater Noida, Rasoolpur Rai, Uttar Pradesh 201310",
//     address: "Shop no. 3 Ground Floor, SKA Metro Ville Society Rd, Eta II, Greater Noida, Rasoolpur Rai, Uttar Pradesh 201310",
//     coords: null,
//     services: ["Barber Shop"],
//     ratings: 5.0,
//     contact: "Not Provided",
//     openingTime: "Not Specified",
//     closingTime: "11:00 PM",
//     topReviews: [
//       "Nazim has consistently provided exceptional service to numerous satisfied clients. With a highly professional and skilled team...",
//       "No reviews available.",
//       "No reviews available.",
//     ],
//     numberOfExtraReviews: 0,
//     websiteAvailable: false,
//     websiteInfo: [],
//     description: null,
//     createdAt: null,
//     duration: "—",
//     price: "—",},
     
//   ];

//   // Get user location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
//         () => console.log("Could not fetch location")
//       );
//     }
//   }, []);
  
//   // Fetch route using OpenRouteService API
//   const getRoute = async (shopCoords) => {
//     if (!userLocation) return;
//     try {
//       const res = await axios.get(
//         `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${shopCoords[1]},${shopCoords[0]}?overview=full&geometries=geojson`
//       );
//       const coords = res.data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
//       setRoute(coords);
//     } catch (err) {
//       console.error("Routing error:", err);
//     }
//   };
// const salonIcon = L.divIcon({
//   html: `<div style="background:red; border-radius:6px; padding:2px 4px; 
//                   color:white; font-weight:bold;">💈</div>`,
//   className: "",
//   iconSize: [30, 30],
// });
// const userIcon = L.divIcon({
//   html: `<div style="background:green; color:white; border-radius:50%; 
//                   width:20px; height:20px; display:flex; 
//                   align-items:center; justify-content:center; 
//                   font-size:12px;">U</div>`,
//   className: "",
//   iconSize: [20, 20],
// });
// const lengthKm = turf.length(features.geometry, { units: 'kilometers' });


//   // ✨ Lazy loading: load more cards when scrolling near bottom
//   useEffect(() => {
//     const handleScroll = () => {
//       const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
//       if (bottom && visibleCount < mockSalons.length) {
//         setVisibleCount(prev => prev + 4); // load 4 more at a time
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [visibleCount, mockSalons.length]);
//   return (
//     <section className="py-2 mt-3">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl font-bold mb-8">
//           Trending Salons
//         </h2>

//         {/* Salon Cards */}
//         <div className="gap-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
//           {mockSalons.slice(0, visibleCount).map((salon) => {
//             const currentTime = new Date();
//   const currentHours = currentTime.getHours();
//   const currentMinutes = currentTime.getMinutes();
//   const currentTotalMinutes = currentHours * 60 + currentMinutes;
//   let isOpen = true;
//   if (salon.openingTime && salon.closingTime) {
//     // Convert times like "10:00 AM" or "9:30 PM" to total minutes
//     const parseTime = (timeStr) => {
//       const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
//       if (!match) return null;
//       let [_, hours, minutes, period] = match;
//       hours = parseInt(hours, 10);
//       minutes = parseInt(minutes, 10);
//       if (period && period.toUpperCase() === "PM" && hours < 12) hours += 12;
//       if (period && period.toUpperCase() === "AM" && hours === 12) hours = 0;
//       return hours * 60 + minutes;
//     };

//     const openTime = parseTime(salon.openingTime);
//     const closeTime = parseTime(salon.closingTime);

//     if (openTime != null && closeTime != null) {
//       isOpen = currentTotalMinutes >= openTime && currentTotalMinutes <= closeTime;
//     }
//   }
//   return (
//             <Card key={salon.id || `${salon.location}-${index}`} className="w-72">
//               <img src={cover} alt={salon.name} className="h-40 w-full object-cover" />

//               <CardHeader>
//                 <CardTitle>{salon.name}</CardTitle>
//                 <CardDescription>{salon.location}</CardDescription>

//                 {/* <CardDescription>
//                   <div
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       shopState.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {shopState.isOpen ? "OPEN" : "CLOSED"}
//                   </div>
//                 </CardDescription> */}
//                  <CardDescription>
//           <div
//             className={`px-2 py-1 rounded-full text-xs font-medium ${
//               isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//             }`}
//           >
//             {isOpen ? "OPEN" : "CLOSED"}
//           </div>
//         </CardDescription>

//                 <CardDescription className="flex items-center">
//                   Shop category: <span className="font-semibold ml-1">{salon.services.join(", ")}</span>
//                 </CardDescription>

//                 <CardDescription className="flex items-center">
//                   Approx Price: <span className="font-semibold ml-1">₹{salon.price}</span>
//                 </CardDescription>

//                 <CardDescription className="flex items-center">
//                   Duration: <span className="font-semibold ml-1">{salon.duration}</span>
//                 </CardDescription>
//               </CardHeader>

//               <CardContent>
//                 <Badge>
//                   <Star className="h-4 w-4 mr-1 text-yellow-500" /> {salon.ratings}
//                 </Badge>
//                 <div className="mt-2 grid grid-cols-2 gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setSelectedSalon(salon);
//                       setIsMapOpen(true);
//                       getRoute(salon.coords);
//                     }}
//                   >
//                     <MapPin className="h-4 w-4 mr-1" /> View Location
//                   </Button>
//                   <button
//                     onClick={() => {
//                       setSelectedShop(salon);
//                       navigate(`/shopId/${salon.id}/booking`);
//                     }}
//                     className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
//                   >
//                     View Details
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
//   )
// })}
//         </div>

//         {/* Load More Button (for users not scrolling) */}
//         {visibleCount < mockSalons.length && (
//           <div className="flex justify-center mt-8">
//             <Button onClick={() => setVisibleCount(prev => prev + 4)}>Load More</Button>
//           </div>
//         )}

//         {/* Map Popup */}
//         {selectedSalon && isMapOpen && selectedSalon.coords && (
//           <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
//             onClick={() => setIsMapOpen(false)}
//           >
//             <div
//               className="w-11/12 md:w-3/4 lg:w-1/2 h-96 relative bg-white rounded-xl overflow-hidden shadow-lg"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <MapContainer center={selectedSalon.coords} zoom={15} style={{ height: "100%", width: "100%" }}>
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 <Marker position={selectedSalon.coords} icon={salonIcon}>
//                   <Popup>{selectedSalon.name}</Popup>
//                 </Marker>
//                 {userLocation && (
//                   <Marker position={userLocation} icon={userIcon}>
//                     <Popup>You</Popup>
//                   </Marker>
//                 )}
//                 {route.length > 0 && <Polyline positions={route} color="green" />}
//               </MapContainer>
//               <Button
//                 className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded shadow-lg"
//                 onClick={() => setIsMapOpen(false)}
//               >
//                 Close
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };