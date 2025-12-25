import { Link, useLocation } from "react-router-dom";
import React, { use } from "react";
import { Scissors, Menu, X } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import { useUser } from "../contexts/BarberContext";
export default function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const currentUser = user;
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [openAuth, setOpenAuth] = React.useState(false);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const showShopMenu = /^\/shopId\/[^/]+\/booking$/.test(location.pathname);
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // ✅ use window.scrollY
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (


    <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-8 w-8 text-primary" />
          <span className="font-display text-2xl font-bold text-foreground">StyleKat</span>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* <img src={salon} onClick={() => navigate("/salons")} className="h-10 w-10" alt={t("common.salon")} /> */}
          {/* <img src={scissors} className="h-10 w-10" alt={t("common.scissors")} /> */}
          <Button variant="ghost" onClick={() => navigate("/")} className=" text-black font-semibold hover:bg-green-200">
            Go to Home
          </Button>
          {currentUser ? (
            <Button onClick={() => navigate(currentUser.role === 'user' ? '/user/dashboard' : '/dashboard')} className="bg-green-50 text-black font-semibold hover:bg-green-200">
              Dashboard
            </Button>
          ) : (
            <Button onClick={() => navigate("/login/user")} className="bg-green-50 text-black font-semibold hover:bg-green-200">
              Sign In
            </Button>
          )}

          {currentUser?.email && (
            <Button onClick={() => setCurrentUser({ name: "", email: "", password: "" })}>
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-card px-4 py-4 space-y-4">
          <Button variant="ghost" onClick={() => { navigate("/"); setIsMenuOpen(false) }} className="w-full justify-start">
            Go to Home
          </Button>
          {currentUser ? (
            <Button onClick={() => { navigate(currentUser.role === 'user' ? '/user/dashboard' : '/dashboard'); setIsMenuOpen(false) }} className="w-full justify-start bg-green-50 text-black font-semibold hover:bg-green-200">
              Dashboard
            </Button>
          ) : (
            <Button onClick={() => { navigate("/login/user"); setIsMenuOpen(false) }} className="w-full justify-start bg-green-50 text-black font-semibold hover:bg-green-200">
              Sign In
            </Button>
          )}
          {currentUser?.email && (
            <Button onClick={() => { setCurrentUser({ name: "", email: "", password: "" }); setIsMenuOpen(false) }} className="w-full justify-start text-red-500">
              Logout
            </Button>
          )}
        </div>
      )}
    </nav>



  );
}
