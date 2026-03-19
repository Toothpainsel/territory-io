const CACHE_NAME = 'territory-io-v3.2.0';
const ASSETS = [
  '/',
  'index.html',
  'manifest.webmanifest',
  'assets/rocket.gif',
  'assets/warplane.gif',
  'assets/transport-airplane.gif',
  'assets/explosion.gif',
  'assets/warplane-explosion.gif',
  'assets/fx/launching-missile.mp3',
  'assets/fx/warplane-sound-effect.mp3',
  'assets/fx/warp_exp_sound.mp3',
  'assets/fx/explosion_sound.mp3',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual add calls to ensure one missing asset doesn't break the entire installation
      return Promise.all(
        ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.error(`Failed to cache asset: ${asset}`, err);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch index.html from network first to check for updates
  if (event.request.mode === 'navigate' || event.request.url.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
