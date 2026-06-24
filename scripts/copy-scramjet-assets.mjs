/* Copies the Scramjet engine + transport assets out of node_modules and into
 * public/ so they are served same-origin by the app. This removes any need for
 * a separate "backend" to proxy /scram, /baremux, /epoxy — the browser hosts
 * the whole engine itself, and only the wisp WebSocket egress is remote.
 *
 * Runs on postinstall, predev and prebuild (see package.json). */
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const nm = join(root, "node_modules");

const jobs = [
  // Scramjet runtime (controller, worker, wasm, sync).
  [join(nm, "@mercuryworkshop/scramjet/dist/scramjet.all.js"), "scram/scramjet.all.js"],
  [join(nm, "@mercuryworkshop/scramjet/dist/scramjet.sync.js"), "scram/scramjet.sync.js"],
  [join(nm, "@mercuryworkshop/scramjet/dist/scramjet.wasm.wasm"), "scram/scramjet.wasm.wasm"],
  // bare-mux: the global (index.js) + the worker that runs the transport.
  [join(nm, "@mercuryworkshop/bare-mux/dist/index.js"), "baremux/index.js"],
  [join(nm, "@mercuryworkshop/bare-mux/dist/worker.js"), "baremux/worker.js"],
  // epoxy transport (wasm is embedded inside this single ESM file).
  [join(nm, "@mercuryworkshop/epoxy-transport/dist/index.mjs"), "epoxy/index.mjs"],
];

for (const sub of ["scram", "baremux", "epoxy"]) {
  await rm(join(pub, sub), { recursive: true, force: true });
}

for (const [src, dest] of jobs) {
  const out = join(pub, dest);
  await mkdir(dirname(out), { recursive: true });
  await cp(src, out);
}

console.log(`[scramjet] copied ${jobs.length} engine assets into public/`);
