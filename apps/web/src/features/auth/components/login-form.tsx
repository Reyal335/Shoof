"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSignIn } from "../hooks/use-sign-in";

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-link";
const field = `h-[52px] w-full rounded-xl border-[1.5px] border-field-border bg-white px-4 text-base font-medium text-ink ${focusRing}`;
const link = `font-semibold text-link hover:text-link-hover ${focusRing}`;

const ERROR_ID = "login-error";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { submit, isPending, error } = useSignIn({ onSuccess: () => router.replace("/") });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    submit({
      email: String(data.get("email")),
      password: String(data.get("password")),
      remember: data.get("remember") === "on",
    });
  }

  const describedBy = error ? ERROR_ID : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="flex w-full max-w-[400px] flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[36px]/[40px] font-semibold tracking-[-0.8px]">
          Log in
        </h1>
        <p className="m-0 text-base text-ink-muted">
          Use your email and password to open your Shoof account.
        </p>
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
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          aria-describedby={describedBy}
          className={field}
        />
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
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Your password"
            autoComplete="current-password"
            aria-describedby={describedBy}
            className={`${field} pr-[84px]`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={`absolute top-1.5 right-1.5 h-10 cursor-pointer rounded-lg bg-transparent px-3 text-sm font-semibold text-link ${focusRing}`}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-[15px] text-ink-soft">
        <input
          type="checkbox"
          name="remember"
          className={`m-0 size-5 accent-navy ${focusRing}`}
        />
        Keep me logged in on this device
      </label>

      <button
        type="submit"
        disabled={isPending}
        className={`h-[54px] cursor-pointer rounded-xl bg-yellow font-display text-[17px] font-bold text-navy disabled:cursor-progress disabled:opacity-75 ${focusRing}`}
      >
        {isPending ? "Logging in…" : "Log in"}
      </button>

      <div className="flex items-center gap-3 text-sm text-ink-muted">
        <div className="h-px grow bg-divider" />
        <span>or</span>
        <div className="h-px grow bg-divider" />
      </div>

      {/* TODO: no Google sign-in endpoint exists in the API yet. */}
      <button
        type="button"
        className={`h-[52px] cursor-pointer rounded-xl border-[1.5px] border-navy bg-white text-base font-semibold text-navy ${focusRing}`}
      >
        Continue with Google
      </button>

      <p className="mt-1 mb-0 text-center text-[15px] text-ink-muted">
        New to Shoof?{" "}
        <Link href="/sign-up" className={link}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
