import type { Metadata } from "next";
import { VerifyEmailPage } from "@/features/auth/components/verify-email-page";

export const metadata: Metadata = {
  title: "Verify your email | Shoof",
  // The link carries a single-use token in the query string; keep it out of referrers.
  referrer: "no-referrer",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <VerifyEmailPage token={typeof token === "string" ? token : undefined} />;
}
