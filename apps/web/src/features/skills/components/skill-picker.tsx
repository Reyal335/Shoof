"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useSkills } from "../hooks/use-skills";
import { matchSkills } from "../skills";
import type { Skill } from "../types";

type Props = {
  id: string;
  label: string;
  selected: Skill[];
  max: number;
  /** Id of a hint shown elsewhere in the form, read out with the input. */
  hintId?: string;
  onChange: (skills: Skill[], announcement: string) => void;
};

const toSkill = ({ id, slug, name, kind }: Skill): Skill => ({ id, slug, name, kind });

/**
 * Picks skills from the catalog: type to see matches, Enter or click adds one, Backspace on an empty box removes the
 * last. Only catalog skills can be added. Styled by the surrounding form's .tagbox, .tag and .sugg rules.
 */
export function SkillPicker({ id, label, selected, max, hintId, onChange }: Props) {
  const { state, retry } = useSkills();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const ready = state.status === "ready";
  const matches = ready ? matchSkills(state.skills, draft) : [];
  const isSelected = (skill: Skill) => selected.some((s) => s.id === skill.id);
  const full = selected.length >= max;

  function add(skill: Skill) {
    if (isSelected(skill)) return;
    if (full) {
      setError(`You can add up to ${max} skills.`);
      return;
    }
    const next = [...selected, toSkill(skill)];
    onChange(next, `${skill.name} added. ${next.length} skills.`);
    setDraft("");
    setError("");
  }

  function remove(skill: Skill) {
    const next = selected.filter((s) => s.id !== skill.id);
    onChange(next, `${skill.name} removed. ${next.length} skills.`);
    setError("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // Never submits the surrounding form
      e.preventDefault();
      const first = matches.find((s) => !isSelected(s));
      if (first) add(first);
    } else if (e.key === "Backspace" && !draft && selected.length) {
      remove(selected[selected.length - 1]);
    }
  }

  const typed = draft.trim();
  let placeholder = selected.length ? "" : "Search skills, e.g. React, Figma, Pixel Art";
  if (state.status === "loading") placeholder = "Loading skills…";

  return (
    <div className="field">
      <label htmlFor={`${id}-input`}>{label}</label>
      <div className="tagbox" onClick={(e) => e.target === e.currentTarget && inputRef.current?.focus()}>
        {selected.map((skill) => (
          <span className="tag" key={skill.id}>
            {skill.name}
            <button
              type="button"
              aria-label={`Remove ${skill.name}`}
              onClick={() => {
                remove(skill);
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
          placeholder={placeholder}
          disabled={!ready}
          aria-describedby={[hintId, `${id}-err`].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {state.status === "error" ? (
        <span className="err" id={`${id}-err`}>
          We couldn&apos;t load the list of skills.{" "}
          <button type="button" className="linkbtn" onClick={retry}>Try again</button>
        </span>
      ) : (
        <span className="err" id={`${id}-err`} hidden={!error}>{error}</span>
      )}

      {typed && ready && (
        matches.length > 0 ? (
          <div className="sugg" role="group" aria-label={`Skills matching ${typed}`}>
            {matches.map((skill) => (
              <button
                type="button"
                key={skill.id}
                aria-pressed={isSelected(skill)}
                disabled={!isSelected(skill) && full}
                onClick={() => {
                  if (isSelected(skill)) remove(skill);
                  else add(skill);
                  inputRef.current?.focus();
                }}
              >
                {skill.name}
              </button>
            ))}
          </div>
        ) : (
          <span className="hint" role="status">No skill called &ldquo;{typed}&rdquo; yet.</span>
        )
      )}
    </div>
  );
}
