import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// The Scramjet engine + transport assets are bundled into public/ (see
// scripts/copy-scramjet-assets.mjs) and served same-origin, so there is no
// backend to proxy. The only remote dependency is the wisp WebSocket egress,
// which the client connects to directly (configurable via VITE_WISP_URL).
//
// Cross-origin isolation headers are required by Scramjet's epoxy transport.
var isolation = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
};
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: { port: 3000, headers: isolation },
    preview: { port: 3000, headers: isolation },
});
