/**
 * AG&P Attendance System - Service Worker
 * Provides offline functionality and caching for PWA
 */

const CACHE_NAME = 'agp-attendance-v1.0.0';
const STATIC_CACHE_NAME = 'agp-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'agp-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/login.html',
    '/src/styles/variables.css',
    '/src/styles/base.css',
    '/src/styles/components.css',
    '/src/styles/responsive.css',
    '/intern-management-dashboard.css',
    '/src/app.js',
    '/app-browser.js',
    '/users-database.js',
    '/role-management.js',
    '/intern-dashboard-simple.js',
    '/manifest.json',
    // Add FontAwesome and other external resources
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
    
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients
    self.clients.claim();
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Fetch failed, serving offline page', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Return empty response for other requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'attendance-sync') {
        event.waitUntil(syncAttendanceData());
    } else if (event.tag === 'activity-sync') {
        event.waitUntil(syncActivityData());
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification from AG&P Attendance',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/assets/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('AG&P Attendance', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Sync functions
async function syncAttendanceData() {
    try {
        // Get offline attendance data
        const offlineData = await getOfflineAttendanceData();
        
        if (offlineData.length > 0) {
            // Send to server when online
            await sendAttendanceToServer(offlineData);
            
            // Clear offline data after successful sync
            await clearOfflineAttendanceData();
            
            console.log('Service Worker: Attendance data synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: Failed to sync attendance data', error);
    }
}

async function syncActivityData() {
    try {
        // Get offline activity data
        const offlineData = await getOfflineActivityData();
        
        if (offlineData.length > 0) {
            // Send to server when online
            await sendActivityToServer(offlineData);
            
            // Clear offline data after successful sync
            await clearOfflineActivityData();
            
            console.log('Service Worker: Activity data synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: Failed to sync activity data', error);
    }
}

// Helper functions for offline data management
async function getOfflineAttendanceData() {
    // Implementation would get data from IndexedDB or localStorage
    return [];
}

async function getOfflineActivityData() {
    // Implementation would get data from IndexedDB or localStorage
    return [];
}

async function sendAttendanceToServer(data) {
    // Implementation would send data to server API
    console.log('Sending attendance data to server:', data);
}

async function sendActivityToServer(data) {
    // Implementation would send data to server API
    console.log('Sending activity data to server:', data);
}

async function clearOfflineAttendanceData() {
    // Implementation would clear offline data
    console.log('Clearing offline attendance data');
}

async function clearOfflineActivityData() {
    // Implementation would clear offline activity data
    console.log('Clearing offline activity data');
}
