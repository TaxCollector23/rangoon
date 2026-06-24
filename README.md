# Scramjet Browser

A minimal, modern, dark-theme browser homepage powered by the
[Scramjet](https://github.com/MercuryWorkshop/scramjet) proxy engine. Built with
React, TypeScript, and Tailwind CSS.

Distraction-free by design: a centered search bar, tabs, and navigation —
nothing else. No news feeds, widgets, bookmarks, sidebars, or accounts.

## Features

- **Homepage** — full-screen dark background with one large centered search bar.
  Accepts both URLs (navigated directly) and search queries (sent to Google).
- **Tabs** — new tab, close tab, active-tab highlighting, multiple sites open at
  once. State is held entirely in memory.
- **Navigation** — back, forward, refresh, and home buttons, plus a combined
  address/search bar in the top navigation area.
- **In-app rendering** — every site is rendered through Scramjet inside the
  content area. The app shell never redirects away.
- **Responsive** — works on desktop and mobile.

## How it works

There is **no separate backend to run**. The Scramjet engine, bare-mux, and the
epoxy transport are pulled from npm and copied into `public/` at build time
(`scripts/copy-scramjet-assets.mjs`), so they are served **same-origin** by the
app itself. This is what makes the service worker and cross-origin isolation
work without a reverse proxy.

The only remote dependency is the **wisp server**, which performs the actual
network egress over a WebSocket. It defaults to the public `wss://anura.pro/`
server (the same one the official Scramjet demo uses).

## Configuration

A single environment variable selects the wisp server:

```bash
cp .env.example .env
# .env:
VITE_WISP_URL=wss://anura.pro/
```

Point it at your own wisp server if you'd rather not rely on the public one.

## Running

```bash
npm install   # also copies the engine assets into public/
npm run dev
```

Then open http://localhost:3000. No backend needed.

## Production build / deploy

```bash
npm run build
npm run preview
```

The app is a static site. The only server requirement is that it send the
cross-origin isolation headers — already configured for Vercel in
[`vercel.json`](./vercel.json):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

> **Version note:** Scramjet v1.1.0 must be paired with `bare-mux@2.1.7` and
> `epoxy-transport@2.1.28`. epoxy v3 changed its request interface and throws
> `headers is not iterable` with this Scramjet version, so these are pinned.

## Project structure

```
src/
  components/
    Homepage.tsx    Centered search bar (URL or Google search)
    TabBar.tsx      Tab strip + new/close/active highlighting
    Toolbar.tsx     Back/forward/refresh/home + address bar
    WebView.tsx     Persistent Scramjet-proxied iframes
    icons.tsx       Inline SVG icons
  hooks/
    useBrowser.ts   In-memory tab + per-tab history state
  lib/
    scramjet.ts     Scramjet controller / service-worker bootstrap
    url.ts          URL-vs-search resolution and tab titles
  App.tsx           Shell layout wiring it all together
public/
  sw.js             Scramjet service worker
```
