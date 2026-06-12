// ─────────────────────────────────────────────────────────────────────────────
// OneSignal — must be first so push/notificationclick handlers register early
// ─────────────────────────────────────────────────────────────────────────────
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (_) {
  // CDN unreachable: push notifications unavailable, caching still works
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache names — bump CACHE_VER to invalidate everything
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_VER    = 'v5';
const STATIC_CACHE = `mommenu-static-${CACHE_VER}`;
const PAGE_CACHE   = `mommenu-pages-${CACHE_VER}`;
const IMG_CACHE    = `mommenu-img-${CACHE_VER}`;
const ALL_CACHES   = [STATIC_CACHE, PAGE_CACHE, IMG_CACHE];

// Pages to warm-cache during install
const PRECACHE_PAGES = ['/', '/blog', '/how-it-works'];

// ─────────────────────────────────────────────────────────────────────────────
// Install — skip waiting so new SW takes over immediately
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) =>
      Promise.allSettled(
        PRECACHE_PAGES.map((url) =>
          cache.add(new Request(url, { credentials: 'same-origin' }))
        )
      )
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Activate — delete stale caches, claim all clients
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Fetch — routing strategies
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET
  if (request.method !== 'GET') return;

  // Only intercept same-origin + trusted image CDNs
  const sameOrigin = url.origin === self.location.origin;
  const trustedCDN =
    url.hostname.endsWith('unsplash.com') ||
    url.hostname.endsWith('cloudinary.com');
  if (!sameOrigin && !trustedCDN) return;

  // Skip: API routes (always fresh)
  if (url.pathname.startsWith('/api/')) return;
  // Skip: Next.js build internals
  if (url.pathname.startsWith('/_next/data/')) return;
  if (url.pathname.includes('/_next/webpack-hmr')) return;
  // Skip: admin panel (always needs live data)
  if (url.pathname.startsWith('/admin')) return;

  // /_next/static/** — content-hashed, cache forever
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // /_next/image — optimised images, cache-first
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // Static image files from /public
  if (/\.(jpe?g|png|gif|webp|svg|ico|avif)(\?.*)?$/.test(url.pathname) || request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // Fonts / scripts / stylesheets — cache-first
  if (request.destination === 'font' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Page navigations — network-first, fall back to cache then offline shell
  event.respondWith(networkFirst(request, PAGE_CACHE));
});

// ─────────────────────────────────────────────────────────────────────────────
// Strategy helpers
// ─────────────────────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(null, { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const shell = await caches.match('/');
    return (
      shell ||
      new Response(
        `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MomMenu — ოფლაინი</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #F5F1E8; color: #465940; text-align: center; }
    h1 { font-size: 2rem; } p { opacity: .7; } button {
      margin-top: 1.5rem; padding: .75rem 2rem; background: #465940; color: #FDFBF0;
      border: none; border-radius: 999px; font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <div>
    <h1>🌐 ოფლაინი</h1>
    <p>MomMenu ვერ დაუკავშირდა ინტერნეტს.<br>გთხოვ, კავშირი შეამოწმე.</p>
    <button onclick="location.reload()">ხელახლა ცდა</button>
  </div>
</body>
</html>`,
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    );
  }
}
