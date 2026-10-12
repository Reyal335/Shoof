"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { GROUP_LABELS, GROUP_SUGGESTIONS, MAX_STACK_PER_GROUP, tryAddStackName } from "../profile-form";
import type { TechStackGroup } from "../types";

type Props = {
  group: TechStackGroup;
  names: string[];
  onChange: (names: string[], announcement: string) => void;
};

/** One tech stack group: a tag box (Enter or comma adds, Backspace removes the last) and suggestion chips. */
export function StackGroupInput({ group, names, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const label = GROUP_LABELS[group];
  const id = `stack-${group}`;

  /** Adds each name in order and reports whether every non-blank one went in. */
  function add(raw: string[], { quiet = false } = {}) {
    let next = names;
    let lastError = "";
    let lastAdded = "";
    for (const name of raw) {
      const result = tryAddStackName(next, name);
      if (!result) continue;
      if ("error" in result) lastError = result.error;
      else {
        next = result.names;
        lastAdded = result.added;
      }
    }
    setError(lastError);
    if (next !== names) onChange(next, quiet ? "" : `${lastAdded} added to ${label}.`);
    return !lastError;
  }

  function remove(index: number) {
    setError("");
    onChange(names.filter((_, i) => i !== index), `${names[index]} removed from ${label}.`);
  }

  function commitDraft(options?: { quiet: boolean }) {
    if (draft.trim() && add([draft], options)) setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && names.length) {
      remove(names.length - 1);
    }
  }

  const has = (name: string) => names.some((n) => n.toLowerCase() === name.toLowerCase());

  return (
    <div className="field">
      <label htmlFor={`${id}-input`}>{label}</label>
      <div className="tagbox" onClick={(e) => e.target === e.currentTarget && inputRef.current?.focus()}>
        {names.map((name, i) => (
          <span className="tag" key={name}>
            {name}
            <button
              type="button"
              aria-label={`Remove ${name} from ${label}`}
              onClick={() => {
                remove(i);
                inputRef.current?.focus();
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          id={`${id}-input`}
          autoComplete="off"
          placeholder={names.length ? "" : "Type a name, then press Enter"}
          aria-describedby={`stack-hint ${id}-err`}
          aria-invalid={error ? true : undefined}
          value={draft}
          onChange={(e) => {
            const value = e.target.value;
            // A comma (usually from a paste) splits the text into several names
            if (value.includes(",")) {
              setDraft("");
              add(value.split(","));
            } else {
              setDraft(value);
              setError("");
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={() => commitDraft({ quiet: true })}
        />
      </div>
      <span className="err" id={`${id}-err`} hidden={!error}>{error}</span>
      <div className="sugg" role="group" aria-label={`Common ${label.toLowerCase()} choices`}>
        {GROUP_SUGGESTIONS[group].map((name) => (
          <button
            type="button"
            key={name}
            aria-pressed={has(name)}
            disabled={!has(name) && names.length >= MAX_STACK_PER_GROUP}
            onClick={() => {
              const index = names.findIndex((n) => n.toLowerCase() === name.toLowerCase());
              if (index > -1) remove(index);
              else add([name]);
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
