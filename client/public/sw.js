self.addEventListener("push", (event) => {
    const data = event.data.json();
    const { title, body, url } = data;

    const options = {
        body: body,
        icon: "/New-logo.png", // Updated logo
        badge: "/New-logo.png", // Updated logo
        vibrate: [200, 100, 200],
        sound: "/notify.mp3",
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
