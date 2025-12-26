import { DashboardLayout } from "../../components/dashboard-layout"
import { SettingsPage } from "../../components/settings-page"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components-barber/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import { Lock, Trash2 } from "lucide-react"
import { useCustomer } from "../../contexts/CustomerContext";
import { NotificationSettings } from "../../components/NotificationSettings";

// export default function Settings() {
//   return (
//     <Dashboar
// dLayout>
//       <SettingsPage />
//     </DashboardLayout>
//   )
// }

export default function UserSettingsPage() {
  const [settings, setSettings] = useState({
    notificationSounds: true,
    emailAlerts: true,
    pushNotifications: false,
    marketingEmails: false,
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Get user from context or storage
  const { customer: user } = useCustomer(); // useCustomer provides 'customer' object
  // If useAuth doesn't exist, check localStorage?
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const handleSettingChange = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const handleSavePassword = () => {
    // Validate and save password
    setShowPasswordForm(false)
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-2xl"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your preferences and account security</p>
        </div>

        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Notification Sounds</Label>
                <p className="text-sm text-muted-foreground mt-1">Play sound when you receive notifications</p>
              </div>
              <Switch
                checked={settings.notificationSounds}
                onCheckedChange={() => handleSettingChange("notificationSounds")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Email Alerts</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive email notifications for booking updates</p>
              </div>
              <Switch checked={settings.emailAlerts} onCheckedChange={() => handleSettingChange("emailAlerts")} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive push notifications on your device</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleSettingChange("pushNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive promotional offers and updates</p>
              </div>
              <Switch checked={settings.marketingEmails} onCheckedChange={() => handleSettingChange("marketingEmails")} />
            </div>
          </div>
        </Card>

        {/* Security Settings */}


        {/* Danger Zone */}
        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data</p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
