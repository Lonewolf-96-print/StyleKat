import { useState } from "react";
import { useCustomer } from "../contexts/CustomerContext";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";
import { FcGoogle } from "react-icons/fc";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, User, MessageSquare, Store, Eye, Laugh, EyeOff } from "lucide-react";
import { useAuthModal } from "../contexts/AuthModelContext";

export function CustomerSignupForm() {
  const { setCustomer, setCustomerToken } = useCustomer();
  const { setIsAuthOpen } = useAuthModal();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }



      setCustomer(data.user);
      setCustomerToken(data.token);

      localStorage.setItem("customerUser", JSON.stringify(data.user));
      localStorage.setItem("customerToken", data.token);

      setIsAuthOpen(false);
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`${API_URL}/api/users/google/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Google signup failed");
        }

        setCustomer(data.user);
        setCustomerToken(data.token);

        localStorage.setItem("customerUser", JSON.stringify(data.user));
        localStorage.setItem("customerToken", data.token);

        setIsAuthOpen(false);
        navigate("/user/dashboard");
      } catch (err) {
        setError(err.message);
      }
    },
    onError: () => console.log("Google Login Failed"),
  });

  return (
    <div className="min-h-screen w-full flex">

      {/* ---------------- LEFT SIDE: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-background transition-all duration-500">
        <div className="w-full max-w-sm space-y-8">

          {/* Header */}
          <div className="text-left space-y-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Laugh className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Join us and simplify your salon experience.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignup} className="space-y-5">

            {/* Owner Name */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                    required
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                    required
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* Submit */}
            <Button className="w-full h-11 mt-2 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : "Create Account"}
            </Button>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <MessageSquare className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}


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
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-2 text-base"
              onClick={() => googleLogin()}
            >
              <FcGoogle className="h-5 w-5" />
              Sign up with Google
            </Button>

            {/* Login Redirect */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login/user" className="text-primary font-semibold hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ---------------- RIGHT SIDE: IMAGE ---------------- */}
      <div
        className="hidden lg:flex w-1/2 relative bg-gray-900 min-h-screen"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/signup-user.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg leading-tight">
            Look your best,<br />Save your time.
          </h1>
          <p className="text-lg text-white/80 max-w-md drop-shadow font-light">
            Book appointments instantly with top-rated local barbers and salons.
          </p>
        </div>
      </div>
    </div>
  );
}
