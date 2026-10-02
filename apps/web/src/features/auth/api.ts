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

export function signIn(credentials: SignInCredentials): Promise<TokenPair> {
  return apiPost<TokenPair>("/auth/sign-in", credentials);
}
