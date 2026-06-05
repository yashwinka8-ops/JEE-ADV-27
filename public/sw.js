// Life OS Study Reminder Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '📚 Study Reminder';
  const options = {
    body: data.body || "Time to study! Your JEE goals won't achieve themselves.",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: data.tag || 'study-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: '📖 Open Tracker' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/personal') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/personal');
      }
    })
  );
});

// Handle scheduled notifications via message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, tag } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title || '📚 Study Reminder', {
        body: body || "Time to study!",
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: tag || 'study-reminder',
        renotify: true,
      });
    }, delay);
  }
});
