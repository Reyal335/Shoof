"use client";

import type { KeyboardEvent } from "react";

export type TabOption = { value: string; label: string };

type Props = {
  label: string;
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  /**
   * Set when the tabs switch role="tabpanel"s instead of filtering a list. Tab `x` gets id `tab-x` and
   * controls the panel with id `panel-x` (give it aria-labelledby="tab-x"). The group then uses a roving
   * tabindex, and Left/Right move to the previous/next tab, wrapping at the ends, and select it.
   */
  panels?: boolean;
};

/** A role="tablist" button group. Each tab is a native button, so Tab, Enter and Space work as expected. */
export function Tabs({ label, options, value, onChange, panels = false }: Props) {
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
    onChange(options[next].value);
  }

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className="tab"
            role="tab"
            aria-selected={selected}
            data-value={option.value}
            onClick={() => onChange(option.value)}
            {...(panels && {
              id: `tab-${option.value}`,
              "aria-controls": `panel-${option.value}`,
              tabIndex: selected ? 0 : -1,
              onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => move(event, i),
            })}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
