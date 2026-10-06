import type { Metadata } from "next";
import { LinkExpiredPage } from "@/features/auth/components/link-expired-page";

export const metadata: Metadata = {
  title: "Verification link expired | Shoof",
};

export default function Page() {
  return <LinkExpiredPage />;
}
