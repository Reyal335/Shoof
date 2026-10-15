import type { Metadata } from "next";
import { PostPage } from "@/features/posts/post-page/post-page";

export const metadata: Metadata = {
  title: "A tiny arcade game about a blob | Shoof",
};

// /post/:postId. Every id renders the same mock until posts are fetched; /post/new (the (post) group) wins over this
// dynamic segment because Next.js ranks static segments first.
export default function Page() {
  return <PostPage />;
}
