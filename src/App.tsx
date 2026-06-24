import { useCallback, useEffect, useRef, useState } from "react";
import { useBrowser } from "./hooks/useBrowser";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { initScramjet } from "./lib/scramjet";
import TabBar from "./components/TabBar";
import Toolbar from "./components/Toolbar";
import Homepage from "./components/Homepage";
import WebView from "./components/WebView";

export default function App() {
  const b = useBrowser();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const addressRef = useRef<HTMLInputElement>(null);

  // Boot the Scramjet engine once.
  useEffect(() => {
    initScramjet()
      .then(() => setReady(true))
      .catch((e) => setError(e?.message ?? String(e)));
  }, []);

  const focusAddress = useCallback(() => {
    const el = addressRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);
  const closeActive = useCallback(() => b.closeTab(b.activeId), [b]);

  useKeyboardShortcuts({
    onFocusAddress: focusAddress,
    onNewTab: b.newTab,
    onCloseTab: closeActive,
  });

  const browsing = b.activeTab.url !== "";

  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-bg)]">
      {/* Tabs are always visible so the user can manage multiple sites. */}
      <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <TabBar
          tabs={b.tabs}
          activeId={b.activeId}
          onSelect={b.setActiveId}
          onClose={b.closeTab}
          onNew={b.newTab}
        />
        {browsing && (
          <Toolbar
            url={b.activeTab.url}
            canGoBack={b.canGoBack}
            canGoForward={b.canGoForward}
            onBack={b.goBack}
            onForward={b.goForward}
            onRefresh={() => setReloadKey((k) => k + 1)}
            onHome={b.goHome}
            onNavigate={b.navigate}
            inputRef={addressRef}
          />
        )}
      </header>

      <main className="relative flex-1 overflow-hidden">
        {/* Homepage for the active tab when it has no URL yet. */}
        {!browsing && <Homepage onNavigate={b.navigate} inputRef={addressRef} />}

        {/* Persistent proxied frames for all browsing tabs. */}
        <div className={browsing ? "h-full w-full" : "hidden"}>
          <WebView
            tabs={b.tabs}
            activeId={b.activeId}
            ready={ready}
            reloadKey={reloadKey}
            onUrlChange={b.recordNavigation}
          />
        </div>

        {error && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Scramjet engine failed to start: {error}
          </div>
        )}
      </main>
    </div>
  );
}
