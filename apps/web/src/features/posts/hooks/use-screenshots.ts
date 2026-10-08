"use client";

import { useEffect, useRef, useState } from "react";
import { plural } from "@/lib/plural";
import { MAX_SCREENSHOT_BYTES, MAX_SCREENSHOTS, SCREENSHOT_TYPES } from "../post-form";
import type { ScreenshotDraft } from "../types";

/**
 * The picked screenshots (index 0 is the cover), their error and live announcement.
 * Owns the object URLs: each is revoked when its screenshot is removed, on reset and on unmount.
 */
export function useScreenshots() {
  const [items, setItems] = useState<ScreenshotDraft[]>([]);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const liveUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = liveUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function revoke(url: string) {
    URL.revokeObjectURL(url);
    liveUrls.current.delete(url);
  }

  return {
    items,
    error,
    announcement,
    /** Adds the valid files; the rest are skipped with a reason each. */
    add(files: File[]) {
      const next = [...items];
      const problems: string[] = [];
      let added = 0;
      for (const file of files) {
        if (next.length >= MAX_SCREENSHOTS) problems.push(`Only ${MAX_SCREENSHOTS} images fit. ${file.name} was skipped.`);
        else if (!SCREENSHOT_TYPES.includes(file.type)) problems.push(`${file.name} is not a PNG, JPG, WebP or GIF.`);
        else if (file.size > MAX_SCREENSHOT_BYTES) problems.push(`${file.name} is over 5 MB.`);
        else {
          const url = URL.createObjectURL(file);
          liveUrls.current.add(url);
          next.push({ file, url });
          added++;
        }
      }
      setItems(next);
      setError(problems.join(" "));
      if (added) setAnnouncement(`${plural(added, "screenshot", "screenshots")} added. ${next.length} in total.`);
    },
    remove(index: number) {
      revoke(items[index].url);
      const next = items.filter((_, i) => i !== index);
      setItems(next);
      setError("");
      setAnnouncement(`Screenshot removed. ${next.length} left.`);
    },
    makeCover(index: number) {
      setItems([items[index], ...items.filter((_, i) => i !== index)]);
      setAnnouncement(`Screenshot ${index + 1} is now the cover.`);
    },
    reset() {
      items.forEach((s) => revoke(s.url));
      setItems([]);
      setError("");
      setAnnouncement("");
    },
  };
}

export type Screenshots = ReturnType<typeof useScreenshots>;
