const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** A non-2xx response from the API, carrying NestJS's error body when there is one. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Machine-readable reason, e.g. `mfa_required`, when the API sends one. */
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The request never got a response (API down, offline, CORS). */
export class NetworkError extends Error {
  constructor() {
    super("Network request failed");
    this.name = "NetworkError";
  }
}

type ErrorBody = { message?: string | string[]; code?: string };

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    const error: ErrorBody = await response.json().catch(() => ({}));
    // ValidationPipe sends an array of messages; show the first.
    const message = Array.isArray(error.message) ? error.message[0] : error.message;
    throw new ApiError(response.status, message ?? response.statusText, error.code);
  }

  return response.json() as Promise<T>;
}
