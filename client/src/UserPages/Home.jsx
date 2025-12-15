import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useParams, useNavigate } from "react-router-dom";
import Divider from '@mui/material/Divider';
import { Scissors } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { mockSalons } from '../data/MockData';
import { useLanguage } from '../components-barber/language-provider';
import barbershop from '/barbershop.jpg';

import { useAuthModal } from '../contexts/AuthModelContext';



import { DashboardHeader } from '../components-barber/header';
import DashboardFooter from "../components-barber/footer"

import { useUser } from '../contexts/BarberContext';
export const Home = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const currentUser = user;
  const { setIsAuthOpen } = useAuthModal();
  console.log("Home - Current User from BarberContext:", currentUser);
  const { setCurrentUser, salons, setSalons } = useApp();
  const navigate = useNavigate();
  const { userId } = useParams();
  console.log("Home - Current User:", currentUser);

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
      <section className="relative py-20 px-4 overflow-hidden">
        <img src={barbershop} alt={t("home.heroAlt")} className="w-full h-full object-cover absolute inset-0" />
        <div className="container mx-auto text-center relative z-10">
          {currentUser?.email && (
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {t("home.welcomeUser", { name: currentUser.name })}
            </h1>
          )}
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            {t("home.heroTitleLine1")} <br />
            <span className="text-white">{t("home.heroTitleLine2")}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto drop-shadow-md">
            {t("home.heroSubtitle")}
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto text-black backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">




              <Button
                onClick={handleButtonClick}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                {t("home.findSalons")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="py-16 bg-background-secondary">
        <Divider sx={{ bgcolor: 'white' }} />
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">{t("home.stats.partnerSalons")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50k+</div>
              <div className="text-muted-foreground">{t("home.stats.happyCustomers")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9</div>
              <div className="text-muted-foreground">{t("home.stats.averageRating")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">{t("home.stats.easyBooking")}</div>
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
      <DashboardFooter />
      {/* … Other sections can be similarly translated using t("key") … */}
    </div>
  );
};
