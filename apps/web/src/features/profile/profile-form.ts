import { z } from "zod";
import type { TechStackGroup } from "./types";

/** Rules and copy for the edit-profile form. Pure: no React, no DOM. Limits match apps/api/src/modules/users/users.constants.ts. */

export const DISPLAY_NAME_MAX = 80;
export const BIO_MAX = 500;
const URL_MAX = 2048;
export const MAX_STACK_PER_GROUP = 15;
const STACK_NAME_MAX = 30;

export const GROUP_LABELS: Record<TechStackGroup, string> = {
  frontend: "Frontend",
  backend: "Backend",
  tools: "Tools",
};

export const GROUP_SUGGESTIONS: Record<TechStackGroup, string[]> = {
  frontend: ["React", "TypeScript", "Next.js", "Tailwind", "Vue", "Svelte"],
  backend: ["Node.js", "NestJS", "Express", "PostgreSQL", "MongoDB", "Python"],
  tools: ["Git", "Docker", "Vite", "Figma", "VS Code"],
};

function isUrl(value: string, protocols: RegExp) {
  try {
    const url = new URL(value);
    return protocols.test(url.protocol) && url.hostname.indexOf(".") > 0;
  } catch {
    return false;
  }
}

/** An http(s) address whose hostname has a dot, e.g. https://example.com. */
export const isSiteUrl = (value: string) => isUrl(value, /^https?:$/);
export const isHttpsUrl = (value: string) => isUrl(value, /^https:$/);

/** "example.com" for "https://www.example.com/x". */
export function displayHost(link: string) {
  return isSiteUrl(link) ? new URL(link).hostname.replace(/^www\./, "") : link;
}

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Add the name people will see on your profile.")
    .max(DISPLAY_NAME_MAX, `Keep it under ${DISPLAY_NAME_MAX} characters.`),
  bio: z.string().trim().max(BIO_MAX, `Keep your bio under ${BIO_MAX} characters.`),
  avatarUrl: z
    .string()
    .trim()
    .max(URL_MAX, "That address is too long.")
    .refine((v) => !v || isHttpsUrl(v), "Enter the image's full address, starting with https://"),
  websiteUrl: z
    .string()
    .trim()
    .max(URL_MAX, "That address is too long.")
    .refine((v) => !v || isSiteUrl(v), "Enter the full link, starting with https://"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** Tries to add one name to a stack group. null means there was nothing to add (blank input). */
export function tryAddStackName(names: string[], raw: string): { names: string[]; added: string } | { error: string } | null {
  const name = raw.replace(/\s+/g, " ").trim();
  if (!name) return null;
  if (name.length > STACK_NAME_MAX) return { error: `Keep each name under ${STACK_NAME_MAX} characters.` };
  if (names.some((n) => n.toLowerCase() === name.toLowerCase())) return { error: `${name} is already added.` };
  if (names.length >= MAX_STACK_PER_GROUP) return { error: `You can add up to ${MAX_STACK_PER_GROUP} here.` };
  return { names: [...names, name], added: name };
}
