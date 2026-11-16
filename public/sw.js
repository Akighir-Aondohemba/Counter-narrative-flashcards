// Offline support. After the first visit the app, its cards and its font are saved on the phone,
// so it opens and searches without a connection. Pages are fetched fresh when online, so a new
// deploy shows up on the next visit; the hashed script and style files never change once built.
const CACHE = "cn-flashcards-v1";
const FONT_CACHE = "cn-flashcards-fonts-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(CORE);
      // Also save the built script and style files the page links to.
      const html = await (await cache.match("./index.html")).text();
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
      await cache.addAll(assets);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (![CACHE, FONT_CACHE].includes(key)) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: keep the first copy.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // The page itself: try the network, fall back to the saved copy when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put("./index.html", res.clone());
          return res;
        } catch {
          return (await caches.match("./index.html")) || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(cacheFirst(req, CACHE));
});

async function cacheFirst(req, name) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") (await caches.open(name)).put(req, res.clone());
  return res;
}
