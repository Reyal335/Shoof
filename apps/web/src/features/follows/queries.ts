/** TanStack Query keys for follows. A follow or unfollow invalidates every counts entry. */
export const followKeys = {
  all: ["follows"] as const,
  status: (userId: string) => [...followKeys.all, "status", userId] as const,
  counts: () => [...followKeys.all, "counts"] as const,
  countsOf: (username: string) => [...followKeys.counts(), username] as const,
};
