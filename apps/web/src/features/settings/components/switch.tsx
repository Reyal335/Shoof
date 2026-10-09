"use client";

import { useComingSoon } from "./setting-row";

type Props = {
  /** Give the row's <label> htmlFor this id. */
  id: string;
  describedBy: string;
  on: boolean;
  onChange?: (on: boolean) => void;
};

/** An on/off button (aria-pressed) drawn as a switch: a 60x44 hit area around the 52x30 track. Inert in a Coming soon row. */
export function Switch({ id, describedBy, on, onChange }: Props) {
  const soon = useComingSoon();
  return (
    <button
      type="button"
      className="switch"
      id={id}
      aria-pressed={on}
      aria-describedby={describedBy}
      aria-disabled={soon || undefined}
      tabIndex={soon ? -1 : undefined}
      onClick={soon ? undefined : () => onChange?.(!on)}
    >
      <span className="track" aria-hidden="true">
        <span className="knob"></span>
      </span>
    </button>
  );
}
