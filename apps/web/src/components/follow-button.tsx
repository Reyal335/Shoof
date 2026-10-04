"use client";

import { useState } from "react";

type Props = {
  className: string;
  on: string;
  off: string;
  /** Text beside the button that changes with it. */
  hint?: { on: string; off: string };
  /** Render the hint before the button instead of after it. */
  hintFirst?: boolean;
};

export function FollowButton({ className, on, off, hint, hintFirst = false }: Props) {
  const [following, setFollowing] = useState(false);

  const button = (
    <button type="button" className={className} aria-pressed={following} onClick={() => setFollowing(!following)}>
      {following ? on : off}
    </button>
  );
  if (!hint) return button;

  const hintText = <span className="hint">{following ? hint.on : hint.off}</span>;
  return hintFirst ? (
    <>
      {hintText}
      {button}
    </>
  ) : (
    <>
      {button}
      {hintText}
    </>
  );
}
