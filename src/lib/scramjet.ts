/* ─────────────────────────────────────────────────────────────────────────
 * Scramjet engine layer.
 *
 * This is the ONLY module that talks to Scramjet internals. Everything else in
 * the app (components, hooks) is UI and goes through the small surface exported
 * here. Keeping the boundary here means Scramjet can be upgraded without
 * touching the UI layer.
 *
 * Integration points with Scramjet:
 *   - window.$scramjetLoadController()  → the controller factory (from the
 *     runtime bundle loaded in index.html, served same-origin from /scram).
 *   - controller.init()                 → boots the engine + rewriter wasm.
 *   - navigator.serviceWorker(/sw.js)   → the Scramjet service worker that
 *     intercepts and proxies requests.
 *   - BareMux + epoxy transport         → carries traffic to the wisp server.
 *   - controller.createFrame()          → official ScramjetFrame abstraction
 *     used for all website rendering and navigation.
 * ───────────────────────────────────────────────────────────────────────── */

import type {
  ScramjetController,
  ScramjetFrame,
  ScramjetInitConfig,
} from "@mercuryworkshop/scramjet";

// The runtime bundle (loaded via <script> in index.html) attaches these globals.
declare global {
  interface Window {
    $scramjetLoadController: () => {
      ScramjetController: new (config: Partial<ScramjetInitConfig>) => ScramjetController;
    };
    BareMux: {
      BareMuxConnection: new (worker: string) => {
        setTransport: (path: string, options: unknown[]) => Promise<void>;
      };
    };
  }
}

// Scramjet rewrites every proxied URL under this path prefix.
const PREFIX = "/scramjet/";

let controller: ScramjetController | null = null;
let readyPromise: Promise<void> | null = null;

/** Boot the engine, register the service worker, and wire up the transport.
 *  Idempotent — safe to await repeatedly; only runs once. */
export function initScramjet(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (typeof window.$scramjetLoadController !== "function") {
      throw new Error(
        "Scramjet runtime not found — engine assets are missing from /scram."
      );
    }

    const { ScramjetController } = window.$scramjetLoadController();
    controller = new ScramjetController({
      prefix: PREFIX,
      files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
      },
      flags: { cleanErrors: true },
    });

    await controller.init();
    await navigator.serviceWorker.register("/sw.js");

    // The wisp server performs the actual network egress. It is the only remote
    // dependency; the engine itself is bundled and served same-origin.
    const wisp = import.meta.env.VITE_WISP_URL?.trim() || "wss://anura.pro/";
    const connection = new window.BareMux.BareMuxConnection("/baremux/worker.js");
    await connection.setTransport("/epoxy/index.mjs", [{ wisp }]);
  })();

  return readyPromise;
}

/** Create a managed Scramjet frame (official ScramjetFrame abstraction).
 *  The caller owns mounting `frame.frame` into the DOM. */
export function createFrame(): ScramjetFrame {
  if (!controller) throw new Error("Scramjet not initialised");
  return controller.createFrame();
}

/** Decode a proxified URL back into the real URL it represents. */
export function decodeUrl(url: string): string {
  if (!controller) return url;
  try {
    return controller.decodeUrl(url);
  } catch {
    return url;
  }
}

/** Normalise a URL coming out of a Scramjet event to the real, user-facing URL.
 *  ScramjetFrame events may report either the real or the proxified URL. */
export function toRealUrl(url: string): string {
  if (!url) return "";
  return url.includes(PREFIX) ? decodeUrl(url) : url;
}

export type { ScramjetFrame };
