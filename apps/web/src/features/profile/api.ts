import { authedRequest } from "@/features/auth/authed-request";
import type { Profile, ProfileUpdate } from "./types";

/** The signed-in user's own profile. */
export const getMyProfile = () => authedRequest<Profile>("/users/me/profile");

/** Saves the fields that are sent and returns the whole profile as stored. */
export const updateMyProfile = (update: ProfileUpdate) =>
  authedRequest<Profile>("/users/me/profile", { method: "PATCH", body: update });
