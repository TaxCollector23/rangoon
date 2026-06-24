import type { Tab } from "../types";
import { Plus, Close } from "./icons";

interface Props {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

export default function TabBar({ tabs, activeId, onSelect, onClose, onNew }: Props) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 pt-2">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`group flex h-9 min-w-[120px] max-w-[200px] shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-3 text-sm transition-colors ${
              active
                ? "border-white bg-[var(--color-surface)] text-white"
                : "border-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-white"
            }`}
          >
            <span className="truncate">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              aria-label="Close tab"
              className="ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-md text-[var(--color-muted)] opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
            >
              <Close width={13} height={13} />
            </button>
          </div>
        );
      })}

      <button
        onClick={onNew}
        aria-label="New tab"
        className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-white"
      >
        <Plus width={16} height={16} />
      </button>
    </div>
  );
}
