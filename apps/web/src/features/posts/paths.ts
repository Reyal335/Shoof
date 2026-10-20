import type { Post, PostCategory } from "./types";

/** /@username, a creator's public profile (served by the /u/[username] route through a rewrite). */
export const profileHref = (username: string) => `/@${username}`;

/**
 * A post's canonical address, /@username/posts/:id. /post/:id redirects there, so it is the fallback when the
 * author is unknown (deactivated) and for links that only hold the post id (notifications).
 */
export function postHref(post: Pick<Post, "id" | "author">): string {
  return post.author ? `/@${post.author.username}/posts/${post.id}` : `/post/${post.id}`;
}

export const CATEGORY_PATHS: Record<PostCategory, string> = {
  games: "/games",
  portfolios: "/portfolios",
  saas: "/saas",
  css_ui: "/css-ui",
  misc: "/misc",
};

/** The first image, used as the cover. Until uploads exist most posts have none and show a drawn stand-in. */
export function coverUrl(post: Pick<Post, "media">): string | null {
  return post.media.find((m) => m.type === "image")?.url ?? null;
}

/** "example.com" for "https://www.example.com/x". The API only stores valid http(s) links. */
export function hostOf(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}
