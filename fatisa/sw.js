const CACHE_NAME = 'fatisa-static-v4';
const CACHEABLE_DESTINATIONS = new Set(['font', 'image', 'script', 'style']);

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('fatisa-static-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

const isOwnResource = (request, url) => url.origin === self.location.origin && (
  request.mode === 'navigate' ||
  CACHEABLE_DESTINATIONS.has(request.destination) ||
  url.pathname.endsWith('.html') ||
  url.pathname.includes('/assets/')
);

const isShellResource = (request, url) => (
  request.mode === 'navigate' ||
  url.pathname.endsWith('.html') ||
  request.destination === 'script' ||
  request.destination === 'style'
);

const changed = async (cached, fresh) => {
  if (!cached) return false;
  const cachedTag = cached.headers.get('etag') || cached.headers.get('last-modified');
  const freshTag = fresh.headers.get('etag') || fresh.headers.get('last-modified');
  if (cachedTag && freshTag) return cachedTag !== freshTag;

  const type = fresh.headers.get('content-type') || '';
  if (!/text\/|javascript|json|xml/.test(type)) return false;
  const [previousBody, freshBody] = await Promise.all([cached.clone().text(), fresh.clone().text()]);
  return previousBody !== freshBody;
};

const notifyClients = async (url) => {
  const clients = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
  clients.forEach((client) => client.postMessage({ type:'fatisa-shell-updated', url }));
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isOwnResource(request, url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const revalidate = fetch(new Request(request, { cache:'no-cache' })).then(async (response) => {
      if (!response.ok) return response;
      const hasChanged = await changed(cached, response);
      await cache.put(request, response.clone());
      if (hasChanged && isShellResource(request, url)) await notifyClients(url.href);
      return response;
    });

    if (cached) {
      event.waitUntil(revalidate.catch(() => {}));
      return cached;
    }

    try {
      return await revalidate;
    } catch (_) {
      return new Response('', { status:503, statusText:'Offline' });
    }
  })());
});
