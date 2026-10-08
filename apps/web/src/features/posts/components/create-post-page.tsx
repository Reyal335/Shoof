"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { flushSync } from "react-dom";
import { Header } from "@/components/header";
import { useScreenshots } from "../hooks/use-screenshots";
import { useTechStack } from "../hooks/use-tech-stack";
import { CAPTION_MAX, REQUIRED_FIELDS, validatePost } from "../post-form";
import type { FieldErrors, FieldName } from "../post-form";
import type { CreatePostValues, PostCategory, ScreenshotDraft } from "../types";
import { CategoryPicker } from "./category-picker";
import { FieldError, FormSection } from "./form-section";
import { PostPreview } from "./post-preview";
import { ScreenshotPicker } from "./screenshot-picker";
import { SuccessCard } from "./success-card";
import { TechStackInput } from "./tech-stack-input";
import "./create-post.css";

// The element that gets focus when a field fails, in page order.
const FOCUS_ID: Record<FieldName, string> = { category: "cat-games", link: "link", repo: "repo", caption: "caption", description: "description" };

// From design/CreatePost.html. Front end only: a valid submit shows the success card and sends nothing.
export function CreatePostPage() {
  const [category, setCategory] = useState<PostCategory | "">("");
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [posted, setPosted] = useState<{ values: CreatePostValues; screenshots: ScreenshotDraft[] } | null>(null);
  const stack = useTechStack();
  const shots = useScreenshots();
  const doneTitleRef = useRef<HTMLHeadingElement>(null);

  function clearError(field: FieldName) {
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  function invalid(field: FieldName) {
    return errors[field] ? true : undefined;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const techStack = stack.commitDraft({ quiet: true });
    const found = validatePost({ category, link, repo, caption, description });
    const failing = REQUIRED_FIELDS.filter((f) => found[f]);
    setErrors(found);
    if (failing.length || !category) {
      setStatus(failing.length === 1 ? "Fix 1 thing above to post." : `Fix ${failing.length} things above to post.`);
      document.getElementById(FOCUS_ID[failing[0]])?.focus();
      return;
    }
    const values: CreatePostValues = {
      category,
      link: link.trim(),
      repoUrl: repo.trim() || null,
      caption: caption.trim(),
      description: description.trim(),
      techStack,
    };
    // Later: POST /api/v1/posts with `values`, then upload `shots.items` through signed URLs. Nothing is sent yet.
    flushSync(() => {
      setStatus("");
      setPosted({ values, screenshots: shots.items });
    });
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
      setErrors({});
      setStatus("");
      stack.reset();
      shots.reset();
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
            <p>Share something you built in a browser. People will see it up front, so give it a clear caption and a screenshot or two.</p>
          </div>
          <div className="layout">
            <form noValidate onSubmit={onSubmit}>
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

              <TechStackInput stack={stack} />
              <ScreenshotPicker shots={shots} />

              <div className="actions">
                <button className="go" type="submit">Post site</button>
                <Link className="cancel" href="/">Cancel</Link>
                <span className="status" role="status" aria-live="polite" hidden={!status}>{status}</span>
              </div>
            </form>

            <PostPreview category={category} caption={caption} description={description} link={link} techStack={stack.tags} coverUrl={shots.items[0]?.url} />
          </div>
        </div>

        {posted && <SuccessCard post={posted.values} titleRef={doneTitleRef} onPostAnother={postAnother} />}
      </main>
    </>
  );
}
