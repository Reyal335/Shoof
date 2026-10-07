import { apiPost, request } from "@/lib/api-client";
import { authedRequest } from "./authed-request";

export type SignInCredentials = {
  email: string;
  password: string;
};

/** Mirrors `TokenPair` from @nestjs/authentication's `TokenService.issue()`. */
export type AccessTokenResponse = {
  accessToken: string;
  tokenType: "Bearer";
  /** Seconds until the access token expires. */
  expiresIn: number;
};

export type UserProfile = {
  email: string,
  username: string,
  isActive: boolean,
  emailVerified: boolean,
  role: string,
  createdAt: Date,
  updatedAt: Date
}

/** The login request. The login form reaches it through `useSignIn`; nothing else calls the endpoint. */
export function signIn(credentials: SignInCredentials): Promise<AccessTokenResponse> {
  return apiPost<AccessTokenResponse>("/auth/sign-in", credentials);
}

export type SignUpInput = {
  username: string;
  email: string;
  password: string;
};

/** Creates the account and makes the API email the verification link. Issues no tokens. */
export function signUp(input: SignUpInput): Promise<void> {
  return apiPost<void>("/auth/sign-up", input);
}

/** The emailed link carries the token; the API burns it and marks the address verified. */
export function verifyEmail(token: string): Promise<{ email: string; emailVerified: true }> {
  return apiPost("/auth/email/verify", { token });
}

/** Emails a fresh link to the signed-in user. Rejects with 409 when the address is already verified. */
export const resendVerification = () => authedRequest<void>("/auth/email/verification", { method: "POST" });

export function getUserData<T>(accessToken: string): Promise<T> {
  return request<T>("/users/me", {
    method: "GET",
    accessToken,
  });
}

export const signOut = () => request<void>("/auth/sign-out", { method: "POST" })
export const signOutEverywhere = () => authedRequest<void>("/auth/sign-out-all", { method: "POST" })