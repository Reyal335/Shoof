import type { Metadata } from "next";
import { CreatePostPage } from "@/features/posts/components/create-post-page";

export const metadata: Metadata = {
  title: "Post a site | Shoof",
};

export default function Page() {
  return <CreatePostPage />;
}
