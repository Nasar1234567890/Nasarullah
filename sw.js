/* Service worker for MCQ Tests — GB Lower Secondary School Haseeja Mahar.
   Lets students open and take tests offline once they have visited the site.
   Cache-first with background refresh for same-origin GET requests only;
   form submissions and other requests are never cached. */
const CACHE = 'mcq-tests-v78';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'study.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon.svg',
  'fonts/NotoNaskhArabic-Regular.ttf',
  'fonts/NotoNaskhArabic-Bold.ttf',
  'fonts/NotoNastaliqUrdu-Regular.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var network = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
