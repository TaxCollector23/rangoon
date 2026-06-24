/** Decide whether the user's input is a URL or a search query, and turn it
 *  into a navigable URL. Search queries go to Google. */
export function resolveInput(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  // Already a full URL.
  if (/^https?:\/\//i.test(input)) return input;

  // about:, file:, etc. — pass through untouched.
  if (/^[a-z]+:\/\//i.test(input)) return input;

  // Looks like a domain / host[:port][/path] with no spaces and a dot (or
  // localhost). Treat as a URL and default to https.
  const looksLikeHost =
    !/\s/.test(input) &&
    (/^localhost(:\d+)?(\/.*)?$/i.test(input) ||
      /^[^\s/?#]+\.[^\s/?#]+/.test(input));

  if (looksLikeHost) return `https://${input}`;

  // Otherwise: Google search.
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}

/** A compact, human-friendly label for a URL (used as a tab title). */
export function prettyTitle(url: string): string {
  if (!url) return "New Tab";
  try {
    const u = new URL(url);
    if (u.hostname === "www.google.com" && u.pathname === "/search") {
      const q = u.searchParams.get("q");
      if (q) return q;
    }
    return u.hostname.replace(/^www\./, "") || url;
  } catch {
    return url;
  }
}
