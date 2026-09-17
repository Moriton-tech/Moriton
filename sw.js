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

const APP_VERSION = '2026-09-17-6';

const SHELL_CACHE = 'moriton-shell-' + APP_VERSION;
/* Статик хөрөнгийн кэш — хувилбартай УЯЛДААГҮЙ.
   Учир нь app.js?v=20260917d гэх мэт URL өөрөө хувилбараа агуулдаг:
   файл өөрчлөгдвөл ?v= солигдож шинэ түлхүүр болно, өөрчлөгдөөгүй бол
   хуучин түлхүүр хүчинтэй хэвээр. Хэрэв энэ кэшийг хувилбар бүрд
   устгавал ӨӨРЧЛӨГДӨӨГҮЙ style.css (336KB), икон (492KB) дахин татагдана. */
const ASSET_CACHE = 'moriton-assets-v1';
const ASSET_MAX   = 40; // хуучин хувилбарын үлдэгдэл хуримтлагдахаас сэргийлнэ
const CDN_CACHE   = 'moriton-cdn-v1';

/* Урьдчилан татах ЗӨВХӨН хамгийн бага бүрхүүл.
   ⚠️ app.js / style.css / lab.js-ийг энд БҮҮ нэм: index.html тэднийг
   «app.js?v=...» гэж хувилбарын дугаартай дууддаг тул энд дугааргүйгээр
   татвал ЯГ ИЖИЛ файлыг ХОЁР УДАА татна (хувилбар солих бүрд ~1MB илүү).
   Тэдгээрийг хуудас өөрөө дуудахад cacheFirst нь зөв URL-аар кэшилнэ.
   512px икон мөн адил — зөвхөн суулгах үед л хэрэгтэй тул шаардлагаар татна. */
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
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
      // APP_VERSION солигдсон тул кодын кэшийг цэвэрлэнэ.
      // ⚠️ Яагаад: index.html-ийн ?v= дугаарыг солихоо мартвал хуучин
      // app.js мөнхөд кэшэнд наалдаж, олж ядам алдаа үүсгэнэ. Зураг,
      // фонт зэрэг хөрөнгө хэвээр үлдэнэ (эдгээр ховор өөрчлөгддөг).
      await purgeCodeAssets();
      await pruneAssetCache();
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

  // ── Өөрийн файлууд ──────────────────────────────────────────
  if (url.origin === self.location.origin) {
    // Навигац (хуудас нээх) → сүлжээг эхлээд, гэхдээ 3 секунд хүлээгээд
    // хариу ирэхгүй бол кэшнээс өгнө. Утсан дээр удаан сүлжээтэй үед
    // апп «нээгдэхгүй» удаан зогсдог байсныг арилгана.
    if (req.mode === 'navigate') {
      event.respondWith(networkFirst(req, event, 3000));
      return;
    }
    // Статик хөрөнгө (js / css / icon / manifest) → КЭШЭЭС ШУУД.
    // index.html нь app.js?v=... гэж хувилбарын дугаартай дууддаг тул
    // хувилбар солигдмогц URL өөрчлөгдөж, кэшнээс олдохгүй → шинээр татна.
    // Ингэснээр хуучин хувилбар «наалдаж» үлдэхгүй, харин ижил хувилбарыг
    // дахин дахин 1MB татахаа болино.
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirst(req, event));
      return;
    }
    event.respondWith(networkFirst(req, event));
    return;
  }

  // CDN статик → кэшнээс шууд өгөөд, ард нь чимээгүй шинэчилнэ
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, event));
  }
});

/* ── SW-ийг ажил дуустал унтраахгүй байлгах ─────────────────── */
function keepAlive(event, promise) {
  try { if (event && event.waitUntil) event.waitUntil(promise); } catch (e) {}
  return promise;
}

/* ── Статик хөрөнгө мөн эсэх ────────────────────────────────── */
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|webmanifest)$/i.test(pathname) ||
         pathname.endsWith('/manifest.json');
}

/* ── Стратеги: cache-first (статик хөрөнгө) ─────────────────── */
// Кэшэнд байвал СҮЛЖЭЭ ХҮЛЭЭХГҮЙ шууд өгнө. Ард нь чимээгүй шинэчилнэ.
async function purgeCodeAssets() {
  try {
    const cache = await caches.open(ASSET_CACHE);
    const keys = await cache.keys();
    await Promise.all(
      keys
        .filter((r) => /\.(js|css)$/i.test(new URL(r.url).pathname))
        .map((r) => cache.delete(r))
    );
  } catch (e) {}
}

async function pruneAssetCache() {
  try {
    const cache = await caches.open(ASSET_CACHE);
    const keys = await cache.keys();
    if (keys.length <= ASSET_MAX) return;
    // Хамгийн эртний бичлэгүүдийг хасна (keys нь оруулсан дарааллаар ирдэг)
    await Promise.all(keys.slice(0, keys.length - ASSET_MAX).map((k) => cache.delete(k)));
  } catch (e) {}
}

async function cacheFirst(req, event) {
  const cache = await caches.open(ASSET_CACHE);
  const hit = await cache.match(req); // ?v= хүртэл яг таарах ёстой
  if (hit) {
    // 🔑 URL дотор хувилбарын дугаар (?v=...) байвал тухайн хаягийн агуулга
    // ХЭЗЭЭ Ч өөрчлөгдөхгүй — код солигдвол index.html ?v=-ээ сольж
    // ӨӨР хаяг руу заана. Тиймээс ард нь дахин шалгах нь утгагүй бөгөөд
    // утсан дээр нээх бүрд ~1MB дата дэмий иддэг. Огт татахгүй.
    if (/[?&]v=/.test(new URL(req.url).search)) return hit;
    // Хувилбаргүй хаяг (ж: икон) — кэшээс шууд өгөөд ард нь чимээгүй шинэчилнэ.
    // ⚠️ waitUntil ЗААВАЛ — эс бөгөөс браузер бичиж дуусахаас нь өмнө
    // service worker-ийг унтраах тул кэш ХООСОН үлддэг.
    keepAlive(event, fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') return cache.put(req, res.clone());
    }).catch(() => {}));
    return hit;
  }
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') {
      keepAlive(event, cache.put(req, res.clone()).catch(() => {}));
    }
    return res;
  } catch (err) {
    // Сүлжээгүй: хувилбарын дугаарыг үл тооцон хайж үзнэ
    const loose = await cache.match(req, { ignoreSearch: true });
    if (loose) return loose;
    throw err;
  }
}

/* ── Стратеги: network-first ────────────────────────────────── */
// timeoutMs өгвөл тэр хугацаанд хариу ирэхгүй бол кэшнээс өгнө.
async function networkFirst(req, event, timeoutMs) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    let res = null;
    if (event && event.preloadResponse) {
      res = await event.preloadResponse;
    }
    if (!res) {
      const netP = fetch(req);
      if (timeoutMs) {
        const cached = await cache.match(req, { ignoreSearch: true });
        if (cached) {
          // Сүлжээ удаан бол кэшийг өгөөд, татаж дуусмагц кэшээ шинэчилнэ
          res = await Promise.race([
            netP,
            new Promise(resolve => setTimeout(() => resolve(null), timeoutMs))
          ]);
          if (!res) {
            keepAlive(event, netP.then(r => {
              if (r && r.ok && r.type === 'basic') return cache.put(req, r.clone());
            }).catch(() => {}));
            return cached;
          }
        } else {
          res = await netP;
        }
      } else {
        res = await netP;
      }
    }

    if (res && res.ok && res.type === 'basic') {
      keepAlive(event, cache.put(req, res.clone()).catch(() => {}));
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
