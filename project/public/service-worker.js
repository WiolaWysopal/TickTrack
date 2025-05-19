const CACHE_NAME = "ticktrack-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/main.js",
  "/index.css",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching resources:", urlsToCache);
      return cache.addAll(urlsToCache);
    }).catch((err) => {
      console.error("[Service Worker] Cache error:", err);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Fetching:", event.request.url);

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          console.warn("[Service Worker] Offline mode - serving offline.html");
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }
        })
      );
    })
  );
});
