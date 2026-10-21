/** The first line of user text, cut to `max` characters, for a card's one-line summary. */
export function firstLine(text: string, max = 120): string {
  const line = text.trim().split("\n")[0].trim();
  return line.length > max ? `${line.slice(0, max - 1).trimEnd()}…` : line;
}

/** User text split on blank lines, for one <p> per paragraph. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
