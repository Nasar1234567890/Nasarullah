// v86 deploy trigger — English guides + Sindhi Maths
/* Service worker for MCQ Tests — GB Lower Secondary School Haseeja Mahar.
   Lets students open and take tests offline once they have visited the site.
   Cache-first with background refresh for same-origin GET requests only;
   form submissions and other requests are never cached. */
const CACHE = 'mcq-tests-v118';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'study.js',
  'study-xi-sd.js',
  'study-xii.js',
  'study-iv.js',
  'study-iii.js',
  'study-v-ur.js',
  'study-vi-ur.js',
  'study-vii-ur.js',
  'study-viii-ur.js',
  'study-ix-ur.js',
  'study-x-ur.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon.svg',
  'fonts/NotoNaskhArabic-Regular.ttf',
  'fonts/NotoNaskhArabic-Bold.ttf',
  'fonts/NotoNastaliqUrdu-Regular.woff2',
  'images/subjects/asan-sindhi.jpg',
  'images/subjects/asan-urdu.jpg',
  'images/subjects/biology.jpg',
  'images/subjects/chemistry.jpg',
  'images/subjects/computer-science.jpg',
  'images/subjects/english.jpg',
  'images/subjects/general-knowledge.jpg',
  'images/subjects/gulzar-e-urdu.jpg',
  'images/subjects/islamiat.jpg',
  'images/subjects/mathematics.jpg',
  'images/subjects/pakistan-studies.jpg',
  'images/subjects/physics.jpg',
  'images/subjects/science.jpg',
  'images/subjects/sindhi.jpg',
  'images/subjects/social-studies.jpg',
  'images/subjects/urdu-salees.jpg',
  'images/subjects/urdu.jpg',
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
