/* منصة الأصول والمنشآت المائية — عامل الخدمة
   استراتيجية: كاش-أولاً للقشرة والبيانات (التطبيق يفتح فورًا وبدون إنترنت)،
   مع تحديث صامت فى الخلفية. أى تعديل فى index.html يستوجب رفع VERSION. */

const VERSION = "1.0";
const CACHE = "irrigation-assets-" + VERSION;
const ROOT = new URL("./", self.registration.scope);
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./pwa-icon.svg",
  "./data/sector.json.gz?v=1"
].map((path) => new URL(path, ROOT).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("irrigation-assets-") && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function refresh(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => undefined);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // التنقل: الكاش أولاً حتى يفتح التطبيق فورًا وبدون شبكة
  if (request.mode === "navigate") {
    const shell = new URL("./index.html", ROOT).href;
    event.respondWith(
      caches.match(shell).then((cached) => {
        const network = refresh(new Request(shell));
        return cached || network.then((response) => response || Response.error());
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        refresh(request);
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => Response.error());
    })
  );
});
