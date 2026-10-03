"use client";

import { useRef, type KeyboardEvent } from "react";

export const CATEGORIES = ["All", "Games", "Portfolios", "SaaS", "CSS & UI"] as const;
export type Category = (typeof CATEGORIES)[number];

export function categoryTabId(category: Category) {
  return `tab-${CATEGORIES.indexOf(category)}`;
}

type Props = {
  value: Category;
  onChange: (category: Category) => void;
  /** Id of the element whose content the tabs filter. */
  controls: string;
};

/** Tabs with a roving tabindex: Tab enters the active tab, arrow keys and Home/End move between them. */
export function CategoryTabs({ value, onChange, controls }: Props) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent) {
    const current = CATEGORIES.indexOf(value);
    const last = CATEGORIES.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    onChange(CATEGORIES[next]);
    tabs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Categories"
      onKeyDown={handleKeyDown}
      className="flex flex-wrap items-center gap-2"
    >
      {CATEGORIES.map((category, i) => {
        const selected = category === value;
        return (
          <button
            key={category}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={categoryTabId(category)}
            aria-selected={selected}
            aria-controls={controls}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(category)}
            className="h-[42px] rounded-[21px] border-[1.5px] border-field-border bg-white px-[18px] text-[15px] font-semibold text-navy aria-selected:border-navy aria-selected:bg-navy aria-selected:text-white"
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
