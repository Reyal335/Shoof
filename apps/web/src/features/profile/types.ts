// Mirrors ProfileView in apps/api/src/modules/users/users.service.ts.

// Same groups, in the same order, as TECH_STACK_GROUPS in apps/api/src/modules/users/entities/profile.entity.ts.
export const TECH_STACK_GROUPS = ["frontend", "backend", "tools"] as const;
export type TechStackGroup = (typeof TECH_STACK_GROUPS)[number];
export type TechStack = Record<TechStackGroup, string[]>;

export interface Profile {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  techStack: TechStack;
  updatedAt: string;
}

// The PATCH body. Every field optional; a blank string or null clears bio, avatarUrl and websiteUrl.
export type ProfileUpdate = Partial<Pick<Profile, "displayName" | "bio" | "avatarUrl" | "websiteUrl">> & {
  techStack?: Partial<TechStack>;
};

// What anyone can see at /@username: GET /users/:username. Mirrors PublicUser in apps/api/src/modules/users/users.service.ts.
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
    techStack: TechStack;
    /** ISO 3166-1 alpha-2 */
    country: string | null;
  } | null;
}
