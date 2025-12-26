import webpush from "web-push";
import User from "../model/User.model.js";
import Barber from "../model/Barber.model.js";

// Initialize VAPID keys (You should Generate these once and store in .env)
// For dev, we can generate if missing or use placeholders.
// webpush.setVapidDetails(
//   "mailto:test@test.com",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

export const NotificationService = {
    /**
     * Send a notification to a user or barber based on their preferences.
     * @param {string} recipientId - The _id of the User or Barber
     * @param {'user'|'barber'} role - 'user' or 'barber'
     * @param {string} title - Notification Title
     * @param {string} body - Notification Body
     * @param {string} url - Action URL (e.g., /dashboard/appointments)
     */
    async send(recipientId, role, title, body, url = "/") {
        try {
            let recipient;
            if (role === "barber") {
                recipient = await Barber.findById(recipientId);
            } else {
                recipient = await User.findById(recipientId);
            }

            if (!recipient) {
                console.warn(`NotificationService: Recipient not found (${role}: ${recipientId})`);
                return;
            }

            const prefs = recipient.notificationPreferences || { push: true, email: false };

            // 1. PUSH NOTIFICATION
            if (prefs.push && recipient.pushSubscriptions?.length > 0) {
                this.sendPush(recipient, title, body, url);
            }

            // 2. EMAIL NOTIFICATION (Placeholder)
            if (prefs.email && recipient.email) {
                this.sendEmail(recipient.email, title, body);
            }

            // 3. IN-APP / SOCKET (Handled separately via IO usually, but could be triggered here if decoupled)
            // console.log(`[Notification] Sent to ${recipient.email || recipientId}: ${title}`);

        } catch (err) {
            console.error("NotificationService Error:", err);
        }
    },

    async sendPush(recipient, title, body, url) {
        const payload = JSON.stringify({ title, body, url });

        // Clean up dead subscriptions
        const newSubscriptions = [];

        for (const sub of recipient.pushSubscriptions) {
            try {
                await webpush.sendNotification(sub, payload);
                newSubscriptions.push(sub);
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    // Subscription is dead (user reset permission or browser)
                    console.log("Removing dead push subscription");
                } else {
                    console.error("Push Error:", err);
                    newSubscriptions.push(sub); // Keep if transient error
                }
            }
        }

        // Update DB if subs changed
        if (newSubscriptions.length !== recipient.pushSubscriptions.length) {
            recipient.pushSubscriptions = newSubscriptions;
            await recipient.save();
        }
    },

    async sendEmail(email, title, body) {
        // Placeholder using console or nodemailer logic if user asks later
        // console.log(`📧 [EMAIL MOCK] To: ${email} | Subject: ${title} | Body: ${body}`);
    }
};
