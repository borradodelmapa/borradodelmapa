/* ═══════════════════════════════════════════
   Service Worker — Admin Borrado del Mapa
   Cache de archivos locales para funcionamiento offline
   ═══════════════════════════════════════════ */

const CACHE_VERSION = 'admin-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  '/admin/',
  '/admin/index.html',
  '/admin/admin.js',
  '/admin/admin.css',
  '/admin/config.js',
  '/admin/logo-admin.svg',
  '/admin/manifest.json',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

// Install: cachear archivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.log('Cache install error:', err))
  );
});

// Activate: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('admin-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estrategia network-first para API, cache-first para assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // APIs y cross-origin: network-first con fallback a cache
  if (request.method === 'POST' || url.origin !== location.origin ||
      url.pathname.includes('/firebase') || url.pathname.includes('/gstatic') ||
      url.pathname.includes('cloudflare')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache de APIs de terceros (opcional)
          if (request.method === 'GET' && url.origin !== location.origin) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets locales: cache-first con fallback a network
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .then(response => {
        if (response && response.status === 200 && request.method === 'GET') {
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Fallback para HTML si está offline
        if (request.destination === 'document') {
          return caches.match('/admin/index.html');
        }
      })
  );
});

// Sync: sincronizar datos cuando vuelva conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-admin') {
    event.waitUntil(
      // Aquí iría lógica para resincronizar datos
      Promise.resolve()
    );
  }
});
