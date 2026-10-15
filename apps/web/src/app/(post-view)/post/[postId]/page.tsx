import type { Metadata } from "next";
import { PostPlaceholderPage } from "@/features/posts/components/post-placeholder-page";

export const metadata: Metadata = {
  title: "Post | Shoof",
};

// /post/:postId. Every id renders the same mock until posts are fetched; /post/new (the (post) group) wins over this
// dynamic segment because Next.js ranks static segments first.
export default function Page() {
  return <PostPlaceholderPage />;
}
