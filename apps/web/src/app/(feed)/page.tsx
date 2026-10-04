import type { Metadata } from "next";
import { FeedPage } from "@/features/feed/feed-page";

export const metadata: Metadata = {
  title: "Shoof | Sites people are shipping",
};

export default function Page() {
  return <FeedPage />;
}
