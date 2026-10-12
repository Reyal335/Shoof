"use client";

import { useState } from "react";
import { ApiError, NetworkError } from "@/lib/api-client";
import { updateMyProfile } from "../api";
import type { Profile, ProfileUpdate } from "../types";

export function useUpdateProfile({ onSuccess }: { onSuccess: (profile: Profile) => void }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(update: ProfileUpdate) {
    setIsPending(true);
    setError(null);
    try {
      onSuccess(await updateMyProfile(update));
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsPending(false);
    }
  }

  return { submit, isPending, error, clearError: () => setError(null) };
}

function describeError(err: unknown): string {
  if (err instanceof NetworkError) {
    return "We couldn't reach Shoof. Check your connection and try again.";
  }
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return err.message;
      case 401:
        return "Your session ended. Log in again to save your changes.";
      case 429:
        return "Too many saves in a row. Wait a moment, then try again.";
    }
  }
  return "Something went wrong on our side. Your changes weren't saved. Please try again.";
}
