"use client";

export type TabOption = { value: string; label: string };

type Props = {
  label: string;
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
};

/** A role="tablist" button group. Each tab is a native button, so Tab, Enter and Space work as expected. */
export function Tabs({ label, options, value, onChange }: Props) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="tab"
          role="tab"
          aria-selected={option.value === value}
          data-value={option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
