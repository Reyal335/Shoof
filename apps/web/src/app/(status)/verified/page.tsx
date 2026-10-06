import type { Metadata } from "next";
import { VerifiedPage } from "@/features/auth/components/verified-page";

export const metadata: Metadata = {
  title: "Email verified | Shoof",
};

export default function Page() {
  return <VerifiedPage />;
}
