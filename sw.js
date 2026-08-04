/* منصة الأصول والمنشآت المائية — عامل الخدمة
   القشرة (index.html): الشبكة أولًا بمهلة قصيرة ثم الكاش — يضمن وصول أى تحديث فورًا
   ولا يعطّل الفتح دون اتصال. البيانات والأيقونات: الكاش أولًا مع تحديث صامت.
   أى تعديل فى index.html يستوجب رفع VERSION. */

const VERSION = "2.0";
const CACHE = "irrigation-assets-" + VERSION;
const ROOT = new URL("./", self.registration.scope);
const SHELL = new URL("./index.html", ROOT).href;
const SHELL_TIMEOUT = 2500;
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./pwa-icon.svg",
  "./sector.json.gz?v=2"
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

function store(request, response) {
  if (response && response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

/* القشرة: أول ما يرد من الشبكة يُقدَّم ويُحدَّث الكاش؛ وإن تأخرت أو انقطعت يُقدَّم الكاش */
function shellResponse() {
  return new Promise((resolve) => {
    let settled = false;
    const fromCache = () => caches.match(SHELL).then((cached) => {
      if (settled) return;
      if (cached) {
        settled = true;
        resolve(cached);
      }
    });
    const timer = setTimeout(fromCache, SHELL_TIMEOUT);
    fetch(new Request(SHELL, { cache: "reload" }))
      .then((response) => {
        if (response && response.ok) {
          store(new Request(SHELL), response);
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(response);
          }
          return;
        }
        return caches.match(SHELL).then((cached) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(cached || response || Response.error());
        });
      })
      .catch(() => caches.match(SHELL).then((cached) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(cached || Response.error());
      }));
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(shellResponse());
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        fetch(request).then((response) => store(request, response)).catch(() => undefined);
        return cached;
      }
      return fetch(request)
        .then((response) => store(request, response))
        .catch(() => Response.error());
    })
  );
});
