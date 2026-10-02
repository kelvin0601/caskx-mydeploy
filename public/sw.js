// Cask Exchange - Service Worker for Browser Push Notifications

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "resources-live-preview-ping") {
        const port = event.ports?.[0];
        port?.postMessage({ type: "resources-live-preview-ready" });
        return;
    }

    if (
        !message ||
        message.type !== "resources-live-preview-forward" ||
        !message.payload ||
        message.payload.type !== "payload-live-preview" ||
        !message.payload.data ||
        typeof message.payload.data !== "object"
    ) {
        return;
    }

    const source = event.source;
    if (!source || typeof source.postMessage !== "function") return;

    source.postMessage({
        type: "resources-live-preview",
        payload: message.payload,
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || "/notifications";

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (
                        client.url &&
                        client.url.includes(self.location.origin) &&
                        "focus" in client
                    ) {
                        if ("navigate" in client) {
                            client.navigate(urlToOpen);
                        }
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

self.addEventListener("push", (event) => {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const title = payload.title || "Cask Exchange";
        const options = {
            body: payload.body || payload.message || "",
            icon: payload.icon || "/icons/logo.svg",
            badge: payload.badge || "/icons/logo.svg",
            data: {
                url: payload.url || payload.actionHref || "/notifications",
                id: payload.id,
            },
            tag: payload.id || "cask-exchange-notification",
            renotify: true,
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error("Error displaying push notification from SW:", err);
    }
});
