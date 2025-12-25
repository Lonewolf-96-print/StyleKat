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
    <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl font-black tracking-tighter">
                Style<span className="text-indigo-500">Kat</span>
              </h3>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-sm">
                Revolutionizing the grooming experience. Connect with the best talent, book instantly, and transform your style.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {[
                { icon: <Twitter className="w-5 h-5" />, href: "https://x.com/StyleKatCo" },
                { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/stylekat.in?igsh=N21kdDVnd3o1ZWV4" },
                { icon: <Facebook className="w-5 h-5" />, href: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 border border-slate-800"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Navigation</h4>
              <ul className="space-y-4">
                {[
                  { to: "/user/dashboard", label: "Dashboard" },
                  { to: "/search-salon", label: "Find Salons" },
                  { to: "/my-bookings", label: "Bookings" },
                  { to: "/profile", label: "Profile" }
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-slate-400 hover:text-white transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Support</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">support@stylekat.in</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">+91 6306430533</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                  <span className="text-sm">Knowledge Park 3, <br />GB Nagar, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
                <Mail className="w-24 h-24" />
              </div>
              <div className="relative z-10 space-y-4">
                <h4 className="text-xl font-bold italic">Join the Elite</h4>
                <p className="text-slate-400 text-sm font-light leading-relaxed">
                  Subscribe for exclusive style tips, offer alerts, and trend reports.
                </p>
                <form className="relative" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                  <button type="submit" className="absolute right-2 top-2 bg-indigo-600 text-white rounded-xl p-2.5 hover:bg-indigo-500 transition-all shadow-lg active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-xs font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
          <p>© 2025 STYLEKAT. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}
