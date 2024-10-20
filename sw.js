const CACHE_NAME = "js-calculator-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./imgs/favicon.png"
];

// Install event - caching app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((oldCache) => {
          if (oldCache !== CACHE_NAME) {
            return caches.delete(oldCache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first for static assets, network-first for JSON
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // JSON requests are handled with network-first strategy
  if (request.headers.get('accept').includes('application/json')) {
    event.respondWith(networkFirst(request));
  } else {
    // All other requests are handled with cache-first strategy
    event.respondWith(cacheFirst(request));
  }
});

// Cache-first strategy - fallback to network if cache is unavailable
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  return cachedResponse || networkFirst(request);
}

// Network-first strategy - fallback to cache if network fails
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    // Clone and store the response in cache
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Return cached response if network fails
    return await cache.match(request);
  }
}