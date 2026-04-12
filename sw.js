// Service Worker — Cache del shell + network-first para API (P1-7)

const CACHE_NAME = 'salma-v11';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/salma.js',
  '/video-player.js',
  '/video-assembly.js',
  '/guide-renderer.js',
  '/bitacora-renderer.js',
  '/mapa-ruta.js',
  '/mapa-itinerario.js',
  '/notas.js',
  '/salma_ai_avatar.webp',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // API calls (worker) — network-only, no cachear
  if (url.hostname.includes('salma-api') || url.hostname.includes('workers.dev')) return;

  // Firebase/Google — no cachear
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseapp.com') || url.hostname.includes('gstatic.com')) return;

  // HTML (navegación) — network-first (siempre carga la versión nueva)
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // JS/CSS/imágenes — stale-while-revalidate (cache rápido + actualizar en background)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (cached) return cached;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });

      return cached || fetchPromise;
    })
  );
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
