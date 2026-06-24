/* Scramjet service worker.
 *
 * Intercepts requests on this origin and routes proxied traffic through the
 * Scramjet engine. The runtime (scramjet.all.js) is served by the backend and
 * proxied to this origin, so importScripts loads it same-origin. */

// Firefox does not report crossOriginIsolated inside the SW even when the
// page is isolated; this shim keeps the engine happy. Safe for self-hosting.
if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: false,
  });
}

importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }
  return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});
