import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPostForPage } from "@/features/posts/server-api";
import { coverUrl, postHref } from "@/features/posts/paths";
import { PostPage } from "@/features/posts/post-page/post-page";
import { firstLine } from "@/lib/text";

// /@username/posts/:postId, served through the rewrite in next.config.ts. Rendered on the server per request so
// crawlers and link previews get the whole post. A wrong username redirects to the post's real address.

export async function generateMetadata(props: PageProps<"/u/[username]/posts/[postId]">): Promise<Metadata> {
  const { postId } = await props.params;
  const post = await getPostForPage(postId);
  if (!post) return { title: "Shoof | Post not found" };

  const by = post.author ? ` by ${post.author.displayName}` : "";
  const description = firstLine(post.description, 160);
  const cover = coverUrl(post);
  return {
    title: `${post.caption}${by} | Shoof`,
    description,
    alternates: { canonical: postHref(post) },
    openGraph: { type: "article", title: post.caption, description, url: postHref(post), images: cover ? [cover] : undefined },
  };
}

export default async function Page(props: PageProps<"/u/[username]/posts/[postId]">) {
  const { username, postId } = await props.params;
  const post = await getPostForPage(postId);
  if (!post) notFound();
  if (!post.author || !sameUsername(post.author.username, username)) redirect(postHref(post));

  return <PostPage key={post.id} initialPost={post} />;
}

// The segment may arrive percent-encoded; a malformed escape just doesn't match
function sameUsername(actual: string, segment: string) {
  if (actual === segment) return true;
  try {
    return actual === decodeURIComponent(segment);
  } catch {
    return false;
  }
}
