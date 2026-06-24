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

## Requirements

You need a running Scramjet backend (the self-hosted Scramjet server that serves
`/scram`, `/baremux`, `/epoxy`, and the `/wisp` transport). The default Scramjet
dev server listens on `http://localhost:1337`.

## Configuration

A single environment variable points the UI at your backend:

```bash
cp .env.example .env
# edit .env:
VITE_SCRAMJET_URL=http://localhost:1337
```

During development, Vite proxies all Scramjet runtime and transport paths to this
URL so that everything is served same-origin (required for the service worker and
cross-origin isolation).

## Running

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> Make sure your Scramjet backend (`VITE_SCRAMJET_URL`) is running first.

## Production build

```bash
npm run build
npm run preview
```

For production you must serve the app with the same Scramjet paths reachable
same-origin (e.g. behind a reverse proxy that forwards `/scram`, `/baremux`,
`/epoxy`, `/baremod`, `/bare`, and `/wisp` to your Scramjet backend) and send the
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers.

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
