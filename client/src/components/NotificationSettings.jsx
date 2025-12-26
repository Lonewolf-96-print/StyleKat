"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Switch } from "../components-barber/ui/switch"; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Bell, Smartphone, Mail, Volume2, CheckCircle2, AlertCircle } from "lucide-react";
import { API_URL } from "../lib/config";
import { toast } from "sonner"; // Using 'sonner' as seen in package.json

// VAPID Public Key (Ideally from env)
const PUBLIC_VAPID_KEY = "BJe5O2...placeholder..."; // Replace with real key or fetch from API

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
            // 1. Register SW
            const register = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

            // 2. Ask Permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === "granted") {
                // 3. Subscribe
                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
                });

                // 4. Send to Server
                await fetch(`${API_URL}/api/notifications/subscribe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subscription, role, userId }),
                });

                setIsPushEnabled(true);
                toast.success("Push notifications enabled!");
            } else {
                toast.error("Permission denied. Check browser settings.");
            }
        } catch (err) {
            console.error("Push Setup Error:", err);
            toast.error("Failed to enable push notifications.");
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
                            {permission === 'denied' && <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1"><AlertCircle size={10} /> Permission blocked by browser</p>}
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
