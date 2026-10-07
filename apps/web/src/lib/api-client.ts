const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string;
};

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

export async function request<T>(
  path: string,
  { method = "GET", body, accessToken }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    const error: ErrorBody = await response.json().catch(() => ({}));
    const message = Array.isArray(error.message) ? error.message[0] : error.message;
    throw new ApiError(response.status, message ?? response.statusText, error.code);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body });
}
