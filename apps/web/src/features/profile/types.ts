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
