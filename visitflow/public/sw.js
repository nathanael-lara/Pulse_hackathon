const CACHE_NAME = 'corvas-shell-v1';
const APP_SHELL = ['/', '/app', '/offline', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/app') || caches.match('/offline');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (request.url.startsWith(self.location.origin)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/offline'));
    })
  );
});

// Background reminder check - fire periodically to send due reminders
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_REMINDERS') {
    const reminders = event.data.reminders || [];
    const now = new Date();
    const notificationTimestamp = now.toISOString();

    reminders.forEach((reminder) => {
      const reminderTime = new Date(reminder.scheduledTime);
      const diffMs = now.getTime() - reminderTime.getTime();

      // Send if within 5 minutes of scheduled time and not yet sent
      if (diffMs >= 0 && diffMs < 5 * 60 * 1000) {
        const options = {
          body: reminder.body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: reminder.id,
          // Embed notification timestamp for latency tracking (anti-cheat)
          data: {
            ...reminder.data,
            notificationTimestamp, // When notification was shown
            scheduledTime: reminder.scheduledTime, // Original scheduled time
          },
          actions: [
            {
              action: 'quick-action',
              title: reminder.data.label || 'Open app',
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
            },
          ],
        };

        self.registration.showNotification(reminder.title, options);
      }
    });
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from CorVas',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: data.type || 'notification',
      data: { type: data.type, tab: data.tab },
    };

    event.waitUntil(self.registration.showNotification(data.title || 'CorVas', options));
  } catch (e) {
    const text = event.data.text();
    event.waitUntil(self.registration.showNotification(text));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tab = event.notification.data?.tab || 'today';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' || client.url.includes('/app')) {
          return client.focus().then(() => {
            client.postMessage({ type: 'navigate-to-tab', tab });
          });
        }
      }
      return clients.openWindow('/app?tab=' + tab);
    })
  );
});

