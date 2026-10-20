"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/use-session";
import { getUnreadCount, listNotifications, markAllNotificationsRead, setNotificationRead } from "../api";
import type { NotificationFilter, NotificationPage, NotificationView } from "../types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (filter: NotificationFilter) => [...notificationKeys.all, "list", filter] as const,
  unread: () => [...notificationKeys.all, "unread-count"] as const,
};

type Pages = InfiniteData<NotificationPage, string | undefined>;

/**
 * The header bell's number. Polls once a minute while signed in (no push yet); 0 when signed out. The
 * Notifications page's changes update it at once.
 */
export function useUnreadCount() {
  const session = useSession();
  const query = useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: getUnreadCount,
    enabled: session.isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });
  return session.isAuthenticated ? (query.data?.count ?? 0) : 0;
}

/**
 * The signed-in user's notifications, newest first, cursor-paged, with mark read/unread and mark all read. Changes
 * are optimistic: the list and the bell change at once and go back if the API refuses.
 */
export function useNotifications(filter: NotificationFilter) {
  const session = useSession();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: ({ pageParam }) => listNotifications(filter, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: session.isAuthenticated,
  });

  // Applies `change` to every cached list and moves the unread count by `delta`, returning how to undo it
  async function optimistic(change: (n: NotificationView) => NotificationView, delta: (before: NotificationView[]) => number) {
    await queryClient.cancelQueries({ queryKey: notificationKeys.all });
    const lists = queryClient.getQueriesData<Pages>({ queryKey: [...notificationKeys.all, "list"] });
    const unread = queryClient.getQueryData<{ count: number }>(notificationKeys.unread());
    const before = lists.flatMap(([, data]) => data?.pages.flatMap((p) => p.items) ?? []);
    for (const [key, data] of lists) {
      if (data) queryClient.setQueryData<Pages>(key, { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map(change) })) });
    }
    if (unread) queryClient.setQueryData(notificationKeys.unread(), { count: Math.max(0, unread.count + delta(before)) });
    return () => {
      for (const [key, data] of lists) queryClient.setQueryData(key, data);
      if (unread) queryClient.setQueryData(notificationKeys.unread(), unread);
    };
  }

  const setRead = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => setNotificationRead(id, read),
    onMutate: ({ id, read }) =>
      optimistic(
        (n) => (n.id === id ? { ...n, read } : n),
        (before) => {
          const current = before.find((n) => n.id === id);
          return !current || current.read === read ? 0 : read ? -1 : 1;
        },
      ),
    onError: (_error, _vars, undo) => undo?.(),
  });

  const markAll = useMutation({
    mutationFn: (upTo?: string) => markAllNotificationsRead(upTo),
    onMutate: (upTo) =>
      optimistic(
        (n) => (!upTo || n.createdAt <= upTo ? { ...n, read: true } : n),
        (before) => -new Set(before.filter((n) => !n.read && (!upTo || n.createdAt <= upTo)).map((n) => n.id)).size,
      ),
    onError: (_error, _vars, undo) => undo?.(),
    // The server decides exactly which ones it marked (e.g. one that arrived meanwhile)
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });

  return {
    status: session.status,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
    markRead: (id: string) => setRead.mutate({ id, read: true }),
    markUnread: (id: string) => setRead.mutate({ id, read: false }),
    markAllRead: (upTo?: string) => markAll.mutate(upTo),
  };
}
