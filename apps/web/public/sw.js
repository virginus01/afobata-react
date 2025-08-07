// Service Worker with custom caching strategies and error handling
const VERSION = 30;
const CACHE_NAME = "app-cache-v" + VERSION;
const OFFLINE_URL = "/images/static/offline.html";

// Critical assets that must be cached
const CRITICAL_ASSETS = [
  "/",
  OFFLINE_URL,
];


let ENV = {
  environment: 'production', // default fallback
};

const NONE_VIEW = [
  'dashboard',
  '.js',
  '.png',
  '.jpeg',
  '.jpg',
  '.gif',
  '.webp',
  '.svg',
  '.css',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.ico',
  '.pdf',
  '.zip',
  '.json',
  '.xml',
  '.txt'
];

// Optional assets - these might not exist yet
const OPTIONAL_ASSETS = ["/manifest.webmanifest"];


self.addEventListener('message', (event) => {
  if (event.data?.type === 'ENV') {
    ENV = event.data.payload || ENV;
    // console.info('[SW] ENV received:', ENV);
  }
});

// Helper function to cache assets with error handling
async function cacheAssets(cache, assets, critical = false) {
  const results = await Promise.allSettled(
    assets.map((asset) =>
      fetch(asset).then((response) => {
        if (response.ok) {
          return cache.put(asset, response);
        } else if (critical) {
          throw new Error(`Critical asset failed to load: ${asset}`);
        }
        console.warn(`Optional asset not available: ${asset}`);
        return Promise.resolve();
      })
    )
  );

  if (critical) {
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      console.error("Critical assets failed to cache:", failures);
      throw new Error("Failed to cache critical assets");
    }
  }

  const successful = results.filter((r) => r.status === "fulfilled").length;
  console.info(`Successfully cached ${successful}/${assets.length} assets`);
}

// Install event: Pre-cache important assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cacheAssets(cache, CRITICAL_ASSETS, false);
        await cacheAssets(cache, OPTIONAL_ASSETS, false);
        console.info("Service worker installed successfully");
      } catch (error) {
        console.error("Service worker installation failed:", error);
      }
    })()
  );
  self.skipWaiting(); // Activate SW immediately
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
        console.info("Old caches cleaned up");
      } catch (error) {
        console.error("Cache cleanup failed:", error);
      }
    })()
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || ENV.environment === 'development') return;



  const url = new URL(event.request.url);
  const isApi = url.pathname.startsWith("/api/");
  const isImageApi = url.pathname.startsWith("/api/images/");
  const isDashboard = url.pathname.includes("/dashboard/");
  const isAuth = url.pathname.includes("/login") || url.pathname.includes("/signup");

  // NETWORK-FIRST for API requests except image APIs
  if (isApi && !isImageApi) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            // Clone the response BEFORE reading it
            const clonedForCache = networkResponse.clone();
            const clonedForValidation = networkResponse.clone();

            // Validate the response and cache if valid
            clonedForValidation
              .json()
              .then((data) => {
                if (data?.status === true || data?.success === true) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clonedForCache);
                  });
                }
              })
              .catch(() => { });

            return networkResponse;
          }
          return caches.match(event.request);
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return new Response(
              JSON.stringify({
                status: false,
                statusCode: 500,
                msg: "server error",
                data: {},
              }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // CACHE-FIRST for all other requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 🟢 Return cached version immediately

        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                return caches.open(CACHE_NAME).then((cache) =>
                  cache.put(event.request, networkResponse.clone())
                );
              }
            })
            .catch(() => {
              // Silent background update failure
            })
        );


        return cachedResponse;
      }

      // ❌ Not cached — handle fetch
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          // Return response regardless of status (including 404)
          return networkResponse;
        })
        .catch(() => {
          // Only show offline page on network error, not on 404
          return caches.match(OFFLINE_URL);
        });
    })
  );
});