const CACHE_NAME = 'spaceia-casetas-pwa';

const RECURSOS = [
  './manifest.webmanifest',
  './favicon.png',
  './apple-touch-icon.png',
  './images/spaceai-icon.png'
];

self.addEventListener('install', (event) => {

  console.log('Service Worker: instalando');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {

        const respuesta = await fetch('./');

        const html = await respuesta.text();

        const respuestaLimpia = new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html'
          }
        });

        await cache.put('./', respuestaLimpia);

        await cache.addAll(RECURSOS);
      })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {

  console.log('Service Worker: activado');

  event.waitUntil(
    caches.keys().then((nombres) => {

      return Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      );

    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {

    event.respondWith(
      fetch(event.request)
        .catch(async () => {

          const cache = await caches.open(CACHE_NAME);

          return cache.match('./');

        })
    );

    return;
  }

  if (event.request.url.includes('/api/')) {

    event.respondWith(
      fetch(event.request)
        .then((respuesta) => {

          const copia = respuesta.clone();

          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));

          return respuesta;

        })
        .catch(() => caches.match(event.request))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((respuesta) => {

        if (respuesta) return respuesta;

        return fetch(event.request).then((red) => {

          if (red.ok && new URL(event.request.url).origin === self.location.origin) {
            const copia = red.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          }

          return red;

        });

      })
  );

});
