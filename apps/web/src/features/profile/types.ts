import type { Skill } from "@/features/skills/types";

// Mirrors ProfileView in apps/api/src/modules/users/users.service.ts.

export interface Profile {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  /** Sorted by name; the page groups them by kind. */
  skills: Skill[];
  updatedAt: string;
}

// The PATCH body. Every field optional; a blank string or null clears bio, avatarUrl and websiteUrl.
// skillIds, when sent, replaces the whole set.
export type ProfileUpdate = Partial<Pick<Profile, "displayName" | "bio" | "avatarUrl" | "websiteUrl">> & {
  skillIds?: string[];
};

// What anyone can see at /@username: GET /users/:username. Mirrors PublicProfileView in apps/api/src/modules/users/users.service.ts.
export interface ProfileLink {
  label: string;
  url: string;
}

export interface PublicUser {
  id: string;
  username: string;
  /** null until the user first opens or saves their own profile, which is when the row is created. */
  profile: {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    links: ProfileLink[];
    /** ISO 3166-1 alpha-2 */
    country: string | null;
  } | null;
  skills: Skill[];
}
