import { useEffect } from "react";

interface Shortcuts {
  onFocusAddress: () => void;
  onNewTab: () => void;
  onCloseTab: () => void;
}

/** Global browser keyboard shortcuts:
 *   Cmd/Ctrl + L  → focus the address bar
 *   Cmd/Ctrl + T  → new tab
 *   Cmd/Ctrl + W  → close current tab
 *  (Enter to navigate and Escape to exit editing are handled by the inputs.) */
export function useKeyboardShortcuts({
  onFocusAddress,
  onNewTab,
  onCloseTab,
}: Shortcuts) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "l":
          e.preventDefault();
          onFocusAddress();
          break;
        case "t":
          e.preventDefault();
          onNewTab();
          break;
        case "w":
          e.preventDefault();
          onCloseTab();
          break;
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFocusAddress, onNewTab, onCloseTab]);
}
