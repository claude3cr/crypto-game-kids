// Minimal offline cache so "Add to Home Screen" keeps working with no network.
// Bump CACHE when you change any shell file.
// Bump these THREE together on any shell change:
//   1) index.html ?v=N   2) the ?v=N in this SHELL list   3) the CACHE constant
const CACHE = 'crypto-kids-v7';
const SHELL = [
  './', './index.html', './style.css?v=7', './app.js?v=7', './audio.js',
  './translations.js',
  './js/games/index.js', './js/games/bull-or-bear.js',
  './js/games/cohete.js', './js/games/cuidado.js', './js/games/palabras.js',
  './js/games/sectores.js',
  './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// cache-first: instant load, fully offline once cached
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;  // ignore cross-origin
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() =>
      // offline fallback ONLY for page navigations; a missing module/asset fails
      // loudly instead of silently returning HTML
      e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()
    ))
  );
});
