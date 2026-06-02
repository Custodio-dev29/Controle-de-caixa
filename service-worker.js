const CACHE_NAME = "gestao-inteligente-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url, self.location.href);

  // Não tentar cachear métodos não-GET
  if (req.method !== "GET") {
    return event.respondWith(fetch(req));
  }

  // Não cachear rotas de API, mantenha essas requisições network-only
  if (url.origin === self.location.origin && url.pathname.startsWith("/api")) {
    return event.respondWith(
      fetch(req).catch(() =>
        new Response(JSON.stringify({ error: "Off-line ou API indisponível" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
  }

  // Navegação deve tentar rede antes de voltar ao cache index.html
  if (req.mode === "navigate") {
    return event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok) {
            return response;
          }
          return caches.match("/index.html");
        })
        .catch(() => caches.match("/index.html"))
    );
  }

  // Para ativos estáticos, use cache-first e atualize o cache em segundo plano
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(req)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          return response;
        })
        .catch(() => {
          if (req.destination === "document") {
            return caches.match("/index.html");
          }
          return new Response("", { status: 404 });
        });
    })
  );
});
