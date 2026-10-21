import { ApiError, NetworkError, request } from "@/lib/api-client";
import { authedRequest } from "@/features/auth/authed-request";
import { STAR_VALUES, type CannotRateReason, type RatingDistribution, type RatingSummary, type StarValue } from "./types";

/** What went wrong, in the terms the UI cares about. */
export type RatingsErrorKind = "signed_out" | "own_post" | "not_found" | "invalid" | "network" | "server";

export class RatingsError extends Error {
  constructor(readonly kind: RatingsErrorKind, message: string) {
    super(message);
    this.name = "RatingsError";
  }
}

function toRatingsError(error: unknown): RatingsError {
  if (error instanceof RatingsError) return error;
  if (error instanceof NetworkError) return new RatingsError("network", error.message);
  if (error instanceof ApiError) {
    const kind: RatingsErrorKind =
      error.status === 401 ? "signed_out" : error.status === 403 ? "own_post" : error.status === 404 ? "not_found" : error.status === 400 ? "invalid" : "server";
    return new RatingsError(kind, error.message);
  }
  return new RatingsError("server", "Something went wrong");
}

async function wrap<T>(work: Promise<T>): Promise<T> {
  try {
    return await work;
  } catch (error) {
    throw toRatingsError(error);
  }
}

export interface RatingsClient {
  /** `signedIn` sends the access token, so myRating, canRate and reason are the viewer's. */
  getSummary(postId: string, signedIn: boolean): Promise<RatingSummary>;
  rate(postId: string, value: StarValue): Promise<RatingSummary>;
  remove(postId: string): Promise<RatingSummary>;
}

const path = (postId: string, end: "summary" | "me") => `/posts/${encodeURIComponent(postId)}/ratings/${end}`;

/** The API (NEXT_PUBLIC_API_URL), through the app's request helpers: authedRequest refreshes the session on a 401. */
export const httpRatingsClient: RatingsClient = {
  async getSummary(postId, signedIn) {
    if (!signedIn) return wrap(request<RatingSummary>(path(postId, "summary")));
    try {
      return await authedRequest<RatingSummary>(path(postId, "summary"));
    } catch (error) {
      // The session ended meanwhile: the summary is public, so ask as a visitor instead of failing
      if (error instanceof ApiError && error.status === 401) return wrap(request<RatingSummary>(path(postId, "summary")));
      throw toRatingsError(error);
    }
  },
  rate: (postId, value) => wrap(authedRequest<RatingSummary>(path(postId, "me"), { method: "PUT", body: { value } })),
  remove: (postId) => wrap(authedRequest<RatingSummary>(path(postId, "me"), { method: "DELETE" })),
};

// ---------- mock ----------

/** One write the mock received. Tests read them from window.__shoofMockWrites to check the debounce. */
export type MockWrite = { postId: string; method: "PUT" | "DELETE"; value: StarValue | null };

declare global {
  interface Window {
    __shoofMockWrites?: MockWrite[];
  }
}

const MOCK_LATENCY_MS = 600;
// The design's numbers: 128 ratings averaging 4.6
const MOCK_START: RatingDistribution = { 1: 1, 2: 3, 3: 8, 4: 24, 5: 92 };
const mockState = new Map<string, { distribution: RatingDistribution; myRating: StarValue | null }>();

function readFlag(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** localStorage["shoof-mock-reason"] = "signed_out" | "own_post" forces that state, for checking it by hand or in tests. */
function mockReason(): CannotRateReason | null {
  const reason = readFlag("shoof-mock-reason");
  return reason === "signed_out" || reason === "own_post" ? reason : null;
}

const delay = () => new Promise((done) => setTimeout(done, MOCK_LATENCY_MS));

function stateOf(postId: string) {
  let state = mockState.get(postId);
  if (!state) {
    state = { distribution: { ...MOCK_START }, myRating: null };
    mockState.set(postId, state);
  }
  return state;
}

function mockSummary(postId: string): RatingSummary {
  const { distribution, myRating } = stateOf(postId);
  const count = STAR_VALUES.reduce((total, n) => total + distribution[n], 0);
  const sum = STAR_VALUES.reduce((total, n) => total + n * distribution[n], 0);
  const reason = mockReason();
  return {
    postId,
    average: count ? Math.round((sum / count) * 100) / 100 : 0,
    count,
    distribution: { ...distribution },
    myRating: reason ? null : myRating,
    canRate: reason === null,
    reason,
  };
}

function mockWrite(postId: string, method: MockWrite["method"], value: StarValue | null) {
  window.__shoofMockWrites = [...(window.__shoofMockWrites ?? []), { postId, method, value }];
  // localStorage["shoof-mock-fail"] = "1" fails every write, to try the error state
  if (readFlag("shoof-mock-fail") === "1") throw new RatingsError("network", "Mock write failed");
  const reason = mockReason();
  if (reason) throw new RatingsError(reason, reason === "own_post" ? "You can't rate your own site." : "Not signed in");
  const state = stateOf(postId);
  if (state.myRating !== null) state.distribution[state.myRating]--;
  if (value !== null) state.distribution[value]++;
  state.myRating = value;
}

/**
 * In-memory ratings starting from the design's numbers, about 600ms per call. Used for the demo post (/post/demo) and
 * whenever NEXT_PUBLIC_USE_MOCK_API is "true", so the rating UI works with no API.
 */
export const mockRatingsClient: RatingsClient = {
  async getSummary(postId) {
    await delay();
    return mockSummary(postId);
  },
  async rate(postId, value) {
    await delay();
    mockWrite(postId, "PUT", value);
    return mockSummary(postId);
  },
  async remove(postId) {
    await delay();
    mockWrite(postId, "DELETE", null);
    return mockSummary(postId);
  },
};

/** The demo post's id. /post/demo renders a fixed post whose ratings come from the mock. */
export const DEMO_POST_ID = "demo";

export function ratingsClientFor(postId: string): RatingsClient {
  return postId === DEMO_POST_ID || process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ? mockRatingsClient : httpRatingsClient;
}
