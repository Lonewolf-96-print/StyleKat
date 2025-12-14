import { useState } from "react";
import { useCustomer } from "../contexts/CustomerContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, Eye, EyeOff, Laugh } from "lucide-react";
import { useAuthModal } from "../contexts/AuthModelContext";

export const CustomerLoginForm = () => {
  const { login, setCustomer, setCustomerToken } = useCustomer();
  const { setIsAuthOpen } = useAuthModal();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login(form.email, form.password);

      if (!data.success) throw new Error(data.message);

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

  const handleGoogleLogin = async (res) => {
    try {
      const decoded = jwtDecode(res.credential);

      const api = await fetch(`${API_URL}/api/users/google/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.credential }), // Note: backend expects 'token' usually
      });

      const data = await api.json();
      if (!api.ok) throw new Error(data.message);

      setCustomer(data.user);
      setCustomerToken(data.token);

      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerUser", JSON.stringify(data.user));

      setIsAuthOpen(false);
      navigate("/user/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google Login failed");
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              ) : "Sign In"}
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
              width="300"
              shape="rectangular"
              onSuccess={handleGoogleLogin}
            />
          </form>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/signup/user" className="text-primary font-semibold hover:underline underline-offset-4">
                Create one
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Salon Owner?{" "}
              <span
                onClick={() => navigate("/login/barber")}
                className="text-primary cursor-pointer hover:underline"
              >
                Login to Dashboard
              </span>
            </p>
          </div>

        </div>
      </div>

      {/* ---------------- RIGHT SIDE: IMAGE ---------------- */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/user-login.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Laugh className="h-6 w-6" />
            StyleKat
          </div>

          <div className="space-y-6 max-w-lg">
            <blockquote className="text-3xl font-medium leading-tight">
              &ldquo;The best way to find yourself is to lose yourself in the service of others.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-gray-300" />
                ))}
              </div>
              <div className="text-sm font-medium text-white/80">
                Trusted by 10k+ happy customers
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
