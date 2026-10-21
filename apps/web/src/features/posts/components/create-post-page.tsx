"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { flushSync } from "react-dom";
import { Header } from "@/components/header";
import { useSession } from "@/features/auth/hooks/use-session";
import { SkillPicker } from "@/features/skills/components/skill-picker";
import type { Skill } from "@/features/skills/types";
import { describeError } from "@/lib/describe-error";
import { useCreatePost } from "../hooks/use-create-post";
import { CAPTION_MAX, MAX_POST_SKILLS, REQUIRED_FIELDS, validatePost } from "../post-form";
import type { FieldErrors, FieldName } from "../post-form";
import type { Post, PostCategory } from "../types";
import { CategoryPicker } from "./category-picker";
import { FieldError, FormSection } from "./form-section";
import { PostPreview } from "./post-preview";
import { SuccessCard } from "./success-card";
import "./create-post.css";

// The element that gets focus when a field fails, in page order.
const FOCUS_ID: Record<FieldName, string> = { category: "cat-games", link: "link", repo: "repo", caption: "caption", description: "description" };

// From design/CreatePost.html. A valid submit sends POST /api/v1/posts and shows the success card with a link to the
// new post. Screenshots wait for signed-URL uploads (the ScreenshotPicker and useScreenshots are ready for them).
export function CreatePostPage() {
  const session = useSession();
  const [category, setCategory] = useState<PostCategory | "">("");
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsAnnouncement, setSkillsAnnouncement] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [posted, setPosted] = useState<Post | null>(null);
  const { create, isPending } = useCreatePost();
  const doneTitleRef = useRef<HTMLHeadingElement>(null);

  function clearError(field: FieldName) {
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  function invalid(field: FieldName) {
    return errors[field] ? true : undefined;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    const found = validatePost({ category, link, repo, caption, description });
    const failing = REQUIRED_FIELDS.filter((f) => found[f]);
    setErrors(found);
    if (failing.length || !category) {
      setStatus(failing.length === 1 ? "Fix 1 thing above to post." : `Fix ${failing.length} things above to post.`);
      document.getElementById(FOCUS_ID[failing[0]])?.focus();
      return;
    }

    setStatus("");
    let post: Post;
    try {
      post = await create({
        category,
        link: link.trim(),
        repoUrl: repo.trim() || null,
        caption: caption.trim(),
        description: description.trim(),
        skillIds: skills.map((s) => s.id),
      });
    } catch (err) {
      setStatus(describeError(err, "post your site"));
      return;
    }
    flushSync(() => setPosted(post));
    doneTitleRef.current?.focus();
    window.scrollTo(0, 0);
  }

  function postAnother() {
    flushSync(() => {
      setCategory("");
      setLink("");
      setRepo("");
      setCaption("");
      setDescription("");
      setSkills([]);
      setSkillsAnnouncement("");
      setErrors({});
      setStatus("");
      setPosted(null);
    });
    document.getElementById(FOCUS_ID.category)?.focus();
  }

  return (
    <>
      <Header current="post" />
      <main className="wrap">
        <div hidden={posted !== null}>
          <div className="pagehead">
            <h1>Post a site</h1>
            <p>Share something you built in a browser. People will see it up front, so give it a clear caption and say what it&apos;s built with.</p>
          </div>
          {session.status === "anonymous" && (
            <p className="signin-note" role="status">
              <Link href="/login?next=/post/new">Log in</Link> to post. You can fill this in first; nothing is sent until you press Post site.
            </p>
          )}
          <div className="layout">
            <form noValidate onSubmit={onSubmit} aria-busy={isPending}>
              <CategoryPicker
                value={category}
                error={errors.category}
                onChange={(value) => {
                  setCategory(value);
                  clearError("category");
                }}
              />

              <FormSection number={2} title="The site">
                <div className="field">
                  <label htmlFor="link">Link to the live site</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://yourproject.example.com"
                    aria-describedby="link-hint link-err"
                    aria-invalid={invalid("link")}
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      clearError("link");
                    }}
                  />
                  <span className="hint" id="link-hint">The real, working address. Shoof shows this site, not the code.</span>
                  <FieldError id="link-err" message={errors.link} />
                </div>
                <div className="field">
                  <label htmlFor="repo">Repository link <span className="opt">(optional)</span></label>
                  <input
                    type="url"
                    id="repo"
                    name="repoUrl"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://github.com/you/project"
                    aria-describedby="repo-hint repo-err"
                    aria-invalid={invalid("repo")}
                    value={repo}
                    onChange={(e) => {
                      setRepo(e.target.value);
                      clearError("repo");
                    }}
                  />
                  <span className="hint" id="repo-hint">Add it if you want people to look at the code too.</span>
                  <FieldError id="repo-err" message={errors.repo} />
                </div>
              </FormSection>

              <FormSection number={3} title="Tell people about it">
                <div className="field">
                  <div className="row">
                    <label htmlFor="caption">Caption</label>
                    <span className={caption.length >= CAPTION_MAX - 10 ? "count max" : "count"} aria-hidden="true">{`${caption.length} / ${CAPTION_MAX}`}</span>
                  </div>
                  <input
                    type="text"
                    id="caption"
                    name="caption"
                    maxLength={CAPTION_MAX}
                    autoComplete="off"
                    placeholder="One line that says what it is"
                    aria-describedby="caption-hint caption-err"
                    aria-invalid={invalid("caption")}
                    value={caption}
                    onChange={(e) => {
                      setCaption(e.target.value);
                      clearError("caption");
                    }}
                  />
                  <span className="hint" id="caption-hint">{`Up to ${CAPTION_MAX} characters. This is the headline on your post.`}</span>
                  <FieldError id="caption-err" message={errors.caption} />
                </div>
                <div className="field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="What it does, why you made it and anything you want feedback on."
                    aria-describedby="description-err"
                    aria-invalid={invalid("description")}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError("description");
                    }}
                  />
                  <FieldError id="description-err" message={errors.description} />
                </div>
              </FormSection>

              <FormSection number={4} title="Tech stack" optional>
                <SkillPicker
                  id="stack"
                  label="What did you build it with?"
                  selected={skills}
                  max={MAX_POST_SKILLS}
                  hintId="stack-hint"
                  onChange={(next, message) => {
                    setSkills(next);
                    setSkillsAnnouncement(message);
                  }}
                />
                <span className="hint" id="stack-hint">{`Type to search languages, frameworks, tools and disciplines. Up to ${MAX_POST_SKILLS}. People find your post on each skill's page.`}</span>
                <div className="sr" role="status" aria-live="polite">{skillsAnnouncement}</div>
              </FormSection>

              <FormSection number={5} title="Screenshots" optional>
                <p className="hint">Screenshot uploads are coming soon. Until then your post shows a preview drawn for its section, like the one on the right.</p>
              </FormSection>

              <div className="actions">
                <button className="go" type="submit" disabled={isPending} aria-busy={isPending}>{isPending ? "Posting…" : "Post site"}</button>
                <Link className="cancel" href="/">Cancel</Link>
                <span className="status" role="status" aria-live="polite" hidden={!status}>{status}</span>
              </div>
            </form>

            <PostPreview category={category} caption={caption} description={description} link={link} techStack={skills.map((s) => s.name)} />
          </div>
        </div>

        {posted && <SuccessCard post={posted} titleRef={doneTitleRef} onPostAnother={postAnother} />}
      </main>
    </>
  );
}
