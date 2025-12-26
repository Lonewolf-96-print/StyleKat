"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Switch } from "../components-barber/ui/switch"; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Bell, Smartphone, Mail, Volume2, CheckCircle2, AlertCircle } from "lucide-react";
import { API_URL } from "../lib/config";
import { toast } from "sonner"; // Using 'sonner' as seen in package.json

// VAPID Public Key (Ideally from env)
const PUBLIC_VAPID_KEY = "BJDyArv_gCxbB0lwoCniyX7k3lOqjwL4l3KEQfqlRk5vBTzlE_vYOBKwLMPNt5nFYolkbCD2hihEXtqw0MPPLtTs";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationSettings({ role, userId, initialPreferences }) {
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const [permission, setPermission] = useState("default"); // default, granted, denied
    const [preferences, setPreferences] = useState(initialPreferences || { push: true, email: false, sms: false });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check current permission state
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Sync state with DB (Mock for now, would be a useEffect fetch or passed props)

    const handleTogglePreference = async (key) => {
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);

        // Save to backend
        try {
            await fetch(`${API_URL}/api/${role}s/${userId}/preferences`, { // You need to implement this endpoint or reuse update endpoint
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationPreferences: newPrefs })
            });
            toast.success("Preferences saved");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save preferences");
            // Revert
            setPreferences({ ...preferences });
        }
    };

    const subscribeToPush = async () => {
        setLoading(true);
        try {
            if (!userId) {
                toast.error("User ID missing. Try refreshing.");
                setLoading(false);
                return;
            }

            console.log("🚀 Starting Push Subscription...");

            // 1. Register SW
            console.log("Installing Service Worker...");
            const register = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
            console.log("✅ Service Worker Registered:", register.scope);

            // 2. Ask Permission
            console.log("Requesting Notification Permission...");
            const result = await Notification.requestPermission();
            console.log("🔔 Permission Result:", result);
            setPermission(result);

            if (result === "granted") {
                // 3. Subscribe
                console.log("Subscribing to Push Manager...");

                // Check VAPID Key
                if (!PUBLIC_VAPID_KEY || PUBLIC_VAPID_KEY.length < 50) {
                    throw new Error("Invalid Public VAPID Key on client");
                }

                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
                });

                console.log("✅ Subscribed to Push Manager:", subscription);

                // 4. Send to Server
                console.log("Sending subscription to server...");
                const res = await fetch(`${API_URL}/api/notifications/subscribe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subscription, role, userId }),
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to save subscription to server");
                }

                setIsPushEnabled(true);
                toast.success("Push notifications enabled!");
                console.log("🎉 Push setup complete!");
            } else {
                toast.error("Permission denied. You must allow notifications in your browser settings.");
            }
        } catch (err) {
            console.error("❌ Push Setup Error:", err);
            toast.error(`Error: ${err.message || "Failed to enable notifications"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-0 shadow-sm bg-gray-50/50">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" /> Notification Channels
                </CardTitle>
                <CardDescription>
                    Manage how you want to be notified about updates.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* DEVICE NOTIFICATIONS (PUSH) */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Device Notifications</p>
                            <p className="text-sm text-gray-500">Receive alerts on your mobile or computer notification center.</p>
                            {permission === 'denied' && (
                                <div className="mt-2">
                                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                        <AlertCircle size={10} /> Permission blocked by browser
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        To fix: Click the lock icon 🔒 in your address bar, find "Notifications", and select "Reset" or "Allow".
                                    </p>
                                </div>
                            )}
                            {permission === 'granted' && <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Active</p>}
                        </div>
                    </div>

                    {/* If not granted, show button. If granted, show toggle for preference logic (backend) */}
                    {permission !== 'granted' ? (
                        <Button onClick={subscribeToPush} disabled={loading} variant="outline" size="sm">
                            {loading ? "Activating..." : "Enable"}
                        </Button>
                    ) : (
                        <Switch
                            checked={preferences.push}
                            onCheckedChange={() => handleTogglePreference('push')}
                        />
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
