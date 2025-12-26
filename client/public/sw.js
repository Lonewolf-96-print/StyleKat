self.addEventListener("push", (event) => {
    const data = event.data.json();
    const { title, body, url } = data;

    const options = {
        body: body,
        icon: "/icon-192x192.png", // Ensure you have this or standard icon
        badge: "/badge-72x72.png",
        data: {
            url: url || "/",
        },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
