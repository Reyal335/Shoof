import type { Metadata } from "next";
import { CreatorsPage } from "@/features/creators/creators-page";

export const metadata: Metadata = {
  title: "Shoof | Creators",
};

export default function Page() {
  return <CreatorsPage />;
}
