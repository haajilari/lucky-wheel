// public/sw.js
const CACHE_NAME = "lucky-wheel-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg", // Example asset, adjust based on your actual assets
  // Add paths to your JS and CSS bundles once you know them from the build output
  // For Vite, these names are usually hashed, so we'll use a more dynamic approach later or cache on fetch
  // For now, we'll keep it simple and focus on the core PWA files.
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  // Perform install steps
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error("Failed to open cache or add URLs:", err);
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Only cache GET requests
          if (event.request.method === "GET") {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
