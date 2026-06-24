import { useEffect, useRef } from "react";
import type { Tab } from "../types";
import { createFrame, toRealUrl, type ScramjetFrame } from "../lib/scramjet";

interface Props {
  tabs: Tab[];
  activeId: string;
  ready: boolean;
  /** Bumped by the parent to force a reload of the active tab. */
  reloadKey: number;
  /** Fired when a frame navigates (link click, redirect, or our own go()). */
  onUrlChange: (tabId: string, realUrl: string) => void;
}

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture";

/** Renders one persistent ScramjetFrame per browsing tab. Inactive tabs stay
 *  mounted (hidden) so page state survives tab switches. All navigation happens
 *  inside these frames via the official ScramjetFrame API — the app shell never
 *  redirects. */
export default function WebView({
  tabs,
  activeId,
  ready,
  reloadKey,
  onUrlChange,
}: Props) {
  const frames = useRef<Map<string, ScramjetFrame>>(new Map());
  const containers = useRef<Map<string, HTMLDivElement>>(new Map());
  // The real URL currently loaded in each frame — avoids redundant go() calls.
  const loaded = useRef<Map<string, string>>(new Map());
  const prevReloadKey = useRef(reloadKey);

  // Create + mount a ScramjetFrame for each browsing tab, and tear down frames
  // for tabs that have closed.
  useEffect(() => {
    if (!ready) return;

    for (const tab of tabs) {
      if (!tab.url || frames.current.has(tab.id)) continue;
      const container = containers.current.get(tab.id);
      if (!container) continue;

      const sframe = createFrame();
      const el = sframe.frame;
      el.className = "h-full w-full border-0 bg-white";
      el.setAttribute("title", "Browser content");
      el.setAttribute("allow", IFRAME_ALLOW);
      container.appendChild(el);

      // Official navigation event — keeps the address bar + history in sync
      // with whatever happens inside the page.
      sframe.addEventListener("urlchange", (e) => {
        const real = toRealUrl(e.url);
        if (real && /^https?:/i.test(real)) {
          loaded.current.set(tab.id, real);
          onUrlChange(tab.id, real);
        }
      });

      frames.current.set(tab.id, sframe);
    }

    for (const id of [...frames.current.keys()]) {
      if (!tabs.some((t) => t.id === id)) {
        frames.current.delete(id);
        loaded.current.delete(id);
      }
    }
  }, [tabs, ready, onUrlChange]);

  // Drive navigation: when a tab's URL differs from what's loaded, go() to it.
  useEffect(() => {
    if (!ready) return;
    for (const tab of tabs) {
      if (!tab.url) continue;
      const sframe = frames.current.get(tab.id);
      if (!sframe) continue;
      if (loaded.current.get(tab.id) !== tab.url) {
        loaded.current.set(tab.id, tab.url);
        sframe.go(tab.url);
      }
    }
  }, [tabs, ready]);

  // Reload the active frame when the refresh button is pressed.
  useEffect(() => {
    if (prevReloadKey.current === reloadKey) return;
    prevReloadKey.current = reloadKey;
    frames.current.get(activeId)?.reload();
  }, [reloadKey, activeId]);

  const browsingTabs = tabs.filter((t) => t.url);

  return (
    <div className="relative h-full w-full">
      {browsingTabs.map((tab) => (
        <div
          key={tab.id}
          ref={(el) => {
            if (el) containers.current.set(tab.id, el);
            else containers.current.delete(tab.id);
          }}
          className={`absolute inset-0 h-full w-full ${
            tab.id === activeId ? "z-10 opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
