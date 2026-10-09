"use client";

import type { KeyboardEvent } from "react";

export type SegmentOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  id: string;
  labelledBy: string;
  describedBy: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (option: SegmentOption<T>) => void;
};

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * A role="tablist" of role="tab" buttons that picks one value. Roving tabindex: only the selected tab is in the
 * Tab order, and the arrow keys move focus and select, wrapping at the ends.
 */
export function SegmentedControl<T extends string>({ id, labelledBy, describedBy, options, value, onChange }: Props<T>) {
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = STEP[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    onChange(options[next]);
  }

  return (
    <div className="seg" role="tablist" id={id} aria-labelledby={labelledBy} aria-describedby={describedBy}>
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => !selected && onChange(option)}
            onKeyDown={(event) => move(event, i)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
