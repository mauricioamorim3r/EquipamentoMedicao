// Enhanced Service Worker for PWA support
const VERSION = 'v20251007-297981';
const CACHE_NAME = `sgm-equipamento-medicao-${VERSION}`;
const STATIC_CACHE = `sgm-static-${VERSION}`;
const DYNAMIC_CACHE = `sgm-dynamic-${VERSION}`;
const API_CACHE = `sgm-api-${VERSION}`;

// Resources to cache on install
const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// API endpoints to cache
const apiEndpoints = [
  '/api/dashboard/stats',
  '/api/equipamentos',
  '/api/calibracoes/stats',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(staticAssets).catch((error) => {
          console.error('SW: Failed to cache static assets:', error);
        });
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE)
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos que não correspondem à versão atual
          if (cacheName.startsWith('sgm-') && !cacheName.includes(VERSION)) {
            console.log('SW: Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Cache cleanup completed');
      return self.clients.claim();
    })
  );
});

// Fetch strategy - Network First for API, Cache First for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests - Network First
  if (request.url.includes('/api/')) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE)
    );
    return;
  }

  // Handle static assets - Cache First
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(
      cacheFirstStrategy(request, STATIC_CACHE)
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    networkFirstStrategy(request, DYNAMIC_CACHE)
  );
});

// Network First Strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Both cache and network failed:', error);
    throw error;
  }
}

// Background sync for future implementations
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implement background sync logic here
      Promise.resolve()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do SGM',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SGM - Sistema de Gestão Metrológica', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});