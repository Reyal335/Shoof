import type { UserSummary } from "@/features/profile/types";

type Props = {
  user: Pick<UserSummary, "displayName" | "avatarUrl"> | null;
  /** The page's avatar class, which sets the size and the fallback colour. */
  className: string;
};

/** The creator's photo, or the page's plain avatar circle when they haven't set one. Decorative: names sit beside it. */
export function Avatar({ user, className }: Props) {
  if (user?.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- any https host is allowed, so next/image's remotePatterns can't list them
    return <img className={`${className} avatar-img`} src={user.avatarUrl} alt="" />;
  }
  return <span className={className} aria-hidden="true" />;
}
