import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPostForPage } from "@/features/posts/server-api";
import { postHref } from "@/features/posts/paths";
import { PostPage } from "@/features/posts/post-page/post-page";

// /post/:postId, the short form for links that only know the post id (notifications). Redirects to the canonical
// /@username/posts/:postId; renders here only when the creator's account is gone. /post/new (the (post) group) wins
// over this dynamic segment because Next.js ranks static segments first.

export async function generateMetadata(props: PageProps<"/post/[postId]">): Promise<Metadata> {
  const { postId } = await props.params;
  const post = await getPostForPage(postId);
  return { title: post ? `${post.caption} | Shoof` : "Shoof | Post not found" };
}

export default async function Page(props: PageProps<"/post/[postId]">) {
  const { postId } = await props.params;
  const post = await getPostForPage(postId);
  if (!post) notFound();
  if (post.author) redirect(postHref(post));

  return <PostPage key={post.id} initialPost={post} />;
}
