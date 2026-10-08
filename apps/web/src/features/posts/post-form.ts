import type { PostCategory } from "./types";

/** Rules and copy for the create-post form, from design/CreatePost.html. Pure: no React, no DOM. */

export const CATEGORIES: { value: PostCategory; label: string; hint: string }[] = [
  { value: "games", label: "Games", hint: "Playable in the browser" },
  { value: "portfolios", label: "Portfolios", hint: "Personal sites and case studies" },
  { value: "saas", label: "SaaS", hint: "Products and tools" },
  { value: "css_ui", label: "CSS & UI", hint: "Components, layouts, effects" },
  { value: "misc", label: "Misc", hint: "Anything that fits nowhere else" },
];

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<PostCategory, string>;

export const CAPTION_MAX = 150;

export const STACK_SUGGESTIONS = ["React", "TypeScript", "JavaScript", "Node.js", "Next.js", "Tailwind", "Python", "PostgreSQL", "MongoDB", "Docker", "Vite", "Phaser", "HTML & CSS"];
export const MAX_TAGS = 15;
const MAX_TAG_LENGTH = 30;

export const MAX_SCREENSHOTS = 6;
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** An http(s) address whose hostname has a dot, e.g. https://example.com. */
export function isSiteUrl(value: string) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && url.hostname.indexOf(".") > 0;
  } catch {
    return false;
  }
}

/** "example.com" for "https://www.example.com/x", or null when the link is not a valid site URL yet. */
export function displayHost(link: string) {
  const value = link.trim();
  return isSiteUrl(value) ? new URL(value).hostname.replace(/^www\./, "") : null;
}

export function sameName(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

/** Tries to add one tech stack name. null means there was nothing to add (blank input). */
export function tryAddTag(tags: string[], raw: string): { tags: string[]; added: string } | { error: string } | null {
  const name = raw.replace(/\s+/g, " ").trim();
  if (!name) return null;
  if (name.length > MAX_TAG_LENGTH) return { error: `Keep each name under ${MAX_TAG_LENGTH} characters.` };
  if (tags.some((t) => sameName(t, name))) return { error: `${name} is already added.` };
  if (tags.length >= MAX_TAGS) return { error: `You can add up to ${MAX_TAGS}.` };
  return { tags: [...tags, name], added: name };
}

/** The fields that block posting, in page order (the first one with an error gets focus). */
export const REQUIRED_FIELDS = ["category", "link", "repo", "caption", "description"] as const;
export type FieldName = (typeof REQUIRED_FIELDS)[number];
export type FieldErrors = Partial<Record<FieldName, string>>;

export function validatePost(f: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};
  const link = f.link.trim();
  const repo = f.repo.trim();
  if (!f.category) errors.category = "Pick the section this belongs in.";
  if (!link) errors.link = "Add the link to your site.";
  else if (!isSiteUrl(link)) errors.link = "Enter the full link, starting with https://";
  if (repo && !isSiteUrl(repo)) errors.repo = "Enter the full link, starting with https://";
  if (!f.caption.trim()) errors.caption = "Add a caption.";
  if (!f.description.trim()) errors.description = "Add a short description.";
  return errors;
}
