import type { Metadata } from "next";
import { GamesPage } from "@/features/games/games-page";

export const metadata: Metadata = {
  title: "Shoof | Games",
};

export default function Page() {
  return <GamesPage />;
}
