import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

// The one place Shoof keeps the theme choice. Light/Dark are stored; System means "no key", so pages follow the device.
const STORAGE_KEY = "shoof-theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function writeTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode, site data off): the choice just lasts until reload.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The saved theme choice ("system" on the server and when nothing is saved), kept in sync across tabs. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as const);
  return {
    theme,
    setTheme: (next: "light" | "dark") => writeTheme(next),
    clearTheme: () => writeTheme("system"),
  };
}
