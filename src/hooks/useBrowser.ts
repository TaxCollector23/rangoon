import { useCallback, useState } from "react";
import type { Tab } from "../types";
import { prettyTitle } from "../lib/url";

let counter = 0;
const newId = () => `tab-${++counter}-${Date.now().toString(36)}`;

function blankTab(): Tab {
  return { id: newId(), url: "", title: "New Tab", history: [], historyIndex: -1 };
}

/** All tab + per-tab navigation state, kept entirely in memory. */
export function useBrowser() {
  const [tabs, setTabs] = useState<Tab[]>(() => [blankTab()]);
  const [activeId, setActiveId] = useState<string>(() => tabs[0].id);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const update = useCallback((id: string, patch: (t: Tab) => Tab) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? patch(t) : t)));
  }, []);

  const newTab = useCallback(() => {
    const tab = blankTab();
    setTabs((prev) => [...prev, tab]);
    setActiveId(tab.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length === 1) {
          // Never leave zero tabs — reset the last one to the homepage.
          const fresh = blankTab();
          setActiveId(fresh.id);
          return [fresh];
        }
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);
        if (id === activeId) {
          const neighbour = next[Math.min(idx, next.length - 1)];
          setActiveId(neighbour.id);
        }
        return next;
      });
    },
    [activeId]
  );

  /** Navigate the active tab to a real URL, pushing onto its history. */
  const navigate = useCallback(
    (url: string) => {
      update(activeId, (t) => {
        const history = [...t.history.slice(0, t.historyIndex + 1), url];
        return {
          ...t,
          url,
          title: prettyTitle(url),
          history,
          historyIndex: history.length - 1,
        };
      });
    },
    [activeId, update]
  );

  /** Record an in-page navigation (e.g. the user clicked a link inside the
   *  proxied page). Only pushes when the URL actually changed. */
  const recordNavigation = useCallback(
    (id: string, url: string) => {
      update(id, (t) => {
        if (url === t.history[t.historyIndex]) return t;
        const history = [...t.history.slice(0, t.historyIndex + 1), url];
        return {
          ...t,
          url,
          title: prettyTitle(url),
          history,
          historyIndex: history.length - 1,
        };
      });
    },
    [update]
  );

  const goBack = useCallback(() => {
    update(activeId, (t) => {
      if (t.historyIndex <= 0) {
        // Step back from the first page onto the homepage.
        if (t.historyIndex === 0) {
          return { ...t, url: "", title: "New Tab", historyIndex: -1 };
        }
        return t;
      }
      const historyIndex = t.historyIndex - 1;
      const url = t.history[historyIndex];
      return { ...t, url, title: prettyTitle(url), historyIndex };
    });
  }, [activeId, update]);

  const goForward = useCallback(() => {
    update(activeId, (t) => {
      if (t.historyIndex >= t.history.length - 1) return t;
      const historyIndex = t.historyIndex + 1;
      const url = t.history[historyIndex];
      return { ...t, url, title: prettyTitle(url), historyIndex };
    });
  }, [activeId, update]);

  const goHome = useCallback(() => {
    update(activeId, (t) => ({ ...t, url: "", title: "New Tab", historyIndex: -1 }));
  }, [activeId, update]);

  const canGoBack = activeTab.historyIndex >= 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return {
    tabs,
    activeId,
    activeTab,
    setActiveId,
    newTab,
    closeTab,
    navigate,
    recordNavigation,
    goBack,
    goForward,
    goHome,
    canGoBack,
    canGoForward,
  };
}
