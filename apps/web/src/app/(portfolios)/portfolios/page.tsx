import type { Metadata } from "next";
import { PortfoliosPage } from "@/features/portfolios/portfolios-page";

export const metadata: Metadata = {
  title: "Shoof | Portfolios",
};

export default function Page() {
  return <PortfoliosPage />;
}
