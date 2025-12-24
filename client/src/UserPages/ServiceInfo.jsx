import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../components-barber/language-provider';
import { useApp } from "../contexts/AppContext";
import { useCustomer } from "../contexts/CustomerContext";
import toast from "react-hot-toast";
import bgImg from '/barbershop4.jpg';
import { DashboardLayout } from "../components/dashboard-layout";

import { API_URL } from "../lib/config";
import { Loader2, MapPin, Search, Star, Phone, ChevronRight, Calendar } from "lucide-react";

export const ServiceInfo = () => {
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);

  const { city, setCity } = useApp();
  const { customer } = useCustomer();
  const { t } = useLanguage();

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!city?.trim()) {
      toast.error("Please enter a city name!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/shops/${city}`);
      const data = await res.json();

      setResults(data);
      setSearched(true);



    } catch (err) {
      console.error("Error fetching shops:", err);
      toast.error("Failed to fetch salons. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  // MAIN CONTENT
  const ServiceContent = (
    <>
      {/* HERO SECTION */}
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/barbershop1.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight drop-shadow-2xl">
              Find Your Style
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto drop-shadow-md">
              Discover top-rated salons and barbers near you for your next transformation.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto w-full">
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl md:rounded-full p-2 shadow-2xl transition-all focus-within:bg-white/20 focus-within:border-white/40 focus-within:ring-4 focus-within:ring-white/10">

              {/* Input Container */}
              <div className="flex items-center w-full md:flex-1 pl-2">
                <div className="pl-2 text-white/70">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your city (e.g. Greater Noida)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none focus:ring-0 px-3 py-3 text-base md:text-lg"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-xl md:rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
            <p className="text-xs text-white/50 mt-4 font-light tracking-wide uppercase">
              Popular: Greater Noida, Noida, New Delhi
            </p>
          </div>
        </div>
      </section>

      {/* SALON RESULTS */}
      <section className="container mx-auto px-4 py-16 min-h-[50vh]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-lg text-muted-foreground font-medium animate-pulse">Scouting the best spots...</p>
          </div>
        )}

        {/* How It Works (Empty State) */}
        {!isLoading && !searched && (
          <div className="py-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">How StyleKat Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Booking your next appointment is easier than ever. Follow these simple steps to look your the best.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 text-center">
              {/* Step 1 */}
              <div className="relative group p-6 rounded-2xl bg-card border hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-background">
                  1
                </div>
                <div className="mt-8 mb-4 flex justify-center text-primary/80 group-hover:text-primary transition-colors">
                  <Search className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Search</h3>
                <p className="text-muted-foreground">
                  Enter your city to find top-rated barbers and salons near you.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative group p-6 rounded-2xl bg-card border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 delay-100">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-background">
                  2
                </div>
                <div className="mt-8 mb-4 flex justify-center text-primary/80 group-hover:text-primary transition-colors">
                  <Star className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose</h3>
                <p className="text-muted-foreground">
                  Compare ratings, services, and prices to pick the perfect spot.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative group p-6 rounded-2xl bg-card border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 delay-200">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-background">
                  3
                </div>
                <div className="mt-8 mb-4 flex justify-center text-primary/80 group-hover:text-primary transition-colors">
                  <Calendar className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Book</h3>
                <p className="text-muted-foreground">
                  Select a time that works for you and book instantly. No calls needed.
                </p>
              </div>
            </div>

            {/* Show 'Salon Owner' CTA only to non-logged users */}
            {!customer && (
              <div className="mt-20 p-8 rounded-3xl bg-muted/30 border border-border/50 text-center relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-bold">Are you a Salon Owner?</h3>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Join StyleKat to manage your appointments, staff, and customers all in one place. Grow your business today.
                  </p>
                  <button
                    onClick={() => navigate('/auth/signup')}
                    className="bg-foreground text-background px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-colors shadow-lg"
                  >
                    Register Your Business
                  </button>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              </div>
            )}
          </div>
        )}

        {!isLoading && searched && results.length === 0 && (
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">No salons found in "{city}"</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any partners in this area yet. Try searching for a major city nearby!
              </p>
            </div>
            <button
              onClick={() => { setCity(""); document.querySelector('input')?.focus(); }}
              className="text-primary hover:underline font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Top Rated in {city}</h2>
              <p className="text-muted-foreground">Select a salon to view services and book available slots.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {results.map((item, idx) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/shop/${item._id}`)}
                  className="group bg-card hover:bg-accent/5 rounded-2xl shadow-sm border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={bgImg}
                      alt={item.salonName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-black px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      4.9
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="bg-emerald-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-sm">
                        OPEN NOW
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col gap-3 flex-grow bg-card">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {item.salonName}
                      </h2>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
                        <span className="line-clamp-2">
                          {item.address
                            ?.split(",")
                            .map((p) => p.trim().replace(/\b\w/g, (c) => c.toUpperCase()))
                            .join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                        <span>{item.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                      {/* <div className="text-xs text-muted-foreground font-medium">
                        Next slot: <span className="text-foreground">Today, 2:00 PM</span>
                      </div> */}
                      <span className="text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                        Book
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );

  // FINAL RETURN — HEADER ALWAYS SHOWN
  return (
    <>
      {/* show Navbar for NON-logged users */}
      {!customer && <Navbar />}

      {/* show DashboardLayout for logged-in barber/customer */}
      {customer ? <DashboardLayout>{ServiceContent}</DashboardLayout> : ServiceContent}
    </>
  );
};
