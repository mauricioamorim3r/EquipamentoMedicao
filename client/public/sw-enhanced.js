// Enhanced Service Worker for PWA support
const CACHE_NAME = 'sgm-equipamento-medicao-v2';
const STATIC_CACHE = 'sgm-static-v2';
const DYNAMIC_CACHE = 'sgm-dynamic-v2';
const API_CACHE = 'sgm-api-v2';

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
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
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

  // Handle other requests - Network First with dynamic cache
  event.respondWith(
    networkFirstStrategy(request, DYNAMIC_CACHE)
  );
});

// Network First Strategy (for API and dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
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
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SGM - Offline</title>
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                text-align: center; 
                padding: 2rem; 
                background: #f8fafc;
                color: #334155;
              }
              .container { 
                max-width: 400px; 
                margin: 0 auto; 
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .icon { font-size: 4rem; margin-bottom: 1rem; }
              h1 { color: #13103b; margin-bottom: 1rem; }
              button { 
                background: #13103b; 
                color: white; 
                border: none; 
                padding: 0.75rem 1.5rem; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 1rem;
                margin-top: 1rem;
              }
              button:hover { background: #1e1b4b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">📡</div>
              <h1>SGM está offline</h1>
              <p>Verifique sua conexão com a internet e tente novamente.</p>
              <button onclick="window.location.reload()">Tentar novamente</button>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Failed to fetch:', request.url, error);
    throw error;
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Pre-cache important API endpoints
    const cache = await caches.open(API_CACHE);
    const promises = apiEndpoints.map(endpoint => {
      return fetch(endpoint).then(response => {
        if (response.status === 200) {
          return cache.put(endpoint, response);
        }
      }).catch(error => console.log('SW: Background sync failed for:', endpoint));
    });
    
    await Promise.all(promises);
    console.log('SW: Background sync completed');
  } catch (error) {
    console.log('SW: Background sync error:', error);
  }
}