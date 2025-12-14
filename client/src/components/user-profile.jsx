"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Edit2, Save, X, Mail, Phone, MapPin, Lock } from "lucide-react";
import { toast } from "sonner";
import { useBookings } from "../contexts/BookingsContext";
import { useApp } from "../contexts/AppContext";
import { useCustomer } from "../contexts/CustomerContext";
import { DashboardLayout } from "./dashboard-layout";

export function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({});
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const { navigate } = useApp();
  const { customer } = useCustomer();
  const { userBookings } = useBookings();

  // Load user profile
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("customerToken");

        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        const merged = {
          ...data,
          name: data.name || customer?.name,
          email: data.email || customer?.email,
          avatar: data.avatar || customer?.picture
        };

        setUser(merged);
        setFormData(merged);
        console.log("User profile loaded:", merged);
      } catch (err) {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // redirect when logged out
  useEffect(() => {
    if (!loading && !customer) navigate("/login/user");
  }, [loading, customer]);

  if (loading)
    return (
      <DashboardLayout>
        <p className="text-center mt-10">Loading...</p>
      </DashboardLayout>
    );

  if (!user)
    return (
      <DashboardLayout>
        <p className="text-center text-red-500 mt-10">Profile not found</p>
      </DashboardLayout>
    );

  // Google users DO NOT have passwordExists = true
  const isGoogleUser = !user.passwordExists;

  const handleInputChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Save password
  const handleSavePassword = async () => {
    if (!isGoogleUser && !passwords.current) {
      toast.error("Enter current password");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("customerToken");

    const res = await fetch("http://localhost:5000/api/users/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: isGoogleUser ? null : passwords.current,
        newPassword: passwords.new
      })
    });

    const data = await res.json();
    console.log("Data recieved from the backend", data);

    if (!res.ok) {
      toast.error(data.message || "Password update failed");
      return;
    }

    toast.success(isGoogleUser ? "Password created!" : "Password updated!");
    setShowPasswordForm(false);
  };

  // Save profile
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("customerToken");

      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const updated = await res.json();

      setUser(updated);
      setFormData(updated);
      setIsEditing(false);

      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (

    <div className="max-w-6xl mx-auto px-4 pb-12 space-y-8">

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN - IDENTITY CARD */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg bg-white relative">
            {/* Decorative Background */}
            <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 absolute top-0 w-full z-0"></div>

            <CardContent className="pt-20 pb-8 px-6 relative z-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-primary text-white flex items-center justify-center text-4xl font-bold mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-muted-foreground font-medium mb-6">{user.email}</p>

              <div className="w-full grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 mb-6">
                <div>
                  <p className="text-2xl font-bold text-primary">{userBookings?.bookings?.length || 0}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Bookings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {new Date(user.createdAt).getFullYear()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - DETAILS & SETTINGS */}
        <div className="lg:col-span-8 space-y-6">

          {/* Personal Information */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </div>
                {!isEditing ? (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit2 className="h-4 w-4" /> <span className="hidden sm:inline">Edit Details</span>
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(user); }}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Full Name" name="name" value={formData.name} isEditing={isEditing} handleChange={handleInputChange} />
              <FormField label="Email Address" name="email" value={formData.email} type="email" icon={<Mail className="w-4 h-4" />} isEditing={isEditing} handleChange={handleInputChange} />
              <FormField label="Phone Number" name="phone" value={formData.phone} icon={<Phone className="w-4 h-4" />} isEditing={isEditing} handleChange={handleInputChange} />
              <FormField label="Address" name="address" value={formData.address} icon={<MapPin className="w-4 h-4" />} isEditing={isEditing} handleChange={handleInputChange} />
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Security & Password</CardTitle>
              <CardDescription>Manage your account security preferences.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isGoogleUser ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Signed in with Google</p>
                      <p className="text-xs opacity-80">This account uses Google for authentication.</p>
                    </div>
                  </div>
                  {!showPasswordForm ? (
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>Create Password</Button>
                  ) : null}
                </div>
              ) : null}

              {(!isGoogleUser || showPasswordForm) && (
                <div className={`mt-4 space-y-4 max-w-md ${isGoogleUser ? 'border-t pt-6 bg-gray-50 rounded-lg p-4' : ''}`}>
                  {!showPasswordForm && !isGoogleUser && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Password last changed recently</p>
                      <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>Change Password</Button>
                    </div>
                  )}

                  {showPasswordForm && (
                    <PasswordForm
                      isGoogleUser={isGoogleUser}
                      passwords={passwords}
                      handlePasswordChange={handlePasswordChange}
                      handleSavePassword={handleSavePassword}
                      onCancel={() => setShowPasswordForm(false)}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
}

/* ---------------------------------
   Helper: FormField Component
--------------------------------- */
function FormField({ label, name, icon, value, isEditing, handleChange, type }) {
  return (
    <div className="group">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-1.5 transition-colors group-hover:text-primary">
        {icon} {label}
      </label>

      {isEditing ? (
        <Input
          className="bg-white"
          name={name}
          type={type || "text"}
          value={value || ""}
          onChange={handleChange}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      ) : (
        <div className="py-2 px-3 bg-gray-50 rounded-md border border-gray-100 text-gray-800 text-sm font-medium">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------
   Helper: Password Form Component
--------------------------------- */
function PasswordForm({
  isGoogleUser,
  passwords,
  handlePasswordChange,
  handleSavePassword,
  onCancel
}) {
  return (
    <div className="space-y-4">
      {!isGoogleUser && (
        <PasswordField
          label="Current Password"
          name="current"
          value={passwords.current}
          onChange={handlePasswordChange}
        />
      )}

      <PasswordField
        label="New Password"
        name="new"
        value={passwords.new}
        onChange={handlePasswordChange}
      />
      <PasswordField
        label="Confirm Password"
        name="confirm"
        value={passwords.confirm}
        onChange={handlePasswordChange}
      />

      <div className="flex gap-3">
        <Button onClick={handleSavePassword}>
          {isGoogleUser ? "Set Password" : "Update Password"}
        </Button>

        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-2"
        type="password"
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
