import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Scramjet runs client-side via a service worker. To keep every request
// same-origin (which avoids cross-origin-isolation / CORP headaches with
// COEP: require-corp) we proxy all of Scramjet's runtime + transport paths
// to the configured backend during development.
//
// A SINGLE environment variable — VITE_SCRAMJET_URL — points at the
// self-hosted Scramjet backend (default: http://localhost:1337).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = (env.VITE_SCRAMJET_URL || "http://localhost:1337").replace(
    /\/$/,
    ""
  );

  // Paths served by the Scramjet backend that the browser UI relies on.
  const proxied = ["/scram", "/baremux", "/epoxy", "/libcurl", "/baremod", "/bare"];

  const proxy: Record<string, any> = {
    // Wisp transport is a WebSocket upgrade.
    "/wisp": { target: backend, changeOrigin: true, ws: true },
  };
  for (const path of proxied) {
    proxy[path] = { target: backend, changeOrigin: true, ws: true };
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      // Cross-origin isolation is required by Scramjet's epoxy transport.
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
      proxy,
    },
    preview: {
      port: 3000,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
      proxy,
    },
  };
});
