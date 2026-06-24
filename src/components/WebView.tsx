import { useEffect, useRef } from "react";
import type { Tab } from "../types";
import { encodeUrl, decodeUrl } from "../lib/scramjet";

interface Props {
  tabs: Tab[];
  activeId: string;
  ready: boolean;
  /** Bumped by the parent to force a reload of the active tab. */
  reloadKey: number;
  onInPageNavigate: (tabId: string, realUrl: string) => void;
}

/** Renders one persistent Scramjet iframe per browsing tab. Inactive tabs stay
 *  mounted (hidden) so their page state survives tab switches. All navigation
 *  happens inside these frames — the app shell itself never redirects. */
export default function WebView({
  tabs,
  activeId,
  ready,
  reloadKey,
  onInPageNavigate,
}: Props) {
  const frames = useRef<Map<string, HTMLIFrameElement>>(new Map());
  // The real URL currently loaded in each frame — avoids redundant reloads.
  const loaded = useRef<Map<string, string>>(new Map());
  const prevReloadKey = useRef(reloadKey);

  // Drive each frame's src from its tab's current URL.
  useEffect(() => {
    if (!ready) return;
    for (const tab of tabs) {
      if (!tab.url) continue;
      const frame = frames.current.get(tab.id);
      if (!frame) continue;
      if (loaded.current.get(tab.id) !== tab.url) {
        loaded.current.set(tab.id, tab.url);
        frame.src = encodeUrl(tab.url);
      }
    }
  }, [tabs, ready]);

  // Reload the active frame when the refresh button is pressed.
  useEffect(() => {
    if (prevReloadKey.current === reloadKey) return;
    prevReloadKey.current = reloadKey;
    const frame = frames.current.get(activeId);
    if (frame?.contentWindow) {
      try {
        frame.contentWindow.location.reload();
      } catch {
        const tab = tabs.find((t) => t.id === activeId);
        if (tab?.url) frame.src = encodeUrl(tab.url);
      }
    }
  }, [reloadKey, activeId, tabs]);

  function handleLoad(tab: Tab) {
    const frame = frames.current.get(tab.id);
    if (!frame?.contentWindow) return;
    try {
      // Proxied pages are served same-origin, so this is readable.
      const href = frame.contentWindow.location.href;
      const real = decodeUrl(href);
      if (real && /^https?:/i.test(real)) {
        loaded.current.set(tab.id, real);
        onInPageNavigate(tab.id, real);
      }
    } catch {
      // Cross-origin or about:blank — ignore.
    }
  }

  const browsingTabs = tabs.filter((t) => t.url);

  return (
    <div className="relative h-full w-full">
      {browsingTabs.map((tab) => (
        <iframe
          key={tab.id}
          title={tab.title}
          ref={(el) => {
            if (el) frames.current.set(tab.id, el);
            else frames.current.delete(tab.id);
          }}
          onLoad={() => handleLoad(tab)}
          className={`absolute inset-0 h-full w-full border-0 bg-white ${
            tab.id === activeId ? "z-10 opacity-100" : "pointer-events-none opacity-0"
          }`}
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
          allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        />
      ))}
    </div>
  );
}
