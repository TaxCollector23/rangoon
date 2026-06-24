import { useEffect, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Refresh, Home, Search } from "./icons";
import { resolveInput } from "../lib/url";

interface Props {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onNavigate: (url: string) => void;
  inputRef?: RefObject<HTMLInputElement>;
}

function IconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** The post-navigation navigation bar: back / forward / refresh / home and a
 *  combined address + search field. */
export default function Toolbar({
  url,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onRefresh,
  onHome,
  onNavigate,
  inputRef,
}: Props) {
  const [value, setValue] = useState(url);

  // Keep the address field in sync when navigation happens elsewhere.
  useEffect(() => setValue(url), [url]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = resolveInput(value);
    if (next) onNavigate(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setValue(url); // discard edits
      e.currentTarget.blur();
    }
  }

  return (
    <div className="flex items-center gap-1 px-2 py-2">
      <IconButton label="Back" onClick={onBack} disabled={!canGoBack}>
        <ArrowLeft />
      </IconButton>
      <IconButton label="Forward" onClick={onForward} disabled={!canGoForward}>
        <ArrowRight />
      </IconButton>
      <IconButton label="Refresh" onClick={onRefresh}>
        <Refresh />
      </IconButton>
      <IconButton label="Home" onClick={onHome}>
        <Home />
      </IconButton>

      <form onSubmit={submit} className="ml-1 flex-1">
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 transition-colors focus-within:border-white/30 focus-within:bg-[var(--color-surface-hover)]">
          <Search width={15} height={15} className="shrink-0 text-[var(--color-muted)]" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={onKeyDown}
            placeholder="Search the web or type a URL"
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--color-muted)]"
          />
        </div>
      </form>
    </div>
  );
}
