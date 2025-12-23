import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useParams, useNavigate } from "react-router-dom";
import Divider from '@mui/material/Divider';
import { Scissors } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { mockSalons } from '../data/MockData';
import { useLanguage } from '../components-barber/language-provider';
import salonCover from '/salon-cover.jpg';
// import barberShop from '/barbershop.jpg';

import { useAuthModal } from '../contexts/AuthModelContext';



import { DashboardHeader } from '../components-barber/header';
import DashboardFooter from "../components-barber/footer"

import { useUser } from '../contexts/BarberContext';
import UserDashboardFooter from '../components/Footer';
export const Home = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const currentUser = user;
  const { setIsAuthOpen } = useAuthModal();
  // console.log("Home - Current User from BarberContext:", currentUser);
  const { setCurrentUser, salons, setSalons } = useApp();
  const navigate = useNavigate();
  const { userId } = useParams();
  // console.log("Home - Current User:", currentUser);

  useEffect(() => {
    setSalons(mockSalons);
  }, [setSalons]);
  useEffect(() => {
    if (currentUser?.role === "barber") {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);
  const handleButtonClick = () => {
    navigate("/search-salon");
  };


  // 🚨 ROLE GUARD


  const handleBookNow = (salonId) => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role === 'customer') {
      navigate(`/customer/salon/${salonId}`);
    } else {
      navigate('/salon/dashboard');
    }
  };
  if (currentUser?.role === "barber") {
    return <div className="min-h-screen" />; // small neutral loader
  }


  return (
    <div className="min-h-screen bg-white">
      {/* <DashboardHeader /> */}

      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">{t("common.brandName") || "StyleKat"}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* <img src={salon} onClick={() => navigate("/salons")} className="h-10 w-10" alt={t("common.salon")} /> */}
            {/* <img src={scissors} className="h-10 w-10" alt={t("common.scissors")} /> */}

            {currentUser ? (
              <Button onClick={() => navigate(currentUser.role === 'user' ? '/user/dashboard' : '/dashboard')} variant="outline">
                {t("common.dashboard")}
              </Button>
            ) : (
              <Button onClick={() => navigate("/login/user")} className="bg-green-50 text-black font-semibold hover:bg-green-200">
                {t("auth.signIn")}
              </Button>
            )}

            {currentUser?.email && (
              <Button onClick={() => setCurrentUser({ name: "", email: "", password: "" })}>
                {t("auth.logout") || "Logout"}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <img
          src="/barbershop.jpg"
          alt={t("home.heroAlt")}
          className="w-full h-full object-cover absolute inset-0 -z-10 animate-fade-in"
        />

        <div className="container mx-auto text-center relative z-10 space-y-8">
          {currentUser?.email && (
            <div className="">
              <h2 className="font-display text-2xl md:text-3xl font-medium mb-2 text-white/90 drop-shadow-md">
                {t("home.welcomeUser", { name: currentUser.name })}
              </h2>
            </div>
          )}

          <div className="">
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl tracking-tight leading-tight">
              {t("home.heroTitleLine1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-primary">{t("home.heroTitleLine2")}</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl mx-auto drop-shadow-lg font-light">
            {t("home.heroSubtitle")}
          </p>

          {/* Search Bar Container */}
          <div className="">
            <div className="max-w-xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3 shadow-2xl transition-all hover:bg-white/20">
              <Button
                onClick={handleButtonClick}
                className="
                w-full
                h-16
                text-lg font-bold
                rounded-xl
                bg-white
                text-primary
                hover:bg-gray-50
                shadow-lg
                hover:shadow-xl
                hover:scale-[1.01]
                transition-all duration-300 ease-out
                flex items-center justify-center gap-3
                group
              "
              >
                <Scissors className="w-6 h-6 transition-transform group-hover:rotate-45" />
                {t("home.findSalons")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="py-20 bg-background relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="group p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600 mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wide text-sm">{t("home.stats.partnerSalons")}</div>
            </div>
            <div className="group p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600 mb-2 group-hover:scale-110 transition-transform">10k+</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wide text-sm">{t("home.stats.happyCustomers")}</div>
            </div>
            <div className="group p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600 mb-2 group-hover:scale-110 transition-transform">4.9</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wide text-sm">{t("home.stats.averageRating")}</div>
            </div>
            <div className="group p-4 divide-x-0">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600 mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wide text-sm">{t("home.stats.easyBooking")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">How StyleKat Works</h2>
            <p className="text-lg text-gray-600">Get your perfect look in three simple steps. We make it easy to find and book the best professionals in town.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow text-center group">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">1. Find Your Style</h3>
              <p className="text-gray-600 leading-relaxed">Browse through top-rated salons and barbers in your area. Check reviews, portfolios, and services.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow text-center group">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">2. Book Instantly</h3>
              <p className="text-gray-600 leading-relaxed">Choose a time that works for you. No phone calls, no waiting. Just a few clicks and you're set.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">3. Look Amazing</h3>
              <p className="text-gray-600 leading-relaxed">Sit back and relax. Enjoy your premium service and leave the salon looking and feeling your best.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary to-purple-600 rounded-3xl opacity-20 blur-xl transform rotate-3"></div>
                <img src={salonCover} alt="Barber cutting hair" className="relative rounded-3xl shadow-2xl w-full object-cover h-[500px]" />
              </div>
            </div>
            <div className="md:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Why <span className="text-primary">StyleKat</span> is the Best Choice for You</h2>
              <p className="text-lg text-gray-600">We're more than just a booking platform. We're your partner in style, offering a seamless experience connecting you with the best talent.</p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Scissors className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Curated Professionals</h4>
                    <p className="text-gray-500">Only the best salons and barbers make the cut. Quality guaranteed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Real-Time Availability</h4>
                    <p className="text-gray-500">See open slots in real-time and book instantly. No back-and-forth.</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleButtonClick} className="px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all">
                Explore Salons
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Join as Barber CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Are you a Barber or Salon Owner?</h2>
              <p className="text-xl text-gray-300 mb-8">Join thousands of professionals growing their business with StyleKat. Manage appointments, staff, and clients all in one place.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/login/barber')}
                  className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-6 rounded-full text-lg font-bold shadow-xl transition-transform hover:scale-105"
                >
                  Join as Barber
                </Button>

              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>

      {/* <div className="w-full bg-slate-900 px-2 text-center text-white py-20 flex flex-col items-center justify-center">
                <p className="text-indigo-500 font-medium">Get updated</p>
                <h1 className="max-w-lg font-semibold text-4xl/[44px] mt-2">Subscribe to our newsletter & get the latest news</h1>
                <div className="flex items-center justify-center mt-10 border border-slate-600 focus-within:outline focus-within:outline-indigo-600 text-sm rounded-full h-14 max-w-md w-full">
                    <input type="text" className="bg-transparent outline-none rounded-full px-4 h-full flex-1" placeholder="Enter your email address"/>
                    <button className="bg-indigo-600 text-white rounded-full h-11 mr-1 px-8 flex items-center justify-center">
                        Subscribe now
                    </button>
                </div>
            </div> */}
      {/* <TrendingSalons/> */}
      <UserDashboardFooter />
      {/* … Other sections can be similarly translated using t("key") … */}
    </div>
  );
};
