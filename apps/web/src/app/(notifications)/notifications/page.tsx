import type { Metadata } from "next";
import { NotificationsPage } from "@/features/notifications/notifications-page";

export const metadata: Metadata = {
  title: "Notifications | Shoof",
};

export default function Page() {
  return <NotificationsPage />;
}
