import { apiPost } from "@/lib/api-client";

export type SignInCredentials = {
  email: string;
  password: string;
};

/** Mirrors `TokenPair` from @nestjs/authentication's `TokenService.issue()`. */
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
};

/** The login request. The login form reaches it through `useSignIn`; nothing else calls the endpoint. */
export function signIn(credentials: SignInCredentials): Promise<TokenPair> {
  return apiPost<TokenPair>("/auth/sign-in", credentials);
}
