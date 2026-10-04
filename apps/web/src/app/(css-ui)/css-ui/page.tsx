import type { Metadata } from "next";
import { CssUiPage } from "@/features/css-ui/css-ui-page";

export const metadata: Metadata = {
  title: "Shoof | CSS and UI",
};

export default function Page() {
  return <CssUiPage />;
}
