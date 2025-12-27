// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/BarberPages/globals.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from "./contexts/AppContext.jsx";
import { LanguageProvider } from "./components-barber/language-provider";
import { ScrollToTop } from "./components-barber/footer.jsx"
import { BookingProvider } from "./contexts/BookingsContext";
import { GoogleOAuthProvider } from "@react-oauth/google"
import { NotificationProvider } from './contexts/UserNotificationsContext.jsx'
import { UserProvider } from './contexts/BarberContext.jsx'
import { CustomerProvider, useCustomer } from './contexts/CustomerContext.jsx';
import { AuthModalProvider } from './contexts/AuthModelContext.jsx';
import { BarberNotificationProvider } from './contexts/BarberNotificationContext.jsx';
const client = import.meta.env.VITE_CLIENT_ID
console.log("Google Client ID:", client)
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CustomerProvider>
      <BookingProvider>

        <ScrollToTop />
        <GoogleOAuthProvider clientId={client}>
          <UserProvider>
            <BarberNotificationProvider>
              <LanguageProvider>

                <NotificationProvider>
                  <AppProvider>
                    <AuthModalProvider>
                      <App />
                    </AuthModalProvider>
                  </AppProvider>

                </NotificationProvider>
              </LanguageProvider>
            </BarberNotificationProvider>
          </UserProvider>
        </GoogleOAuthProvider>

      </BookingProvider>
    </CustomerProvider>
  </BrowserRouter>

)
