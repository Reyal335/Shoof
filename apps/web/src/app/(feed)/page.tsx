import type { Metadata } from "next";
import { FeedPage } from "@/features/feed/feed-page";

export const metadata: Metadata = {
  title: "Shoof | Sites people are shipping",
};

// A skill slug as the catalog writes them, e.g. "nextjs", "unreal-engine"
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ?skill=nextjs opens the feed filtered to sites built with that skill (the post page's "Built with" chips). Anything
// that isn't a slug is ignored rather than sent to the API.
export default async function Page(props: PageProps<"/">) {
  const { skill } = await props.searchParams;
  const slug = typeof skill === "string" ? skill.trim().toLowerCase() : "";
  return <FeedPage initialSkill={SLUG.test(slug) ? slug : undefined} />;
}
