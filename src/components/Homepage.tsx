import { useState } from "react";
import { Search } from "./icons";
import { resolveInput } from "../lib/url";

interface Props {
  onNavigate: (url: string) => void;
}

/** The distraction-free homepage: a title and one large centered search bar. */
export default function Homepage({ onNavigate }: Props) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const url = resolveInput(value);
    if (url) onNavigate(url);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6">
      <div className="animate-fade-in flex w-full max-w-xl flex-col items-center">
        <h1 className="mb-1 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Scramjet
        </h1>
        <p className="mb-10 text-sm text-[var(--color-muted)]">
          Search the web or enter an address
        </p>

        <form onSubmit={submit} className="w-full">
          <div className="group flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-lg shadow-black/40 transition-all duration-300 focus-within:border-white/30 focus-within:bg-[var(--color-surface-hover)] focus-within:shadow-black/60">
            <Search className="shrink-0 text-[var(--color-muted)] transition-colors group-focus-within:text-white" />
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search Google or type a URL"
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-[var(--color-muted)]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
