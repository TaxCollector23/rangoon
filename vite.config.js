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
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    var backend = (env.VITE_SCRAMJET_URL || "http://localhost:1337").replace(/\/$/, "");
    // Paths served by the Scramjet backend that the browser UI relies on.
    var proxied = ["/scram", "/baremux", "/epoxy", "/libcurl", "/baremod", "/bare"];
    var proxy = {
        // Wisp transport is a WebSocket upgrade.
        "/wisp": { target: backend, changeOrigin: true, ws: true },
    };
    for (var _i = 0, proxied_1 = proxied; _i < proxied_1.length; _i++) {
        var path = proxied_1[_i];
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
            proxy: proxy,
        },
        preview: {
            port: 3000,
            headers: {
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Embedder-Policy": "require-corp",
            },
            proxy: proxy,
        },
    };
});
