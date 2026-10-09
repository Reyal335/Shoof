import type { Theme } from "@/lib/theme";
import type { PostCategory } from "@/features/posts/types";

export type { Theme };

// The section pages, same values as the backend PostCategory, plus "all".
export type Section = "all" | PostCategory;

// Front end only for now: everything except theme lives in component state and resets on reload.
export interface SettingsState {
  theme: Theme;
  density: "comfortable" | "compact";
  landing: Section;
  feedSort: "recent" | "liked" | "trending";
  openToCollaborate: boolean;
  compactCardStack: string[]; // tags shown on compact cards
  notify: { likes: boolean; follows: boolean; comments: boolean; requests: boolean };
  reduceMotion: boolean;
  fontSize: "small" | "default" | "large";
  highContrast: boolean;
  mutedTags: string[];
}
