"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

const TAG_MAX = 30;

type Props = {
  /** Prefix for the ids: `${name}-input` (give the row's <label> htmlFor this), `${name}-add`, `${name}-err`. */
  name: string;
  describedBy: string;
  placeholder: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
};

/** A tag list you add to by typing (Enter or the Mute button) and remove from with each chip's button. */
export function ChipInput({ name, describedBy, placeholder, tags, onAdd, onRemove }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const errorId = `${name}-err`;

  function add() {
    const tag = draft.replace(/\s+/g, " ").trim();
    const lower = tag.toLowerCase();
    if (!tag) setError("Type a tag or stack to mute.");
    else if (tag.length > TAG_MAX) setError("Keep it under 30 characters.");
    else if (tags.some((t) => t.toLowerCase() === lower)) setError(`${tag} is already muted.`);
    else {
      setError("");
      setDraft("");
      onAdd(tag);
      inputRef.current?.focus();
    }
  }

  function remove(tag: string, index: number) {
    flushSync(() => onRemove(tag));
    const buttons = listRef.current?.querySelectorAll("button");
    (buttons?.[Math.min(index, buttons.length - 1)] ?? inputRef.current)?.focus();
  }

  return (
    <>
      <div className="addrow">
        <input
          ref={inputRef}
          id={`${name}-input`}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          aria-describedby={`${describedBy} ${errorId}`}
          aria-invalid={error ? true : undefined}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add();
          }}
        />
        <button type="button" className="outline" id={`${name}-add`} onClick={add}>Mute</button>
      </div>
      <span className="err" id={errorId} hidden={!error}>{error}</span>
      {tags.length === 0 ? (
        <div className="empty" id={`${name}-empty`}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l4 6M21 9l-4 6" /></svg>
          <div><b>No muted tags yet</b><span>Add one above and its posts will stay out of your feed.</span></div>
        </div>
      ) : (
        <ul ref={listRef} className="mlist" id={`${name}-list`} aria-label="Muted tags">
          {tags.map((tag, i) => (
            <li key={tag}>
              {tag}
              <button type="button" aria-label={`Unmute ${tag}`} onClick={() => remove(tag, i)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
