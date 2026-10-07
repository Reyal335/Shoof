import { useState } from "react";
import { ApiError, NetworkError } from "@/lib/api-client";
import { signIn, signUp, type SignUpInput } from "../api";
import { setAccessToken } from "../session";

export type SignUpFailure = { field?: "email"; message: string };

export function useSignUp({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const [failure, setFailure] = useState<SignUpFailure | null>(null);

  async function submit(input: SignUpInput) {
    setIsPending(true);
    setFailure(null);
    try {
      await signUp(input);
    } catch (err) {
      setFailure(describeError(err));
      setIsPending(false);
      return;
    }

    // The API emailed the link. Signing in is what lets "Resend email" work, since that endpoint needs
    // a session. If it fails the account still exists, so the user moves on and resend reports it.
    try {
      setAccessToken(await signIn({ email: input.email, password: input.password }));
    } catch {}

    setIsPending(false);
    onSuccess();
  }

  return { submit, isPending, failure };
}

function describeError(err: unknown): SignUpFailure {
  if (err instanceof NetworkError) {
    return { message: "We couldn't reach Shoof. Check your connection and try again." };
  }
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return { message: err.message };
      case 409:
        return { field: "email", message: "That email already has an account. Log in instead." };
      case 429:
        return { message: "Too many attempts. Wait a few minutes, then try again." };
    }
  }
  return { message: "Something went wrong on our side. Please try again." };
}
