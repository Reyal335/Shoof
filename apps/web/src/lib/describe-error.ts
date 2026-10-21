import { ApiError, NetworkError } from "./api-client";

/**
 * A sentence for a failed request. `action` finishes "Log in again to …" and "Couldn't … right now", e.g. "post",
 * "rate this site". The API's own message is shown for 400 and 403, which explain what to fix.
 */
export function describeError(err: unknown, action: string): string {
  if (err instanceof NetworkError) {
    return "We couldn't reach Shoof. Check your connection and try again.";
  }
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
      case 403:
        return err.message;
      case 401:
        return `Your session ended. Log in again to ${action}.`;
      case 404:
        return "It isn't there any more. Reload the page to see the latest.";
      case 429:
        return "Too many tries in a row. Wait a moment, then try again.";
    }
  }
  return `Couldn't ${action} right now. Please try again.`;
}
