/**
 * SmartVenue Service Worker
 * @fileoverview Progressive Web App caching and offline functionality
 * @version 2.0
 */

const CACHE_NAME = 'smartvenue-v2.0';
const STATIC_CACHE = 'smartvenue-static-v2.0';
const DYNAMIC_CACHE = 'smartvenue-dynamic-v2.0';

// Files to cache immediately
const STATIC_FILES = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './analytics.js',
    './config.js',
    './tests.js',
    './simulation-worker.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch((error) => {
                console.error('[SW] Error caching static files:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const localStaticFiles = STATIC_FILES
        .filter((file) => !file.startsWith('http'))
        .map((file) => file.replace(/^\.\//, '/'));
    const isStaticRequest = STATIC_FILES.includes(request.url) ||
        localStaticFiles.some((file) => url.pathname === file || url.pathname.endsWith(file));

    // Skip non-GET requests and external domains
    if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
        return;
    }

    // Cache-first strategy for static files
    if (isStaticRequest) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request).then((fetchResponse) => {
                        return caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, fetchResponse.clone());
                            return fetchResponse;
                        });
                    });
                })
        );
    } else {
        // Network-first strategy for dynamic content
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request);
                })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('[SW] Performing background sync');
    // Implement offline queue processing here
}
