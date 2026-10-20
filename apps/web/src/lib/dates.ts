// Dates the server renders (post pages, profiles) are formatted in UTC so the server's HTML and the browser's
// hydration agree. Times only drawn in the browser (comments, notifications) use the viewer's own clock.

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** "Oct 3, 2026" */
export function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

/** "2026-10-03", for <time dateTime>. */
export function isoDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "5 minutes ago", "2 hours ago", "3 days ago", then "Sep 24" (this year) or "Sep 24, 2025". Browser only. */
export function timeAgo(iso: string, now = Date.now()): string {
  const then = new Date(iso);
  const diff = Math.max(0, now - then.getTime());
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return plural(Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return plural(Math.floor(diff / HOUR), "hour");
  if (diff < 7 * DAY) return plural(Math.floor(diff / DAY), "day");
  const sameYear = then.getFullYear() === new Date(now).getFullYear();
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
}

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}
