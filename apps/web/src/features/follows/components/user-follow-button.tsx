"use client";

import Link from "next/link";
import { useFollow } from "../hooks/use-follow";

type Props = {
  /** The user to follow. */
  userId: string;
  /** Their username, for the "log in, then come back" link. */
  username: string;
  className: string;
};

// Follows a real user through the API. The plain FollowButton in components/ is the local-only toggle the mock pages
// (categories, creator lists) still use.
export function UserFollowButton({ userId, username, className }: Props) {
  const { state, toggle, reload, isPending, error } = useFollow(userId);

  switch (state.status) {
    case "self":
      return null;
    case "signed-out":
      return (
        <Link className={className} href={`/login?next=${encodeURIComponent(`/@${username}`)}`}>
          Follow
        </Link>
      );
    case "loading":
      return (
        <button type="button" className={className} disabled aria-busy="true">
          Follow
        </button>
      );
    case "error":
      return (
        <>
          <button type="button" className={className} onClick={reload}>
            Follow
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
            {state.following ? "Following" : "Follow"}
          </button>
          {error && <p className="follow-err" role="alert">{error}</p>}
        </>
      );
  }
}
