import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { useApp } from './contexts/AppContext.jsx'
import AdminDashboard from "./UserPages/AdminDashboard.jsx"
import BarberDashboard from "./UserPages/BarberDashboard.jsx"
import BookingsPage from "./UserPages/Booking.jsx"
import { Home } from "./UserPages/Home.jsx"
// import Login from "./BarberPages/Auth/Login.js"
import ShopDetails from "./UserPages/ShopDetails.jsx"
import Shops from "./UserPages/Shops.jsx"

import RootLayout from "./UserPages/RouteLayout.jsx"
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import { ServiceInfo } from './UserPages/ServiceInfo.jsx'
import BackendShopPage from './UserPages/BackendShopPage.jsx'
// import ResponsiveDateTimeRangePickers  from './components/calender.jsx'
import Footer from "./components/Footer.jsx"
import Login from "./BarberPages/Auth/Login.jsx"
import AppointmentsPage from "./BarberPages/dashboard/appointments/page.jsx"
import NewAppointmentPage from "./BarberPages/dashboard/appointments/new/page.jsx"
//Barber routes import
import { LoginForm } from './components-barber/login-form.jsx'
import { SignupForm } from './components-barber/signup-form.jsx'
import DashboardContent from "./components-barber/dashboard-content.jsx"
import ServicesPage from "./BarberPages/dashboard/services/new/page.jsx"
import EditServicePage from "./BarberPages/dashboard/services/[id]/page.jsx"
import SettingsPage from "./BarberPages/dashboard/settings/page.jsx"
import StaffPage from "./BarberPages/dashboard/staff/page.jsx"
import NewStaffPage from "./BarberPages/dashboard/staff/new/page.jsx"
import CompanyInfoPage from "./BarberPages/dashboard/company-info/page.jsx"
import DashboardLayout from "./BarberPages/dashboard/layout.jsx"
import PaymentsPage from "./BarberPages/dashboard/payments/page.jsx"
import EditStaffPage from "./BarberPages/dashboard/staff/[id]/page.jsx"
import ShopInfo from './UserPages/ShopInfo.jsx'
import NotificationsPage from './UserPages/Dashboard/NotificationsPage.jsx'
import ProfilePage from './UserPages/Dashboard/ProfilePage.jsx'
import UserSettingsPage from './UserPages/Dashboard/SettingsPage.jsx'
import BookingsDashboardPage from './UserPages/Dashboard/BookingsPage.jsx'
import DashboardPage from './UserPages/Dashboard/DashboardPage.jsx'
import MyShopPage from './BarberPages/MyShopPage.jsx'
// import AuthPages from './UserPages/Dashboard/Auth/AuthPages.jsx'
import { CustomerLoginForm } from './components/CustomerLoginForm.jsx'
import { CustomerSignupForm } from './components/CustomerSignupForm.jsx'
import NotFound from './UserPages/Dashboard/NotFound.jsx'
import AuthPage from './components/UserAuthModel.jsx'
function App() {
  const [count, setCount] = useState(0)
  // Debug localStorage changes
  window.addEventListener("storage", (e) => {
    console.log("🔍 STORAGE CHANGE:", {
      key: e.key,
      oldValue: e.oldValue,
      newValue: e.newValue
    });
  });

  const { currentUser } = useApp();
  return (
    <>
      <Toaster />
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:shopId" element={<ShopDetails />} />
        {/* <Route path = "/shopId/:id/booking" element ={<BookingsPage/>}/> */}
        <Route path="/shop/:barberId" element={<BackendShopPage />} />
        <Route path="/barber" element={<BarberDashboard />} />
        <Route path="/my-bookings" element={<BookingsDashboardPage />} />
        <Route path="/user/dashboard" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/company-info" element={<CompanyInfoPage />} />
        <Route path="/settings" element={<UserSettingsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search-salon" element={<ServiceInfo />} />
        <Route path="/services/shopId/:id" element={<ShopInfo />} />
        <Route path="/login/user" element={<CustomerLoginForm />} />
        <Route path="/signup/user" element={<CustomerSignupForm />} />
        {/* //User part  */}

        {/* 
          Barber part */}
        <Route path="/login/barber" element={<LoginForm />} />
        <Route path="/auth/signup" element={<SignupForm />} />
        <Route path="/my-shop" element={<MyShopPage />} />
        <Route path="/dashboard" element={<DashboardContent />} />
        <Route path="/dashboard/appointments" element={<AppointmentsPage />} />

        {/* <Route path="/dashboard/services" element={currentUser ? <ServicesPage /> : <LoginForm />} /> */}
        <Route path="/dashboard/services/new" element={currentUser ? <EditServicePage /> : <LoginForm />} />
        <Route path="/dashboard/settings" element={currentUser ? <SettingsPage /> : <LoginForm />} />
        {/* <Route path="/dashboard/staff" element={currentUser ? <StaffPage /> : <LoginForm />} /> */}
        <Route path="/dashboard/staff/:id/edit" element={currentUser ? <EditStaffPage /> : <LoginForm />} />
        <Route path="/dashboard/staff/new" element={currentUser ? <NewStaffPage /> : <LoginForm />} />
        <Route path="/dashboard/company-info/:id" element={currentUser ? <CompanyInfoPage /> : <LoginForm />} />
        <Route path="/dashboard/test" element={<DashboardLayout />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
