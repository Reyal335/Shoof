import type { Metadata } from "next";
import { PostPlaceholderPage } from "@/features/posts/components/post-placeholder-page";

export const metadata: Metadata = {
  title: "Post | Shoof",
};

// Stands in for the post page (not built yet) so notification links have somewhere to land.
export default function Page() {
  return <PostPlaceholderPage />;
}
