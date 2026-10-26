// Home Vault — service worker
// Salva solo la "scocca" dell'app per aprirla veloce. I dati non vengono mai salvati qui.
const CACHE = 'homevault-v6';
const FILE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Solo file della stessa origine e solo GET: le chiamate al server passano sempre dalla rete.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Prima la rete (così vedi subito gli aggiornamenti), copia locale se sei offline.
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
