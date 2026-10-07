import { useState } from "react";
import { ApiError, NetworkError } from "@/lib/api-client";
import { resendVerification } from "../api";

export type ResendStatus = "idle" | "pending" | "sent" | "verified" | "signed-out" | "failed";

/** Asks the API for a fresh verification link. Needs a session: the endpoint sends to the signed-in user. */
export function useResendVerification() {
  const [status, setStatus] = useState<ResendStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setStatus("pending");
    setError(null);
    try {
      await resendVerification();
      setStatus("sent");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setStatus("verified");
      else if (err instanceof ApiError && err.status === 401) setStatus("signed-out");
      else {
        setError(
          err instanceof NetworkError
            ? "We couldn't reach Shoof. Check your connection and try again."
            : "We couldn't send the email. Please try again.",
        );
        setStatus("failed");
      }
    }
  }

  return { resend, status, error };
}
