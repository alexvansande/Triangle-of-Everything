// Service worker: makes repeat visits instant and the map usable offline —
// the "native map app" feel. GitHub Pages caps HTTP caching at 10 minutes,
// so this is the only real caching lever there.
//
// Strategy:
//  - navigations: network-first (fresh HTML when online), cache fallback
//  - /assets/* (content-hashed, immutable) and /fonts/*: cache-first
//  - tiles and other images: stale-while-revalidate
// Bump VERSION to invalidate everything after a breaking change.
const VERSION = "v1";
const CACHE = `triangle-${VERSION}`;
const PRECACHE = ["/", "/tiles/meta.json", "/tiles/z0/tile_0_0.webp", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  // Deliberately NO clients.claim(): the first visit runs entirely SW-free
  // (interception + cache writes measurably slowed first load on throttled
  // phones); the SW takes over from the next navigation on.
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Navigations: network-first so deploys show up immediately
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Hashed build assets and fonts never change: cache-first
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  // Tiles, icons, photos, data: stale-while-revalidate
  if (url.pathname.startsWith("/tiles/") || /\.(webp|png|jpe?g|json|md)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const refresh = fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => hit);
        return hit || refresh;
      })
    );
  }
});
