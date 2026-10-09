"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { plural } from "@/lib/plural";
import { useTheme } from "@/lib/theme";
import { ChipInput } from "./components/chip-input";
import { ChipPicker } from "./components/chip-picker";
import { RadioGroup, Select } from "./components/choice-fields";
import type { ChoiceOption } from "./components/choice-fields";
import { SaveStatus } from "./components/save-status";
import { SegmentedControl } from "./components/segmented-control";
import { SettingRow } from "./components/setting-row";
import { SettingsNav } from "./components/settings-nav";
import { Switch } from "./components/switch";
import type { SettingsState, Theme } from "./types";
import "./settings.css";

// How long "Saved: …" stays up before the pill goes back to "All changes saved".
const SAVED_MS = 2600;

// Theme comes from the shared theme store (it outlives the page); everything else starts here on each visit.
const DEFAULTS: Omit<SettingsState, "theme"> = {
  density: "comfortable",
  landing: "all",
  feedSort: "recent",
  openToCollaborate: true,
  compactCardStack: ["React", "TypeScript", "Next.js"],
  notify: { likes: false, follows: true, comments: true, requests: true },
  reduceMotion: false,
  fontSize: "default",
  highContrast: false,
  mutedTags: [],
};

const SECTIONS = [
  { id: "display", label: "Display & browsing" },
  { id: "profile", label: "Profile & visibility" },
  { id: "notifications", label: "Notifications" },
  { id: "accessibility", label: "Accessibility" },
  { id: "content", label: "Content" },
];

