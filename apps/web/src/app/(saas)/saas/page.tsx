import type { Metadata } from "next";
import { SaasPage } from "@/features/saas/saas-page";

export const metadata: Metadata = {
  title: "Shoof | SaaS and products",
};

export default function Page() {
  return <SaasPage />;
}
