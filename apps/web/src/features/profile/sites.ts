/**
 * Page size for a creator's sites. The server renders the first page with this size and the browser reads the same
 * cache entry, so both must use it. Kept out of the "use client" components so server code can import the value.
 */
export const PROFILE_SITES_PAGE = 12;
