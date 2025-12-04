/**
 * CropMagix - Service Worker
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'cropmagix-v1';
const STATIC_CACHE = 'cropmagix-static-v1';
const DYNAMIC_CACHE = 'cropmagix-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/api.js',
    '/js/cache.js',
    '/js/i18n.js',
    '/js/tts.js',
    '/js/offline.js',
    '/js/calendar.js',
    '/js/medicine.js',
    '/js/pest.js',
    '/manifest.json'
];

// API routes to cache
const API_CACHE_ROUTES = [
    '/api/health'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Failed to cache static assets:', err);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                        .map(key => {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle API requests differently
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // For static assets, use cache-first strategy
    event.respondWith(cacheFirst(request));
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Update cache in background
            fetchAndCache(request);
            return cachedResponse;
        }
        
        return await fetchAndCache(request);
    } catch (error) {
        console.error('[SW] Cache-first failed:', error);
        return caches.match('/index.html');
    }
}

// Network-first strategy for API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful GET responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API calls
        return new Response(
            JSON.stringify({ 
                error: 'offline', 
                message: 'You are offline. This data was not cached.' 
            }),
            { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
}

// Fetch and cache helper
async function fetchAndCache(request) {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    let data = { title: 'CropMagix', body: 'New notification' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            ...data
        },
        actions: data.actions || [
            { action: 'view', title: '👁️ View' },
            { action: 'dismiss', title: '❌ Dismiss' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.postMessage({
                            type: 'NOTIFICATION_CLICK',
                            data: event.notification.data
                        });
                        return client.focus();
                    }
                }
                
                // Open new window
                return clients.openWindow(url);
            })
    );
});

// Handle background sync
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-analysis') {
        event.waitUntil(syncPendingAnalysis());
    } else if (event.tag === 'sync-sightings') {
        event.waitUntil(syncPestSightings());
    }
});

// Sync pending analysis results
async function syncPendingAnalysis() {
    try {
        const db = await openDB('CropMagixOffline', 1);
        const tx = db.transaction('pendingSync', 'readonly');
        const store = tx.objectStore('pendingSync');
        const pending = await store.getAll();
        
        for (const item of pending) {
            try {
                const response = await fetch('/api/analyze-health', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.data)
                });
                
                if (response.ok) {
                    // Remove from pending
                    const deleteTx = db.transaction('pendingSync', 'readwrite');
                    await deleteTx.objectStore('pendingSync').delete(item.id);
                }
            } catch (err) {
                console.error('[SW] Sync failed for item:', item.id, err);
            }
        }
        
        // Notify clients
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({ type: 'SYNC_COMPLETE', count: pending.length });
            });
        });
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Sync pest sightings
async function syncPestSightings() {
    // Similar to syncPendingAnalysis but for pest sightings
    console.log('[SW] Syncing pest sightings...');
}

// Simple IndexedDB helper
function openDB(name, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

// Message handler
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data.type === 'CACHE_ASSETS') {
        caches.open(DYNAMIC_CACHE).then(cache => {
            cache.addAll(event.data.assets);
        });
    }
});

console.log('[SW] Service worker loaded');
