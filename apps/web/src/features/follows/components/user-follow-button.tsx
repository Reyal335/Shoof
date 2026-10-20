"use client";

import Link from "next/link";
import { useFollow } from "../hooks/use-follow";

type Props = {
  /** The user to follow. */
  userId: string;
  /** Their username, for the "log in, then come back" link. */
  username: string;
  className: string;
  /** The button's words, e.g. "Follow back" in notifications. */
  labels?: { off: string; on: string };
};

// Follows a real user through the API. The plain FollowButton in components/ is the local-only toggle the mock pages
// (category follows, creator lists) still use.
export function UserFollowButton({ userId, username, className, labels = { off: "Follow", on: "Following" } }: Props) {
  const { state, toggle, reload, isPending, error } = useFollow(userId);

  switch (state.status) {
    case "self":
      return null;
    case "signed-out":
      return (
        <Link className={className} href={`/login?next=${encodeURIComponent(`/@${username}`)}`}>
          {labels.off}
        </Link>
      );
    case "loading":
      return (
        <button type="button" className={className} disabled aria-busy="true">
          {labels.off}
        </button>
      );
    case "error":
      return (
        <>
          <button type="button" className={className} onClick={reload}>
            {labels.off}
          </button>
          <p className="follow-err" role="alert">Couldn&apos;t load whether you follow @{username}. Try again.</p>
        </>
      );
    case "ready":
      return (
        <>
          <button
            type="button"
            className={className}
            aria-pressed={state.following}
            aria-busy={isPending}
            disabled={isPending}
            onClick={toggle}
          >
            {state.following ? labels.on : labels.off}
          </button>
          {error && <p className="follow-err" role="alert">{error}</p>}
        </>
      );
  }
}
