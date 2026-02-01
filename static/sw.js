// Service Worker for MetronLab PWA
const CACHE_NAME = 'metronlab-v1';
const STATIC_CACHE = 'metronlab-static-v1';
const DYNAMIC_CACHE = 'metronlab-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
	'/',
	'/dashboard',
	'/practice',
	'/favicon.svg',
	'/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') {
		return;
	}

	// Skip API requests (always use network)
	if (url.pathname.startsWith('/api/')) {
		return;
	}

	// Skip external resources
	if (url.origin !== location.origin) {
		return;
	}

	event.respondWith(
		caches.match(request).then((cachedResponse) => {
			// Return cached version if available
			if (cachedResponse) {
				return cachedResponse;
			}

			// Fetch from network
			return fetch(request)
				.then((response) => {
					// Don't cache non-successful responses
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}

					// Clone the response
					const responseToCache = response.clone();

					// Cache dynamic content
					caches.open(DYNAMIC_CACHE).then((cache) => {
						cache.put(request, responseToCache);
					});

					return response;
				})
				.catch(() => {
					// If offline and page request, return offline page
					if (request.headers.get('accept')?.includes('text/html')) {
						return caches.match('/');
					}
				});
		})
	);
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-practice-session') {
		event.waitUntil(syncPracticeSession());
	}
});

async function syncPracticeSession() {
	// Future: Sync practice sessions when back online
	console.log('Syncing practice sessions...');
}
