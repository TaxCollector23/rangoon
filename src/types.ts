export interface Tab {
  id: string;
  /** Real (decoded) URL currently shown, or "" when on the homepage. */
  url: string;
  /** Display title for the tab strip. */
  title: string;
  /** Per-tab navigation history of real URLs. */
  history: string[];
  /** Index into `history`; -1 when on the homepage. */
  historyIndex: number;
}
