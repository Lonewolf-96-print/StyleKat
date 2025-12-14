"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Bell, Lock, Eye, Globe, LogOut, Trash2, ChevronRight } from "lucide-react"


const defaultSettings = {
  emailNotifications: true,
  pushNotifications: true,
  bookingReminders: true,
  marketingEmails: false,
  twoFactorAuth: false,
  profileVisibility: "private",
  dataCollection: true,
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const SettingToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security</p>
      </div>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Control how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingToggle
            label="Email Notifications"
            description="Receive notifications via email"
            value={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
          />
          <SettingToggle
            label="Push Notifications"
            description="Receive push notifications on your device"
            value={settings.pushNotifications}
            onChange={() => handleToggle("pushNotifications")}
          />
          <SettingToggle
            label="Booking Reminders"
            description="Get reminders before your bookings"
            value={settings.bookingReminders}
            onChange={() => handleToggle("bookingReminders")}
          />
          <SettingToggle
            label="Marketing Emails"
            description="Receive promotional offers and updates"
            value={settings.marketingEmails}
            onChange={() => handleToggle("marketingEmails")}
          />
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onChange={() => handleToggle("twoFactorAuth")}
          />
          <div className="py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Profile Visibility
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.profileVisibility === "public" ? "Your profile is public" : "Your profile is private"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <SettingToggle
            label="Data Collection"
            description="Allow us to collect usage data to improve your experience"
            value={settings.dataCollection}
            onChange={() => handleToggle("dataCollection")}
          />
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Account
          </CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
          <Button variant="destructive" className="w-full justify-start gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>{saved && <p className="text-sm text-green-600">Settings saved successfully!</p>}</div>
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
