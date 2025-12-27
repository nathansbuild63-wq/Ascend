// sw.js
const CACHE_NAME = 'ascend-v1';

const CORE_ASSETS = [
  './',
  './index.html'
];

// Install – cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch – network first, fallback to cache
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });
        return res;
      })
      .catch(() => caches.match(req))
  );
});