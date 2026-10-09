"use client";

import { useComingSoon } from "./setting-row";

export type ChoiceOption<T extends string> = { value: T; label: string };

type SelectProps<T extends string> = {
  /** Give the row's <label> htmlFor this id. */
  id: string;
  describedBy: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange?: (option: ChoiceOption<T>) => void;
};

/** A native <select>. Disabled in a Coming soon row. */
export function Select<T extends string>({ id, describedBy, options, value, onChange }: SelectProps<T>) {
  const soon = useComingSoon();
  return (
    <select
      id={id}
      aria-describedby={describedBy}
      disabled={soon}
      aria-disabled={soon || undefined}
      value={value}
      onChange={(event) => {
        const option = options.find((o) => o.value === event.target.value);
        if (option) onChange?.(option);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

type RadioGroupProps<T extends string> = {
  name: string;
  labelledBy: string;
  describedBy: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange?: (option: ChoiceOption<T>) => void;
};

/** A role="radiogroup" of native radios, each id'd `${name}-${value}`. Disabled in a Coming soon row. */
export function RadioGroup<T extends string>({ name, labelledBy, describedBy, options, value, onChange }: RadioGroupProps<T>) {
  const soon = useComingSoon();
  return (
    <div className="radios" role="radiogroup" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-disabled={soon || undefined}>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <span className="radio" key={option.value}>
            <input
              type="radio"
              name={name}
              id={id}
              value={option.value}
              checked={option.value === value}
              disabled={soon}
              onChange={() => onChange?.(option)}
            />
            <label htmlFor={id}>{option.label}</label>
          </span>
        );
      })}
    </div>
  );
}
