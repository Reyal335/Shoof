"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { BIO_MAX, isHttpsUrl, profileSchema, type ProfileFormValues } from "../profile-form";
import { TECH_STACK_GROUPS, type Profile, type TechStack } from "../types";
import { StackGroupInput } from "./stack-group-input";

type Props = {
  profile: Profile;
  open: boolean;
  onClose: () => void;
  onSaved: (profile: Profile) => void;
};

function formValues(profile: Profile): ProfileFormValues {
  return {
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    websiteUrl: profile.websiteUrl ?? "",
  };
}

const ERROR_ID = "edit-error";

/** The edit form, in a modal so the profile stays visible behind it. Nothing is saved until Save; Cancel or Esc discards. */
export function EditProfileDialog({ profile, open, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [stack, setStack] = useState<TechStack>(profile.techStack);
  const [announcement, setAnnouncement] = useState("");
  const { submit, isPending, error, clearError } = useUpdateProfile({ onSuccess: onSaved });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: formValues(profile),
  });
  const bio = useWatch({ control, name: "bio" }) ?? "";
  const avatarUrl = (useWatch({ control, name: "avatarUrl" }) ?? "").trim();

  // Each opening starts from what is stored, so a cancelled edit leaves nothing behind
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      reset(formValues(profile));
      setStack(profile.techStack);
      setAnnouncement("");
      clearError();
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    // Only the open/close transition matters here; profile changes while open come from this form's own save
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit((values) =>
    // Blank bio, avatar and website are sent as "" and stored as null
    submit({ ...values, techStack: stack }),
  );

  return (
    <dialog
      ref={dialogRef}
      className="edit"
      aria-labelledby="edit-title"
      // Esc and the browser's own close both land here
      onClose={onClose}
    >
      <form onSubmit={onSubmit} noValidate aria-busy={isPending}>
        <div className="edit-head">
          <h2 id="edit-title">Edit profile</h2>
          <button type="button" className="x" aria-label="Close without saving" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="edit-body">
          {error && (
            <p className="banner-err" id={ERROR_ID} role="alert">{error}</p>
          )}

          <div className="field">
            <label htmlFor="displayName">Creator name</label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              aria-describedby="displayName-err"
              aria-invalid={errors.displayName ? true : undefined}
              {...register("displayName")}
            />
            <span className="err" id="displayName-err" hidden={!errors.displayName}>{errors.displayName?.message}</span>
          </div>

          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={4}
              placeholder="What you build, what you're learning, what you want to work on next."
              aria-describedby="bio-count bio-err"
              aria-invalid={errors.bio ? true : undefined}
              {...register("bio")}
            />
            <span className={bio.length > BIO_MAX ? "hint over" : "hint"} id="bio-count">{`${bio.length} / ${BIO_MAX}`}</span>
            <span className="err" id="bio-err" hidden={!errors.bio}>{errors.bio?.message}</span>
          </div>

          <div className="field">
            <label htmlFor="avatarUrl">Profile photo address</label>
            <div className="avrow">
              {isHttpsUrl(avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element -- any https host is allowed, so next/image's remotePatterns can't list them
                <img className="avprev" src={avatarUrl} alt="Preview of your profile photo" />
              ) : (
                <span className="avprev" aria-hidden="true" />
              )}
              <input
                id="avatarUrl"
                type="url"
                inputMode="url"
                placeholder="https://"
                aria-describedby="avatarUrl-hint avatarUrl-err"
                aria-invalid={errors.avatarUrl ? true : undefined}
                {...register("avatarUrl")}
              />
            </div>
            <span className="hint" id="avatarUrl-hint">Paste the https:// address of an image. Leave it empty to use the default.</span>
            <span className="err" id="avatarUrl-err" hidden={!errors.avatarUrl}>{errors.avatarUrl?.message}</span>
          </div>

          <div className="field">
            <label htmlFor="websiteUrl">Website</label>
            <input
              id="websiteUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://yourname.dev"
              aria-describedby="websiteUrl-err"
              aria-invalid={errors.websiteUrl ? true : undefined}
              {...register("websiteUrl")}
            />
            <span className="err" id="websiteUrl-err" hidden={!errors.websiteUrl}>{errors.websiteUrl?.message}</span>
          </div>

          <fieldset className="stackset">
            <legend>Tech stack</legend>
            <span className="hint" id="stack-hint">Press Enter or comma to add. Backspace removes the last one.</span>
            {TECH_STACK_GROUPS.map((group) => (
              <StackGroupInput
                key={group}
                group={group}
                names={stack[group]}
                onChange={(names, message) => {
                  setStack((s) => ({ ...s, [group]: names }));
                  if (message) setAnnouncement(message);
                }}
              />
            ))}
            <div className="sr" role="status" aria-live="polite">{announcement}</div>
          </fieldset>
        </div>

        <div className="edit-foot">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="save" disabled={isPending}>{isPending ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </dialog>
  );
}
