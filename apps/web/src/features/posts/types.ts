// Mirrors the Post entity in apps/api/src/modules/posts/entities/post.entity.ts.

// One per Shoof section page. Values match the backend enum. Do not add or rename them.
export type PostCategory = "games" | "portfolios" | "saas" | "css_ui" | "misc";

// What the person fills in. Everything else on Post (id, userId, rating, ratingCount,
// visitCount, comments, ratings, createdAt, updatedAt) is set by the server and must
// NOT appear on the create page.
export interface CreatePostValues {
  category: PostCategory; // required
  link: string; // required, https:// address of the live site
  repoUrl: string | null; // optional, null when left empty
  caption: string; // required, max 150 characters
  description: string; // required
  techStack: string[]; // optional, [] when empty
}

// Screenshots are the Media relation. Held in component state only for now.
export interface ScreenshotDraft {
  file: File;
  url: string; // URL.createObjectURL(file)
}
