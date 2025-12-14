
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useLanguage } from "../components-barber/language-provider"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { useLocation } from "react-router-dom"
export  function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname]) // 👈 runs whenever route changes

  return null
}
export default function DashboardFooter() {
  const { t } = useLanguage()
  const barberId = localStorage.getItem("shopId")
  return (
    
    <footer className="bg-primary text-primary-foreground border-t border-border">
  <div className="px-6 py-4">
    {/* only visible on lg+ */}
    <div className="lg:grid grid-cols-4 gap-6">
      {/* Company Info */}
      <div className="space-y-3">
        <h3 className=" font-semibold text-white text-3xl">StyleKat</h3>
        {/* <p className="text-sm text-primary-foreground/80">{t("footer.description")}</p>
        <div className="flex space-x-3">
          <Facebook className="h-4 w-4 hover:text-accent cursor-pointer transition-colors" />
          <Twitter className="h-4 w-4 hover:text-accent cursor-pointer transition-colors" />
          <Instagram className="h-4 w-4 hover:text-accent cursor-pointer transition-colors" />
        </div> */}
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h4 className="text-white mt-4 font-medium">{t("footer.quickLinks")}</h4>
        <div className="space-y-2 text-sm">
          <Link to="/dashboard" className="block hover:text-accent transition-colors">
            {t("navigation.dashboard")}
          </Link>
          <Link to="/dashboard/services" className="block hover:text-accent transition-colors">
            {t("navigation.services")}
          </Link>
          <Link to="/dashboard/appointments" className="block hover:text-accent transition-colors">
            {t("navigation.appointments")}
          </Link>
          <Link to={`/dashboard/company-info/${barberId}`} className="block hover:text-accent transition-colors">
            {t("footer.companyInfo")}
          </Link>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <h4 className="text-white mt-4 font-medium">{t("footer.contact")}</h4>
        <div className="space-y-2 text-sm text-primary-foreground/80">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>+916306430533</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>info@styleKat.co</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Plot No.40 Knowledge Park 3,GB Nagar</span>
          </div>
        </div>
      </div>

      {/* Legal */}
      {/* <div className="space-y-3">
        <h4 className="mt-4 font-medium text-white">{t("footer.legal")}</h4>
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
      </div> */}
    </div>

    {/* Bottom bar (always visible) */}
    <div className="mt-6 pt-4 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
      <p>2025 StyleKat {t("footer.allRights")}</p>
    </div>
  </div>
</footer>

  )
}
