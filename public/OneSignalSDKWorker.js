// OneSignal push notifications
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ── Caching ───────────────────────────────────────────────────────────────────
const CACHE_VER    = 'v6';
const STATIC_CACHE = `mommenu-static-${CACHE_VER}`;
const PAGE_CACHE   = `mommenu-pages-${CACHE_VER}`;
const IMG_CACHE    = `mommenu-img-${CACHE_VER}`;
const ALL_CACHES   = [STATIC_CACHE, PAGE_CACHE, IMG_CACHE];

const PRECACHE_PAGES = ['/', '/blog', '/how-it-works'];

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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin &&
      !url.hostname.endsWith('unsplash.com') &&
      !url.hostname.endsWith('cloudinary.com')) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/data/')) return;
  if (url.pathname.includes('/_next/webpack-hmr')) return;
  if (url.pathname.startsWith('/admin')) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (/\.(jpe?g|png|gif|webp|svg|ico|avif)(\?.*)?$/.test(url.pathname) || request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, PAGE_CACHE));
});

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
    return new Response(null, { status: 503 });
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
    return cached || new Response(
      '<!DOCTYPE html><html lang="ka"><body style="font-family:sans-serif;text-align:center;padding:3rem;background:#F5F1E8;color:#465940"><h1>🌐 ოფლაინი</h1><p>გთხოვ, ინტერნეტი შეამოწმე.</p><button onclick="location.reload()" style="padding:.75rem 2rem;background:#465940;color:#FDFBF0;border:none;border-radius:999px;font-size:1rem;cursor:pointer">ხელახლა</button></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
