// Retira los workers de caché persistente instalados en versiones anteriores.
// La aplicación usa la caché de memoria del navegador durante la sesión actual.
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('fatisa-static-')).map((key) => caches.delete(key)));
    await self.registration.unregister();
  })());
});
