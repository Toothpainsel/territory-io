const CACHE_NAME = 'territory-io-v2.7.0';
const ASSETS = [
  '/',
  'index.html',
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
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
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    })
  );
});
