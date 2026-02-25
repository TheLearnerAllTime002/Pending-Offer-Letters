const CACHE_NAME = "ece-directory-v1";
const urlsToCache = ["./", "./index.html", "./manifest.json"];

// Install Service Worker and cache essential files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
    );
});

// Intercept requests (Stale-while-revalidate for Google Sheets)
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Fetch fresh data from network
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Update the cache with the new fresh Google Sheet data
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse.clone();
                })
                .catch(() => {
                    // If offline, return the last saved Google Sheet data
                    return cachedResponse;
                });

            // Return cached immediately if available, while fetching in background
            return cachedResponse || fetchPromise;
        }),
    );
});