const THEMES: ChoiceOption<Theme>[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];
const DENSITIES: ChoiceOption<SettingsState["density"]>[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];
const LANDINGS: ChoiceOption<SettingsState["landing"]>[] = [
  { value: "all", label: "All sites" },
  { value: "games", label: "Games" },
  { value: "portfolios", label: "Portfolios" },
  { value: "saas", label: "SaaS" },
  { value: "css_ui", label: "CSS & UI" },
  { value: "misc", label: "Misc" },
];
const SORTS: ChoiceOption<SettingsState["feedSort"]>[] = [
  { value: "recent", label: "Recent" },
  { value: "liked", label: "Most liked" },
  { value: "trending", label: "Trending" },
];
const FONT_SIZES: ChoiceOption<SettingsState["fontSize"]>[] = [
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
];
const VISIBILITY: ChoiceOption<"public" | "followers">[] = [
  { value: "public", label: "Public" },
  { value: "followers", label: "Followers only" },
];
const DIGESTS: ChoiceOption<"immediate" | "daily" | "weekly" | "off">[] = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "off", label: "Off" },
];
const STACK = ["React", "TypeScript", "Tailwind", "Next.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "Docker", "Git", "Vite"];

const NOTIFY_NAMES: Record<keyof SettingsState["notify"], string> = {
  likes: "Like notifications",
  follows: "Follow notifications",
  comments: "Comment notifications",
  requests: "Collaboration request notifications",
};

// From design/Settings.html. Every change applies at once and shows in the save pill; only Theme is stored.
export function SettingsPage() {
  const { theme, setTheme, clearTheme } = useTheme();
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  // Reduce motion turns off every transition on the page (the CSS also follows prefers-reduced-motion).
  useEffect(() => {
    document.body.classList.toggle("rm", settings.reduceMotion);
    return () => document.body.classList.remove("rm");
  }, [settings.reduceMotion]);

  function save(message: string) {
    clearTimeout(savedTimer.current);
    setSaved(message);
    savedTimer.current = setTimeout(() => setSaved(null), SAVED_MS);
  }

  function update<K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K], message: string) {
    setSettings((s) => ({ ...s, [key]: value }));
    save(message);
  }

  function toggleNotify(key: keyof SettingsState["notify"], on: boolean) {
    update("notify", { ...settings.notify, [key]: on }, `${NOTIFY_NAMES[key]} ${on ? "on" : "off"}`);
  }

  const stackCount = settings.compactCardStack.length;

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="pagehead">
          <div>
            <h1>Settings</h1>
            <p>Choose how Shoof looks and behaves for you. Changes save as you make them.</p>
          </div>
          <SaveStatus message={saved} />
        </div>
        <div className="sgrid">
          <SettingsNav sections={SECTIONS} />
          <div className="groups">
            <section className="group" id="display" aria-labelledby="h-display">
              <h2 id="h-display">Display &amp; browsing</h2>
              <h3>Appearance</h3>
              <SettingRow title="Theme" titleId="l-theme" description="Light, dark, or match your device. Your choice applies across Shoof." descriptionId="d-theme">
                <SegmentedControl
                  id="theme"
                  labelledBy="l-theme"
                  describedBy="d-theme"
                  options={THEMES}
                  value={theme}
                  onChange={(o) => {
                    if (o.value === "system") clearTheme();
                    else setTheme(o.value);
                    save(`Theme set to ${o.label}`);
                  }}
                />
              </SettingRow>
              <SettingRow title="Card density" titleId="l-density" description="Compact fits more cards on screen." descriptionId="d-density">
                <SegmentedControl
                  id="density"
                  labelledBy="l-density"
                  describedBy="d-density"
                  options={DENSITIES}
                  value={settings.density}
                  onChange={(o) => update("density", o.value, `Card density set to ${o.label}`)}
                />
              </SettingRow>
              <h3>Browsing</h3>
              <SettingRow title="Default landing section" htmlFor="landing" description="The page you see first when you open Shoof." descriptionId="d-landing">
                <Select
                  id="landing"
                  describedBy="d-landing"
                  options={LANDINGS}
                  value={settings.landing}
                  onChange={(o) => update("landing", o.value, `Landing section set to ${o.label}`)}
                />
              </SettingRow>
              <SettingRow title="Default feed sort" htmlFor="sort" description="How the home feed is ordered when you open it." descriptionId="d-sort">
                <Select
                  id="sort"
                  describedBy="d-sort"
                  options={SORTS}
                  value={settings.feedSort}
                  onChange={(o) => update("feedSort", o.value, `Feed sort set to ${o.label}`)}
                />
              </SettingRow>
              <SettingRow
                title="Preview behavior"
                htmlFor="preview"
                description="On: live previews play as they scroll into view. Off: they load when you click. Arrives with live embeds."
                descriptionId="d-preview"
                comingSoon
              >
                <Switch id="preview" describedBy="d-preview" on={false} />
              </SettingRow>
            </section>

            <section className="group" id="profile" aria-labelledby="h-profile">
              <h2 id="h-profile">Profile &amp; visibility</h2>
              <h3>Profile</h3>
              <SettingRow
                title="Profile visibility"
                titleId="l-visibility"
                description="Who can see your profile and the sites you post. Arrives with accounts."
                descriptionId="d-visibility"
                comingSoon
              >
                <RadioGroup name="vis" labelledBy="l-visibility" describedBy="d-visibility" options={VISIBILITY} value="public" />
              </SettingRow>
              <SettingRow
                title="Collaboration"
                titleId="l-collab"
                plainTitle
                description="Shows the Open to collaborate badge on your profile and cards, and lists you in the Creators filter."
                descriptionId="d-collab"
              >
                <label className="check">
                  <input
                    type="checkbox"
                    id="collab"
                    aria-describedby="d-collab"
                    checked={settings.openToCollaborate}
                    onChange={(e) => update("openToCollaborate", e.target.checked, e.target.checked ? "Open to collaborate" : "Not open to collaborate")}
                  />{" "}
                  Open to collaborate
                </label>
              </SettingRow>
              <h3>Cards</h3>
              <SettingRow
                title="Tech stack tags on compact cards"
                titleId="l-stack"
                plainTitle
                description="Pick which of your stack tags appear on your cards in compact view."
                descriptionId="d-stack"
                stacked
                aside={<span className="count" id="stack-count">{plural(stackCount, "tag selected", "tags selected")}</span>}
              >
                <ChipPicker
                  id="stack"
                  labelledBy="l-stack"
                  describedBy="d-stack"
                  options={STACK}
                  selected={settings.compactCardStack}
                  onToggle={(tag, on) => {
                    const next = STACK.filter((t) => (t === tag ? on : settings.compactCardStack.includes(t)));
                    update("compactCardStack", next, `${tag} ${on ? "shown on" : "hidden from"} compact cards`);
                  }}
                />
              </SettingRow>
            </section>

            <section className="group" id="notifications" aria-labelledby="h-notifications">
              <h2 id="h-notifications">Notifications</h2>
              <h3>Activity</h3>
              <SettingRow title="Likes" htmlFor="likes" description="When someone likes a site you posted." descriptionId="d-likes">
                <Switch id="likes" describedBy="d-likes" on={settings.notify.likes} onChange={(on) => toggleNotify("likes", on)} />
              </SettingRow>
              <SettingRow title="Follows" htmlFor="follows" description="When someone follows you." descriptionId="d-follows">
                <Switch id="follows" describedBy="d-follows" on={settings.notify.follows} onChange={(on) => toggleNotify("follows", on)} />
              </SettingRow>
              <SettingRow title="Comments" htmlFor="comments" description="When someone comments on one of your sites." descriptionId="d-comments">
                <Switch id="comments" describedBy="d-comments" on={settings.notify.comments} onChange={(on) => toggleNotify("comments", on)} />
              </SettingRow>
              <SettingRow title="Collaboration requests" htmlFor="requests" description="When someone asks to build something with you." descriptionId="d-requests">
                <Switch id="requests" describedBy="d-requests" on={settings.notify.requests} onChange={(on) => toggleNotify("requests", on)} />
              </SettingRow>
              <h3>Email</h3>
              <SettingRow
                title="Digest frequency"
                htmlFor="digest"
                description="A summary of your activity by email. Arrives with email notifications."
                descriptionId="d-digest"
                comingSoon
              >
                <Select id="digest" describedBy="d-digest" options={DIGESTS} value="weekly" />
              </SettingRow>
            </section>

            <section className="group" id="accessibility" aria-labelledby="h-accessibility">
              <h2 id="h-accessibility">Accessibility</h2>
              <h3>Motion</h3>
              <SettingRow
                title="Reduce motion"
                htmlFor="motion"
                description="Turns off animations across Shoof. If your device is already set to reduce motion, Shoof follows that automatically."
                descriptionId="d-motion"
              >
                <Switch
                  id="motion"
                  describedBy="d-motion"
                  on={settings.reduceMotion}
                  onChange={(on) => update("reduceMotion", on, `Reduce motion ${on ? "on" : "off"}`)}
                />
              </SettingRow>
              <h3>Text and contrast</h3>
              <SettingRow title="Font size" titleId="l-fontsize" description="The size of text across Shoof." descriptionId="d-fontsize">
                <SegmentedControl
                  id="fontsize"
                  labelledBy="l-fontsize"
                  describedBy="d-fontsize"
                  options={FONT_SIZES}
                  value={settings.fontSize}
                  onChange={(o) => update("fontSize", o.value, `Font size set to ${o.label}`)}
                />
              </SettingRow>
              <SettingRow title="High contrast mode" htmlFor="contrast" description="Stronger borders and text colors." descriptionId="d-contrast">
                <Switch
                  id="contrast"
                  describedBy="d-contrast"
                  on={settings.highContrast}
                  onChange={(on) => update("highContrast", on, `High contrast ${on ? "on" : "off"}`)}
                />
              </SettingRow>
            </section>

            <section className="group" id="content" aria-labelledby="h-content">
              <h2 id="h-content">Content</h2>
              <h3>Filters</h3>
              <SettingRow
                title="Mature content filter"
                htmlFor="mature"
                description="Hide posts marked as mature. Arrives once the content policy is final."
                descriptionId="d-mature"
                comingSoon
              >
                <Switch id="mature" describedBy="d-mature" on={false} />
              </SettingRow>
              <h3>Muted</h3>
              <SettingRow
                title="Muted tags and stacks"
                htmlFor="mute-input"
                description="Posts that use a muted tag or stack won't show in your feed."
                descriptionId="d-mute"
                stacked
              >
                <ChipInput
                  name="mute"
                  describedBy="d-mute"
                  placeholder="Type a tag, like jQuery or Web3"
                  tags={settings.mutedTags}
                  onAdd={(tag) => update("mutedTags", [...settings.mutedTags, tag], `${tag} muted`)}
                  onRemove={(tag) => update("mutedTags", settings.mutedTags.filter((t) => t !== tag), `${tag} unmuted`)}
                />
              </SettingRow>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
