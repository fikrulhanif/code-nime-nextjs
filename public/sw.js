// CodeNime Advanced PWA Service Worker (v2)
const CACHE_NAME = 'codenime-v2';
const API_CACHE = 'codenime-api-v1';
const IMAGE_CACHE = 'codenime-images-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - CodeNime</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0b0217;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 40px 24px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
    }
    .icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.45);
    }
    .icon svg {
      width: 36px;
      height: 36px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 10px; color: #ffffff; }
    p { color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
    .btn {
      background: #7c3aed;
      color: #ffffff;
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
      transition: background 0.2s, transform 0.1s;
    }
    .btn:active { transform: scale(0.97); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </svg>
    </div>
    <h1>Kamu Sedang Offline</h1>
    <p>Halaman ini belum tersimpan di memori offline. Aktifkan koneksi internet lalu coba lagi.</p>
    <button class="btn" onclick="window.location.reload()">Coba Muat Ulang</button>
  </div>
</body>
</html>`;

// Simple fast string hashing for GraphQL query caching
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// 1. INSTALL: Precache assets with resilient Promise.allSettled
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && response.status === 200) {
              await cache.put(url, response);
            }
          } catch (e) {
            console.warn('[SW] Could not precache:', url);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const allowedCaches = [CACHE_NAME, API_CACHE, IMAGE_CACHE];
      return Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH: Smart routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. AniList GraphQL API (POST Requests) Caching
  if (url.hostname === 'graphql.anilist.co' && request.method === 'POST') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        let cacheKey;
        try {
          const bodyText = await request.clone().text();
          const hash = hashString(bodyText);
          cacheKey = new Request(`https://graphql.anilist.co/__cache__/${hash}`, { method: 'GET' });
        } catch (e) {
          return fetch(request);
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(cacheKey, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Offline fallback for GraphQL
          const cached = await cache.match(cacheKey);
          if (cached) {
            return cached;
          }
          return new Response(
            JSON.stringify({
              errors: [{ message: 'Perangkat offline dan data ini belum ada di cache.' }],
              data: null
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
    return;
  }

  // Ignore any other non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // B. HTML Navigation (Pages: /, /popular, /anime/[id], /watchlist, etc.)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request.url, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Offline handling:
          const cache = await caches.open(CACHE_NAME);

          // 1. Try to return exact cached page
          const cachedPage = await cache.match(request.url, { ignoreSearch: true });
          if (cachedPage) {
            return cachedPage;
          }

          // 2. Try offline.html from cache
          const cachedOffline = await cache.match(OFFLINE_URL);
          if (cachedOffline) {
            return cachedOffline;
          }

          // 3. Guaranteed inline fallback HTML with status 200 (prevents Chrome dino error)
          return new Response(FALLBACK_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
      })()
    );
    return;
  }

  // C. AniList Poster / Cover Images (s4.anilist.co, etc.)
  if (url.hostname.includes('anilist.co') && (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpeg') || url.pathname.endsWith('.webp'))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE);
        const cachedImage = await cache.match(request);
        if (cachedImage) {
          return cachedImage;
        }

        try {
          const networkImage = await fetch(request);
          if (networkImage && networkImage.status === 200) {
            cache.put(request, networkImage.clone());
          }
          return networkImage;
        } catch (e) {
          return new Response('', { status: 408 });
        }
      })()
    );
    return;
  }

  // D. Static Assets (_next/static, fonts, local icons, CSS, JS)
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2');

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // E. Next.js internal RSC and data fetch requests
  if (url.pathname.startsWith('/_next/data/') || request.headers.get('RSC') === '1') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response('null', { headers: { 'Content-Type': 'application/json' } });
        })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
