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
  /** Controlled mode, for pages that show the follow state elsewhere too (e.g. a follower count). */
  following?: boolean;
  onFollowingChange?: (following: boolean) => void;
};

export function FollowButton({ className, on, off, hint, hintFirst = false, following: controlled, onFollowingChange }: Props) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const following = controlled ?? uncontrolled;

  function toggle() {
    setUncontrolled(!following);
    onFollowingChange?.(!following);
  }

  const button = (
    <button type="button" className={className} aria-pressed={following} onClick={toggle}>
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
