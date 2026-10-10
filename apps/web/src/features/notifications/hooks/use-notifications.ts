import { useSyncExternalStore } from "react";

// Front end only (no notifications API yet): which notifications are read is kept in this browser, so the header
// bell on every page and the Notifications page agree, and it survives a reload.
// shoof-read holds the read ids; shoof-unread holds the count for pages that don't render the list.
const KEY_READ = "shoof-read";
const KEY_UNREAD = "shoof-unread";

export const NOTIFICATION_IDS = ["n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8"] as const;
export type NotificationId = (typeof NOTIFICATION_IDS)[number];

const DEFAULT_UNREAD: readonly NotificationId[] = ["n1", "n2", "n3"];
const DEFAULT_READ = NOTIFICATION_IDS.filter((id) => !DEFAULT_UNREAD.includes(id));

const listeners = new Set<() => void>();

// Used when storage is blocked (private mode, site data off): changes then last until reload.
const memory = new Map<string, string>();

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function store(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Kept in memory above.
  }
}

// useSyncExternalStore needs the same array back while the stored value is unchanged
let cachedRaw: string | null | undefined;
let cachedRead: readonly string[] = DEFAULT_READ;

function parseRead(raw: string | null): readonly string[] {
  if (raw === null) return DEFAULT_READ;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : DEFAULT_READ;
  } catch {
    return DEFAULT_READ;
  }
}

function readIds(): readonly string[] {
  const raw = load(KEY_READ);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRead = parseRead(raw);
  }
  return cachedRead;
}

function storedUnreadCount(): number {
  const raw = load(KEY_UNREAD);
  const count = raw === null ? NaN : Number(raw);
  return Number.isInteger(count) && count >= 0 ? count : DEFAULT_UNREAD.length;
}

function unreadIn(read: readonly string[]) {
  return NOTIFICATION_IDS.filter((id) => !read.includes(id)).length;
}

function saveRead(read: readonly string[]) {
  const ids = NOTIFICATION_IDS.filter((id) => read.includes(id));
  store(KEY_READ, JSON.stringify(ids));
  store(KEY_UNREAD, String(unreadIn(ids)));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY_READ || event.key === KEY_UNREAD || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Read state for the Notifications page. Every change also updates the header bell, here and in other tabs. */
export function useNotifications() {
  const read = useSyncExternalStore(subscribe, readIds, () => DEFAULT_READ);
  return {
    unreadCount: unreadIn(read),
    isUnread: (id: NotificationId) => !read.includes(id),
    markRead: (id: NotificationId) => saveRead([...readIds(), id]),
    markUnread: (id: NotificationId) => saveRead(readIds().filter((other) => other !== id)),
    markAllRead: () => saveRead(NOTIFICATION_IDS),
  };
}

/** The unread count for the header bell (3 until the Notifications page has saved one). */
export function useUnreadCount() {
  return useSyncExternalStore(subscribe, storedUnreadCount, () => DEFAULT_UNREAD.length);
}
