// Service Worker — SIN CACHÉ. Todo desde red siempre.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  // Borrar todas las cachés existentes
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — siempre red, sin caché
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});

// Push notification (narrador en ruta)
self.addEventListener('push', (e) => {
  let data = { title: 'Salma', body: '' };
  try { data = e.data.json(); } catch (_) { data.body = e.data ? e.data.text() : ''; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Salma', {
      body: data.body,
      icon: '/salma_ai_avatar.png',
      badge: '/salma_ai_avatar.png',
      tag: data.tag || 'narrator',
      data: data
    })
  );
});

// Click en notificación — abrir la app
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      for (const c of cls) {
        if (c.url.includes(self.location.origin)) { c.focus(); return; }
      }
      clients.openWindow('/');
    })
  );
});
