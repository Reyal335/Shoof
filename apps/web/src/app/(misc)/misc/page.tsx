import type { Metadata } from "next";
import { MiscPage } from "@/features/misc/misc-page";

export const metadata: Metadata = {
  title: "Shoof | Miscellaneous",
};

export default function Page() {
  return <MiscPage />;
}
