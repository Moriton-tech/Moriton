/* ============================================================
   Морьтон Адууны Төв — Service Worker
   ------------------------------------------------------------
   Зорилго:
     1) PWA болгож суулгах боломж нээх (app shell кэш)
     2) Шинэ хувилбар гарахад АВТОМАТААР шинэчлэх
   Хийхгүй зүйл:
     • Firestore / Auth / Storage дуудлагыг ОГТ хөндөхгүй
       (өгөгдлийн оффлайн кэш энэ хувилбарт байхгүй)

   ⚠️ Код өөрчлөх бүрдээ доорх APP_VERSION-ийг СОЛИНО.
      Ингэснээр хуучин кэш устаж, бүх хэрэглэгч шинэ хувилбар авна.
   ============================================================ */

const APP_VERSION = '2026-08-31-1';

const SHELL_CACHE = 'moriton-shell-' + APP_VERSION;
const CDN_CACHE   = 'moriton-cdn-v1';

/* Апп ажиллахад шаардлагатай өөрийн файлууд */
const SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './lab.js',
  './firebase.js',
  './pwa.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico'
];

/* ⛔ ЭДГЭЭРИЙГ ХЭЗЭЭ Ч БҮҮ ТАСЛАН АВ —
   Firestore real-time stream, Auth token, Storage upload энд явдаг.
   Service worker дундуур нь орвол sync эвдэрнэ. */
const LIVE_HOSTS = [
  'firestore.googleapis.com',
  'firebasestorage.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'firebaseremoteconfig.googleapis.com',
  'firebaselogging-pa.googleapis.com',
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com'
];

/* Гуравдагч талын статик нөөц — хувилбар нь URL-д тогтсон тул кэшлэхэд аюулгүй */
const CDN_HOSTS = [
  'www.gstatic.com',      // Firebase SDK module-ууд
  'fonts.googleapis.com', // Google Fonts CSS
  'fonts.gstatic.com'     // Google Fonts файл
];

const isLiveHost = (host) =>
  LIVE_HOSTS.some((h) => host === h || host.endsWith('.' + h));

/* ── INSTALL ────────────────────────────────────────────────── */
self.addEventListener('install', (event) => {
  // Хүлээлгүйгээр шууд идэвхжинэ (автомат шинэчлэлт)
  self.skipWaiting();

  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Нэг файл алдаа өгвөл бүх install унахгүй байх ёстой
      Promise.all(
        SHELL.map((url) =>
          cache
            .add(new Request(url, { cache: 'reload' }))
            .catch((err) => console.warn('[sw] кэшлэж чадсангүй:', url, err))
        )
      )
    )
  );
});

/* ── ACTIVATE ───────────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('moriton-shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      );
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch (e) {}
      }
      await self.clients.claim(); // нээлттэй бүх таб-ыг шууд эзэмшинэ
    })()
  );
});

/* ── FETCH ──────────────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Firebase live traffic — хөндөхгүй өнгөрөөнө
  if (isLiveHost(url.hostname)) return;

  // Өөрийн файлууд → сүлжээг эхлээд (үргэлж шинэ), тасарвал кэшнээс
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(req, event));
    return;
  }

  // CDN статик → кэшнээс шууд өгөөд, ард нь чимээгүй шинэчилнэ
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, event));
  }
});

/* ── Стратеги: network-first ────────────────────────────────── */
async function networkFirst(req, event) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    let res = null;
    if (event && event.preloadResponse) {
      res = await event.preloadResponse;
    }
    if (!res) res = await fetch(req);

    if (res && res.ok && res.type === 'basic') {
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (err) {
    // Офлайн: query string-ийг үл тооцон кэшнээс хайна (?v=... хувилбарууд)
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;

    if (req.mode === 'navigate') {
      const shell =
        (await cache.match('./index.html', { ignoreSearch: true })) ||
        (await cache.match('./', { ignoreSearch: true }));
      if (shell) return shell;
    }
    throw err;
  }
}

/* ── Стратеги: stale-while-revalidate ───────────────────────── */
async function staleWhileRevalidate(req, event) {
  const cache = await caches.open(CDN_CACHE);
  const hit = await cache.match(req);

  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => null);

  if (hit) {
    if (event && event.waitUntil) event.waitUntil(network);
    return hit;
  }
  const res = await network;
  return res || Response.error();
}

/* ── Гараар удирдах мессеж ──────────────────────────────────── */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'GET_VERSION' && event.source) {
    event.source.postMessage({ type: 'VERSION', version: APP_VERSION });
  }
});
