import { useState } from "react";
import { ApiError, NetworkError } from "@/lib/api-client";
import { signIn, type SignInCredentials } from "../api";
import { saveSession } from "../session";

type SignInInput = SignInCredentials & { remember: boolean };

export function useSignIn({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit({ remember, ...credentials }: SignInInput) {
    setIsPending(true);
    setError(null);
    try {
      const tokens = await signIn(credentials);
      saveSession(tokens, { remember });
      onSuccess();
    } catch (err) {
      setError(describeError(err));
      setIsPending(false);
    }
  }

  return { submit, isPending, error };
}

function describeError(err: unknown): string {
  if (err instanceof NetworkError) {
    return "We couldn't reach Shoof. Check your connection and try again.";
  }
  if (err instanceof ApiError) {
    if (err.code === "mfa_required") {
      return "This account uses two-step verification, which isn't available on this page yet.";
    }
    switch (err.status) {
      case 400:
        return err.message;
      case 401:
        return "That email and password don't match. Check them and try again.";
      case 429:
        return "Too many attempts. Wait a few minutes, then try again.";
    }
  }
  return "Something went wrong on our side. Please try again.";
}
