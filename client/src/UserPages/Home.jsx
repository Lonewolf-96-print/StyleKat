import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useParams, useNavigate } from "react-router-dom";
import Divider from '@mui/material/Divider';
import { Scissors } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { mockSalons } from '../data/MockData';
import { useLanguage } from '../components-barber/language-provider';
import salonCover from '/salon-cover.jpg';
import barberShop from '/barbershop.jpg';

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
      <section className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden isolate">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img
          src="/barbershop.jpg"
          alt={t("home.heroAlt")}
          className="w-full h-full object-cover absolute inset-0 z-0 scale-105 hover:scale-110 transition-transform duration-[2000ms]"
        />

        <div className="container mx-auto text-center relative z-20 space-y-12">
          <div className="space-y-6 animate-fade-in-up">
            {currentUser?.email && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                {t("home.welcomeUser", { name: currentUser.name })}
              </div>
            )}

            <h1 className="font-display text-5xl md:text-7xl lg:text-9xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-2xl">
              {t("home.heroTitleLine1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                {t("home.heroTitleLine2")}
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg px-4">
              {t("home.heroSubtitle")}
            </p>
          </div>

          {/* Search Bar Container */}
          <div className="animate-fade-in-up animation-delay-500">
            <div className="max-w-2xl mx-auto p-4 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl group hover:bg-white/15 transition-all duration-500">
              <Button
                onClick={handleButtonClick}
                className="w-full h-16 md:h-20 text-xl font-bold rounded-[2rem] bg-white text-slate-900 hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl flex items-center justify-center gap-4 group"
              >
                <div className="p-2 bg-indigo-600 rounded-full text-white transform group-hover:rotate-45 transition-transform duration-500 shadow-md">
                  <Scissors className="w-6 h-6" />
                </div>
                <span>{t("home.findSalons")}</span>
                <div className="w-8 h-8 rounded-full border border-indigo-100 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="py-24 bg-white relative z-20 -mt-16 rounded-t-[4rem] border-t border-gray-100 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: "500+", lab: "home.stats.partnerSalons" },
              { val: "10k+", lab: "home.stats.happyCustomers" },
              { val: "4.9", lab: "home.stats.averageRating" },
              { val: "24/7", lab: "home.stats.easyBooking" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2 group p-6 rounded-3xl hover:bg-slate-50 transition-colors duration-500">
                <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                  {stat.val}
                </div>
                <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  {t(stat.lab)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Booking Made <span className="text-indigo-600 italic">Simple.</span>
            </h2>
            <p className="text-lg text-slate-500 font-light">
              Experience the future of personal grooming. Three steps to look your absolute best.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                step: "01",
                title: "Find Your Style",
                desc: "Browse top-rated professionals near you with ease.",
                icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
                color: "indigo"
              },
              {
                step: "02",
                title: "Book Instantly",
                desc: "Pick a slot that fits your schedule. No phone calls needed.",
                icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                color: "purple"
              },
              {
                step: "03",
                title: "Relax & Look Good",
                desc: "Show up and enjoy your service. Walk out feeling legendary.",
                icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                color: "blue"
              }
            ].map((item, i) => (
              <div key={i} className="group bg-white p-12 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-indigo-100 relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-8 text-8xl font-black text-slate-50 group-hover:text-indigo-50 transition-colors pointer-events-none`}>{item.step}</div>
                <div className={`w-20 h-20 rounded-3xl bg-${item.color}-100 flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform duration-500`}>
                  <div className={`text-${item.color}-600`}>{item.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-20 blur-[100px] animate-pulse"></div>
              <div className="relative rounded-[4rem] overflow-hidden shadow-2xl aspect-[4/5]">
                <img src={salonCover} alt="Professional Barber" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 p-10 text-white backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-white/50 flex items-center justify-center">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-light text-white/70">Expert Stylists</p>
                      <p className="text-lg font-bold italic">"Quality is our priority"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-6">
                <span className="text-indigo-600 font-black tracking-widest uppercase text-sm">Our Philosophy</span>
                <h2 className="text-5xl md:text-7xl font-black leading-tight text-slate-900">
                  Elevate Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Grooming Game.</span>
                </h2>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: <Scissors className="w-6 h-6" />,
                    title: "Curated Professionals",
                    desc: "Only the top 10% of salons and independent barbers make it to our platform."
                  },
                  {
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    title: "Instant Confidence",
                    desc: "Live calendars mean you book, confirm, and walk-in without the anxiety."
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900">{feature.title}</h4>
                      <p className="text-slate-500 font-light leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleButtonClick} className="h-16 px-12 rounded-full text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xl hover:scale-105 transition-all">
                Book Your Transformation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Join as Barber CTA */}
      <section className="py-32 px-4">
        <div className="container mx-auto">
          <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-12">
              <div className="space-y-4">
                <span className="text-indigo-400 font-bold tracking-widest uppercase text-sm">For Professionals</span>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Master Your Business. <br />Manage Your Craft.</h2>
              </div>

              <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                Join the elite network of stylists who are scaling their business with intelligent booking, automated marketing, and client management.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  onClick={() => navigate('/login/barber')}
                  className="bg-white text-slate-900 hover:bg-slate-50 px-12 h-16 rounded-full text-xl font-bold shadow-2xl transform transition hover:scale-105 active:scale-95"
                >
                  Apply as a Salon OWNER
                </Button>
              </div>

              <div className="pt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10">
                {[
                  { label: "0% Commission", val: "on Bookings" },
                  { label: "24/7", val: "Admin Panel" },
                  { label: "Staff", val: "Management" },
                  { label: "Real-time", val: "Analytics" }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase (New Section) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img src={barberShop} className="rounded-3xl h-64 w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Showcase" />
            <img src={salonCover} className="rounded-3xl h-64 w-full object-cover grayscale hover:grayscale-0 transition-all duration-700 mt-8" alt="Showcase" />
            <img src="/barbershop.jpg" className="rounded-3xl h-64 w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Showcase" />
            <img src={salonCover} className="rounded-3xl h-64 w-full object-cover grayscale hover:grayscale-0 transition-all duration-700 mt-8" alt="Showcase" />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animation-delay-500 { animation-delay: 0.5s; }

        * { font-family: 'Poppins', sans-serif !important; }
        h1, h2, h3, h4 { font-family: 'Poppins', sans-serif !important; font-weight: 800; }
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
