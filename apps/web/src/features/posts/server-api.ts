import { cache } from "react";
import { ApiError } from "@/lib/api-client";
import { getPost } from "./api";

/**
 * A post for the server-rendered post page, or null when there is no such post (or the id isn't a UUID). `cache`
 * makes the page and its generateMetadata share one API call per request.
 */
export const getPostForPage = cache(async (id: string) => {
  try {
    return await getPost(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
});
