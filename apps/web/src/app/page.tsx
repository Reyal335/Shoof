import type { Metadata } from "next";
import { FeedHeader } from "@/features/feed/components/feed-header";
import { HomeFeed } from "@/features/feed/components/home-feed";

export const metadata: Metadata = {
  title: "Shoof | Sites people are shipping",
};

export default function HomePage() {
  return (
    <>
      <FeedHeader />
      <HomeFeed />
    </>
  );
}
