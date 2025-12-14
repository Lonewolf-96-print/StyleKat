import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useBookings } from "../contexts/BookingsContext";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, Eye, EyeOff, MessageSquare, Laugh } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../lib/config";
import cover from "/service-bg.jpg";
import { io } from "socket.io-client";

// Create socket once
const socket = io(SOCKET_URL, { autoConnect: false });

export const LoginForm = () => {
  const { setCurrentUser, setIsAuthReady, setToken } = useApp();
  const { setToken: setBookingToken } = useBookings();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // -------------------------------
  // NORMAL LOGIN
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      const { token, user } = data;

      // SAVE IN LOCAL STORAGE
      localStorage.setItem("token", token);
      localStorage.setItem("role", "barber");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("selectedBarberId", user.id);
      localStorage.setItem("shopId", user.id);

      // SAVE IN CONTEXT
      setToken(token);
      setBookingToken(token);
      setCurrentUser(user);
      setIsAuthReady(true);

      // SOCKET CONNECT
      socket.auth = { token };
      socket.connect();
      socket.emit("joinShopRoom", `shop-${user._id}`);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------
  // GOOGLE LOGIN
  // -------------------------------
  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch(
        `${API_URL}/api/auth/google-login/barber`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: response.credential,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "barber");
      localStorage.setItem("user", JSON.stringify(data.barber));
      localStorage.setItem("selectedBarberId", data.barber._id);
      localStorage.setItem("shopId", data.barber._id);

      setToken(data.token);
      setBookingToken(data.token);
      setCurrentUser(data.barber);
      setIsAuthReady(true);

      // SOCKET CONNECT
      socket.auth = { token: data.token };
      socket.connect();
      socket.emit("joinShopRoom", `shop-${data.barber._id}`);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* ---------------- LEFT SIDE: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-background transition-all duration-500">
        <div className="w-full max-w-sm space-y-10">

          {/* Header */}
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Laugh className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to manage your salon and bookings
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="salon@example.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="pl-10 pr-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                    required
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
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <Button className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : "Sign In to Dashboard"}
            </Button>

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

            <GoogleLogin
              theme="outline"
              size="large"
              width="100%"
              shape="rectangular"
              onSuccess={handleGoogleLogin}
            />

            {/* Signup Link */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have a partner account?{" "}
                <Link to="/auth/signup" className="text-primary font-semibold hover:underline underline-offset-4">
                  Register your Salon
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Looking to book a service?{" "}
                <span
                  onClick={() => navigate("/login/user")}
                  className="text-primary cursor-pointer hover:underline"
                >
                  Customer Login
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ---------------- RIGHT SIDE: IMAGE ---------------- */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/barber-login.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Laugh className="h-6 w-6" />
            StyleKat <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">Salon Owner</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <blockquote className="text-3xl font-medium leading-tight">
              &ldquo;Success is when your customers leave your shop looking good and feeling even better.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-gray-300" />
                ))}
              </div>
              <div className="text-sm font-medium text-white/80">
                Join 500+ top salons
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
