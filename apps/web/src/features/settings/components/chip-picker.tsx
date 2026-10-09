"use client";

type Props = {
  id: string;
  labelledBy: string;
  describedBy: string;
  options: string[];
  selected: string[];
  onToggle: (option: string, on: boolean) => void;
};

/** A role="group" of toggle chips (aria-pressed). A selected chip is filled navy and shows a check. */
export function ChipPicker({ id, labelledBy, describedBy, options, selected, onToggle }: Props) {
  return (
    <div className="chips" role="group" id={id} aria-labelledby={labelledBy} aria-describedby={describedBy}>
      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <button key={option} type="button" className="chip" aria-pressed={on} onClick={() => onToggle(option, !on)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
            {option}
          </button>
        );
      })}
    </div>
  );
}
