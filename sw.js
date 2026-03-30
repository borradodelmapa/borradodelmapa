const CACHE_NAME = 'bdm-v32';
const STATIC_ASSETS = [
  '/',
  '/styles.css',
  '/app.js',
  '/salma.js',
  '/country-utils.js',
  '/guide-renderer.js',
  '/salma_ai_avatar.png',
  '/mapa.png'
];

// Instalar — cachear assets estáticos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar — limpiar caches viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // No cachear API calls ni streams
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cachear respuesta fresca
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
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
