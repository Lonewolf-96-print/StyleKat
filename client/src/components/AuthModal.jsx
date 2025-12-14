"use client";

import { useState } from "react";
import { useCustomer } from "../contexts/CustomerContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import Modal from "./Modal";

export default function AuthModal({ open, onClose }) {
  const { login, register, setCustomer, setCustomerToken } = useCustomer();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
        onClose(); // close modal on success
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const res = await fetch("http://localhost:5000/api/users/google/user", {
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

      onClose(); // close modal
    } catch (err) {
      setError("Google Login failed");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label>Full Name</Label>
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

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google Login Failed")}
          />
        </div>

        {/* Toggle */}
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
    </Modal>
  );
}
