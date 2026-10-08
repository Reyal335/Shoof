"use client";

import { useState } from "react";
import { sameName, tryAddTag } from "../post-form";

/** State for the tech stack tag input: the committed tags, the text being typed, its error and the live announcement. */
export function useTechStack() {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");

  /** Adds each name in order. Returns the resulting tags and whether every non-blank name was added. */
  function commit(names: string[], { quiet = false } = {}) {
    let next = tags;
    let lastError = "";
    let lastAdded = "";
    let allAdded = true;
    for (const name of names) {
      const result = tryAddTag(next, name);
      if (!result) continue;
      if ("error" in result) {
        lastError = result.error;
        allAdded = false;
      } else {
        next = result.tags;
        lastAdded = result.added;
      }
    }
    setTags(next);
    setError(lastError);
    if (lastAdded && !quiet) setAnnouncement(`${lastAdded} added. ${next.length} in your stack.`);
    return { tags: next, allAdded };
  }

  function remove(index: number) {
    const next = tags.filter((_, i) => i !== index);
    setTags(next);
    setError("");
    setAnnouncement(`${tags[index]} removed. ${next.length} in your stack.`);
  }

  return {
    tags,
    draft,
    error,
    announcement,
    /** Enter, comma or blur: commit the typed text and clear it if it was added. */
    commitDraft({ quiet = false } = {}) {
      if (!draft.trim()) return tags;
      const result = commit([draft], { quiet });
      if (result.allAdded) setDraft("");
      return result.tags;
    },
    /** Typing. A comma (usually from a paste) splits the text into several tags. */
    type(value: string) {
      if (value.includes(",")) {
        setDraft("");
        commit(value.split(","));
      } else {
        setDraft(value);
        setError("");
      }
    },
    remove,
    removeLast() {
      if (tags.length) remove(tags.length - 1);
    },
    has(name: string) {
      return tags.some((t) => sameName(t, name));
    },
    toggle(name: string) {
      const index = tags.findIndex((t) => sameName(t, name));
      if (index > -1) remove(index);
      else commit([name]);
    },
    reset() {
      setTags([]);
      setDraft("");
      setError("");
      setAnnouncement("");
    },
  };
}

export type TechStack = ReturnType<typeof useTechStack>;
