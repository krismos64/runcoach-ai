// Service Worker pour RunCoach AI
const CACHE_NAME = 'runcoach-ai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Ignorer les requêtes non-http/https
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si elle existe
        if (response) {
          return response;
        }

        // Sinon, faire la requête réseau
        return fetch(event.request).then((response) => {
          // Ne pas mettre en cache les réponses non valides
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Ne pas mettre en cache les requêtes API
          if (event.request.url.includes('/api/') || event.request.url.includes('localhost:8000')) {
            return response;
          }

          // Cloner la réponse
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Seulement mettre en cache les requêtes http/https
              if (event.request.url.startsWith('http')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch((error) => {
        console.error('Erreur fetch:', error);
        // Retourner une page offline si disponible
        return caches.match('/offline.html');
      })
  );
});