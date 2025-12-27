self.addEventListener("push", (event) => {
    const data = event.data.json();
    const { title, body, url } = data;

    const options = {
        body: body,
        icon: "/main-logo.png", // Using existing asset
        badge: "/main-logo.png", // Using existing asset
        vibrate: [200, 100, 200],
        sound: "/notification.mp3",
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
