/* Cubo de Rubik 3D — trabajador de la app instalada.
   Siempre pide a internet la versión más reciente (así la app se actualiza sola) y guarda una copia
   para poder abrirla sin conexión. Las librerías externas (three.js y las letras) se guardan la primera vez. */
const C = 'cubo-3d';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png'])).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== C) await caches.delete(k);
    await self.clients.claim();
  })());
});
const keep = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then(c => c.put(req, cp)).catch(() => {}); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    const key = r.mode === 'navigate' ? './' : r;
    e.respondWith(
      fetch(r.url, {cache: 'no-cache', credentials: 'same-origin'})
        .then(res => keep(key, res))
        .catch(() => caches.match(key, {ignoreSearch: true}).then(m => m || caches.match('./')).then(m => m || Response.error()))
    );
  } else if (/(^|\.)cdnjs\.cloudflare\.com$|(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => keep(r, res))));
  }
});
