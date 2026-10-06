const CACHE_NAME = 'tire-pressure-v10';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先: オンライン時は常に最新を取得し、取得できた分だけキャッシュを更新する。
// オフライン時のみキャッシュから返す（オフライン対応のための保険）。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      if (event.request.method === 'GET' && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
