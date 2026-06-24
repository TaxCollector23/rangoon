/* Thin wrapper around the Scramjet client runtime.
 *
 * The runtime globals ($scramjetLoadController, BareMux) are loaded from the
 * backend in index.html. Everything here is same-origin: the service worker,
 * the runtime assets, and the wisp transport are all reached through Vite's
 * proxy, which forwards to VITE_SCRAMJET_URL. */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    $scramjetLoadController: () => { ScramjetController: any };
    BareMux: { BareMuxConnection: new (worker: string) => any };
  }
}

let controller: any = null;
let readyPromise: Promise<void> | null = null;

/** Initialise the Scramjet controller, register the service worker, and wire
 *  up the wisp transport. Idempotent — safe to await repeatedly. */
export function initScramjet(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (!window.$scramjetLoadController) {
      throw new Error(
        "Scramjet runtime not found. Is the backend (VITE_SCRAMJET_URL) running?"
      );
    }

    const { ScramjetController } = window.$scramjetLoadController();
    controller = new ScramjetController({
      files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
      },
      flags: { cleanErrors: true },
    });

    await controller.init();
    await navigator.serviceWorker.register("/sw.js");

    const connection = new window.BareMux.BareMuxConnection("/baremux/worker.js");
    const wisp =
      (location.protocol === "https:" ? "wss" : "ws") +
      "://" +
      location.host +
      "/wisp/";
    await connection.setTransport("/epoxy/index.mjs", [{ wisp }]);
  })();

  return readyPromise;
}

/** Encode a real URL into a same-origin proxied URL for an <iframe src>. */
export function encodeUrl(url: string): string {
  if (!controller) throw new Error("Scramjet not initialised");
  return controller.encodeUrl(url);
}

/** Decode a proxied URL back into the real URL it represents. */
export function decodeUrl(url: string): string {
  if (!controller) return url;
  try {
    return controller.decodeUrl(url);
  } catch {
    return url;
  }
}
