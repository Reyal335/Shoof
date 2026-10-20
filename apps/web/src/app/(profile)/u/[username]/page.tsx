import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileActivity, getPublicProfile } from "@/features/profile/public-api";
import { PublicProfilePage } from "@/features/profile/public-profile-page";

// Served at /@username through the rewrite in next.config.ts. Rendered on the server per request so crawlers and
// link previews get the full profile.

export async function generateMetadata(props: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await props.params;
  const user = await getPublicProfile(username);
  if (!user) return { title: "Shoof | Creator not found" };

  const name = user.profile?.displayName || user.username;
  const description = user.profile?.bio ?? `${name} on Shoof`;
  return {
    title: `Shoof | ${name} (@${user.username})`,
    description,
    alternates: { canonical: `/@${user.username}` },
    openGraph: {
      type: "profile",
      title: `${name} (@${user.username})`,
      description,
      url: `/@${user.username}`,
      images: user.profile?.avatarUrl ? [user.profile.avatarUrl] : undefined,
    },
  };
}

export default async function Page(props: PageProps<"/u/[username]">) {
  const { username } = await props.params;
  const user = await getPublicProfile(username);
  if (!user) notFound();
  const { sites, counts } = await getProfileActivity(user.username);

  return <PublicProfilePage user={user} sites={sites} counts={counts} />;
}
