"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSignIn } from "../hooks/use-sign-in";
import { useSession } from "../hooks/use-session";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter a valid email address, like you@example.com.")),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const field =
  "h-[52px] w-full rounded-xl border-[1.5px] border-field-border bg-white px-4 text-base font-medium text-ink aria-invalid:border-danger";
const link = "font-semibold text-link hover:text-link-hover";
const fieldError = "m-0 text-sm font-medium text-danger";

const ERROR_ID = "login-error";

export function LoginForm() {
  const router = useRouter();
  const { status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const goNext = useCallback(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (!next) {
      router.replace("/");
      return;
    }

    const url = new URL(next, window.location.origin);
    const target = url.origin === window.location.origin
      ? url.pathname + url.search
      : "/";

    router.replace(target);
  }, [router]);
  const { submit, isPending, error } = useSignIn({ onSuccess: goNext });



  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // Each input points at its own message, and at the server error when one is showing.
  function describedBy(fieldErrorId: string | false) {
    return [fieldErrorId, error && ERROR_ID].filter(Boolean).join(" ") || undefined;
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-busy={isPending}
      className="flex w-full max-w-[380px] flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[36px]/[40px] font-semibold tracking-[-0.8px]">Log in</h1>
        <p className="m-0 text-base text-ink-muted">See what people shipped while you were away.</p>
      </div>

      {error && (
        <div
          id={ERROR_ID}
          role="alert"
          className="rounded-xl border-[1.5px] border-danger bg-danger-bg px-4 py-3 text-[15px] font-medium text-danger"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy(!!errors.email && "email-error")}
          className={field}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className={fieldError}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <Link href="/forgot-password" className={`text-sm ${link}`}>
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={describedBy(!!errors.password && "password-error")}
            className={`${field} pr-[84px]`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1.5 right-1.5 h-10 rounded-lg bg-transparent px-3 text-sm font-semibold text-link"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className={fieldError}>
            {errors.password.message}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2.5 text-[15px] text-ink-soft">
        <input type="checkbox" className="m-0 size-5 accent-navy" {...register("remember")} />
        Keep me logged in on this device
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="h-[54px] rounded-xl bg-yellow font-display text-[17px] font-bold text-navy disabled:cursor-progress disabled:opacity-75"
      >
        {isPending ? "Logging in…" : "Log in"}
      </button>

      <div className="flex items-center gap-3 text-sm text-ink-muted">
        <div className="h-px grow bg-divider" />
        <span>or</span>
        <div className="h-px grow bg-divider" />
      </div>

      {/* TODO: enable once the API has a GitHub OAuth endpoint. */}
      <button
        type="button"
        disabled
        className="flex h-[52px] cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-divider bg-white text-base font-semibold text-ink-muted"
      >
        Continue with GitHub
        <span className="rounded-md bg-chip px-2 py-0.5 text-xs font-semibold text-navy">
          Coming soon
        </span>
      </button>

      <p className="mt-1 mb-0 text-center text-[15px] text-ink-muted">
        New to Shoof?{" "}
        <Link href="/register" className={link}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
