import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useLanguage } from "../components-barber/language-provider"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function UserDashboardFooter() {
  const { t } = useLanguage()

  return (
    <footer className="bg-primary text-primary-foreground border-t border-border">
      <div className="px-6 py-4">
        {/* Main grid */}
        <div className="lg:grid grid-cols-4 gap-6">

          {/* Brand Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-3xl">StyleKat</h3>
            <p className="text-sm text-primary-foreground/80">
              {"Book, manage and enjoy salon experiences effortlessly."}
            </p>

          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white mt-4 font-medium">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/user/dashboard" className="block hover:text-accent transition-colors">
                Dashboard
              </Link>
              <Link to="/my-bookings" className="block hover:text-accent transition-colors">
                My Bookings
              </Link>
              <Link to="/notifications" className="block hover:text-accent transition-colors">
                Notifications
              </Link>
              <Link to="/profile" className="block hover:text-accent transition-colors">
                Profile Settings
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white mt-4 font-medium">Contacts</h4>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 6306430533</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@stylekat.co</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Plot No.40, Knowledge Park 3, GB Nagar</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="mt-4 font-medium text-white">Legal</h4>
            <div className="space-y-2 text-sm">
              <Link to="/privacy" className="block hover:text-accent transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link to="/terms" className="block hover:text-accent transition-colors">
                {t("footer.terms")}
              </Link>
              <Link to="/support" className="block hover:text-accent transition-colors">
                {t("footer.support")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>© 2025 StyleKat — {t("footer.allRights") || "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}
