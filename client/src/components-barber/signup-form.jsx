
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useGoogleLogin } from "@react-oauth/google";
import { ArrowLeft, Upload, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { API_URL } from "../lib/config";
import { useApp } from "../contexts/AppContext";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPinHouse,
  Store,
} from "lucide-react";
import { toast } from "react-hot-toast";

export const SignupForm = () => {
  const { setCurrentUser, setIsAuthReady, setToken } = useApp();

  const [ownerName, setOwnerName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ---------------------
  // BARBER SIGNUP API
  // ---------------------
  async function BarberSignup(userData) {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup/barber`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Signup failed");
        throw new Error(data.message || "Signup failed");
      }

      // SAVE AUTH DETAILS
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "barber");
      localStorage.setItem("user", JSON.stringify(data.barber));
      localStorage.setItem("selectedBarberId", data.barber.id);
      localStorage.setItem("shopId", data.barber.id);

      setToken(data.token);
      setCurrentUser(data.barber);
      setIsAuthReady(true);

      // SOCKET
      socket.auth = { token: data.token };
      socket.connect();
      socket.emit("joinshopRoom", `shop - ${data.barber.id} `);

      toast.success(`Account created successfully for ${data.barber.ownerName}`);

      return data;
    } catch (error) {
      toast.error("Signup failed");
      throw error;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const barberData = {
      ownerName,
      salonName,
      phoneNumber,
      email,
      address,
      password,
    };

    try {
      const result = await BarberSignup(barberData);

      toast.success(`Account created for ${barberData.salonName}`);
      navigate("/dashboard");
      socket.emit("joinshopRoom", result.barber.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================
  //                 🎨 UI LAYOUT (MATCH LOGIN UI)
  // ===========================================================
  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* ---------------- LEFT SIDE: SIGNUP FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-4 sm:p-3 lg:p-4 bg-background transition-all duration-500 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">

          {/* Header */}
          <div className="text-left space-y-2">

            <h1 className="text-3xl font-bold tracking-tight text-foreground">Join with StyleKat</h1>
            <p className="text-muted-foreground text-sm">
              Join thousands of salon owners growing their business.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              {/* Owner Name */}
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  placeholder="Your name"
                  className="h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                  required
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              {/* Salon Name */}
              <div className="space-y-2">
                <Label htmlFor="salonName">Salon Name</Label>
                <Input
                  id="salonName"
                  placeholder="Your salon name"
                  className="h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                  required
                  onChange={(e) => setSalonName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="salon@example.com"
                  className="pl-10 h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  className="pl-10 h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                  required
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Shop Address</Label>
              <div className="relative group">
                <MapPinHouse className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="address"
                  placeholder="Your shop Address"
                  className="pl-10 h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                  required
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>


            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>


            {/* Submit */}
            <Button className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-4" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Creating Shop Account...
                </div>
              ) : "Create Shop Account"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google */}
            <GoogleLogin
              theme="outline"
              size="large"
              width="100%"
              shape="rectangular"
              onSuccess={(cred) => {
                let decoded = jwtDecode(cred.credential);

              }}

            />

            {/* Login Redirect */}
            <div className="text-center text-sm mt-4 text-muted-foreground">
              Already have a shop account?{" "}
              <Link to="/login/barber" className="text-primary font-semibold hover:underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ---------------- RIGHT SIDE: IMAGE ---------------- */}
      <div
        className="hidden lg:flex w-1/2 relative bg-gray-900 h-full"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/salon-cover.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg leading-tight">
            Grow Your <br />Styling Business
          </h1>
          <p className="text-lg text-white/80 max-w-md drop-shadow font-light">
            Manage bookings, customers, staff and more — all in one powerful dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
