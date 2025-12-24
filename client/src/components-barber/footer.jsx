
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useLanguage } from "../components-barber/language-provider"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { useLocation } from "react-router-dom"
export function ScrollToTop() {
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

    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Info */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-4xl text-white">StyleKat</h3>
            <p className="text-slate-400 leading-relaxed">
              Grow your business with StyleKat. Manage appointments, staff, and customers seamlessly.
            </p>
            <div className="flex space-x-4">
              {/* Social Icons placeholders */}
              {/* <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a> */}
            </div>
          </div>

          {/* Barber Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">{t("footer.quickLinks")}</h4>
            <div className="space-y-3 flex flex-col">
              <Link to="/dashboard" className="text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">
                {t("navigation.dashboard")}
              </Link>
              <Link to="/dashboard/services" className="text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">
                {t("navigation.services")}
              </Link>
              <Link to="/dashboard/appointments" className="text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">
                {t("navigation.appointments")}
              </Link>
              <Link to={`/dashboard/company-info/${barberId}`} className="text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">
                {t("footer.companyInfo")}
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">{t("footer.contact")}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-white">
                <Phone className="h-5 w-5 mt-1 text-white" />
                <span>+91 6306430533</span>
              </div>
              <div className="flex items-start space-x-3 text-white">
                <Mail className="h-5 w-5 mt-1 text-white" />
                <span>info@styleKat.co</span>
              </div>
              <div className="flex items-start space-x-3 text-white">
                <MapPin className="h-5 w-5 mt-1 text-white" />
                <span>Plot No.40 Knowledge Park 3, GB Nagar</span>
              </div>
            </div>
          </div>

          {/* Newsletter / Legal */}
          {/* <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">Newsletter</h4>
            <p className="text-slate-400">Stay updated with new features and business tips.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 px-5 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button type="submit" className="absolute right-1 top-1 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div> */}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2025 StyleKat. {t("footer.allRights")}</p>
          {/* <div className="flex space-x-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div> */}
        </div>
      </div>
    </footer>

  )
}
