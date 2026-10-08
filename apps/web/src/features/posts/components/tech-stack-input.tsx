import { useRef } from "react";
import type { KeyboardEvent } from "react";
import type { TechStack } from "../hooks/use-tech-stack";
import { MAX_TAGS, STACK_SUGGESTIONS } from "../post-form";
import { FieldError, FormSection } from "./form-section";

/** Section 4: the tag box (Enter or comma adds, Backspace removes the last) and the suggestion chips. */
export function TechStackInput({ stack }: { stack: TechStack }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      stack.commitDraft();
    } else if (e.key === "Backspace" && !stack.draft) {
      stack.removeLast();
    }
  }

  return (
    <FormSection number={4} title="Tech stack" optional>
      <div className="field">
        <label htmlFor="stack-input">What did you build it with?</label>
        <div className="tagbox" onClick={(e) => e.target === e.currentTarget && inputRef.current?.focus()}>
          <span>
            {stack.tags.map((tag, i) => (
              <span className="tag" key={tag}>
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => {
                    stack.remove(i);
                    inputRef.current?.focus();
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </span>
          <input
            ref={inputRef}
            type="text"
            id="stack-input"
            autoComplete="off"
            placeholder="Type a name, then press Enter"
            aria-describedby="stack-hint stack-err"
            aria-invalid={stack.error ? true : undefined}
            value={stack.draft}
            onChange={(e) => stack.type(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => stack.commitDraft({ quiet: true })}
          />
        </div>
        <span className="hint" id="stack-hint">{`Press Enter or comma to add. Backspace removes the last one. Up to ${MAX_TAGS}.`}</span>
        <FieldError id="stack-err" message={stack.error} />
      </div>
      <div className="sugg" role="group" aria-label="Common choices">
        {STACK_SUGGESTIONS.map((name) => (
          <button type="button" key={name} aria-pressed={stack.has(name)} onClick={() => stack.toggle(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="sr" role="status" aria-live="polite">{stack.announcement}</div>
    </FormSection>
  );
}
