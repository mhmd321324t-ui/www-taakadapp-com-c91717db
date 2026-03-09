// Custom service worker additions for notification click handling and push
// This file is injected into the generated service worker by vite-plugin-pwa

// Handle push notifications from the server
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'حان وقت الصلاة 🕌';
  const options = {
    body: data.body || '',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    tag: data.prayer ? `prayer-${data.prayer}` : 'prayer-notification',
    requireInteraction: true,
    silent: false,
    data: { url: data.url || '/', prayer: data.prayer, time: data.time },
    vibrate: [200, 100, 200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Listen for skip waiting message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
