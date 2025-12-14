"use client";

import { useState } from "react";
import { useCustomer } from "../contexts/CustomerContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import { useAuthModal } from "../contexts/AuthModelContext";

export default function AuthPage({ isModal = true }) {
  const { login, register, setCustomer, setCustomerToken } = useCustomer();
  const navigate = useNavigate();

  const { isAuthOpen, setIsAuthOpen } = useAuthModal();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // -----------------------------
  // NORMAL LOGIN / SIGNUP
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await login(formData.email, formData.password);
      } else {
        data = await register(formData.name, formData.email, formData.password);
      }

      if (!data.success) {
        setError(data.message);
      } else {
        // Close modal after success
        setIsAuthOpen(false);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // GOOGLE LOGIN
  // -----------------------------
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const res = await fetch("https://localhost:5000/api/users/google/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google Login failed");
        return;
      }

      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerUser", JSON.stringify(data.user));

      setCustomer(data.user);
      setCustomerToken(data.token);

      setIsAuthOpen(false); // close modal
      navigate("/user/dashboard");

    } catch (err) {
      setError("Google Login failed");
    }
  };


  // -----------------------------
  // UI: Modal vs Full-page
  // -----------------------------
  return (
    <div
      className={`
        ${isModal ? "p-0" : "min-h-screen bg-gray-50 p-4 flex items-center justify-center"}
      `}
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        {/* Close button (only in modal) */}
        {isModal && (
          <button
            className="absolute top-4 right-4"
            onClick={() => setIsAuthOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <div>
              <Label> Full Name</Label>
              <Input
                type="text"
                placeholder="Enter your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {isLogin && (
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t"></div>
          <p className="px-2 text-sm text-gray-500">Or continue with</p>
          <div className="flex-1 border-t"></div>
        </div>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google Login Failed")}
          />
        </div>

        {/* Barber Login */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">
            Are you a barber?{" "}
            <span
              className="text-blue-600 font-medium cursor-pointer hover:underline"
              onClick={() => {
                setIsAuthOpen(false);
                navigate("/login/barber");
              }}
            >
              Login as Barber
            </span>
          </p>
        </div>

        {/* Switch login/signup */}
        <p className="text-center text-sm mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>

      </div>
    </div>
  );
}
