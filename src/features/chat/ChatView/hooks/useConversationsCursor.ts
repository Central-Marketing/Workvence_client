"use client";

import { useState, useEffect, useCallback } from "react";
import { QueryClient } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { isConversationUnread } from "@/utils/chatHelpers";
import { useUserStore } from "@/store/userStore";

interface UseConversationsCursorOptions {
  selectedTag?: string | null;
  queryClient: QueryClient;
}

export function useConversationsCursor({
  selectedTag,
  queryClient,
}: UseConversationsCursorOptions) {
  const initialCache = queryClient.getQueryData(["conversations"]);
  const hasInitialCache = Array.isArray(initialCache) && initialCache.length > 0;
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!hasInitialCache);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);

  // Helper to extract conversation id
  const getConvId = (conv: any): string => {
    return String(conv?._id || conv?.uuid || conv?.conversationID || conv?.id || "");
  };

  const fetchConversations = useCallback(
    async (cursor?: string | null) => {
      const isInitial = !cursor;
      const currentCache = queryClient.getQueryData(["conversations"]);
      const hasCache = Array.isArray(currentCache) && currentCache.length > 0;
      if (isInitial) {
        if (!hasCache) {
          setLoading(true);
        }
      } else {
        setIsFetchingNextPage(true);
      }

      try {
        const params = new URLSearchParams({
          paginate: "cursor",
          limit: "30",
        });
        if (cursor) params.set("before", cursor);
        if (selectedTag) params.set("tag", selectedTag);

        const { data } = await axiosFetch.get(`/conversations?${params.toString()}`);

        const currentUser = useUserStore.getState().user;
        const mergeWithExistingCache = (incomingList: any[], currentList: any[]) => {
          return incomingList.map((incoming: any) => {
            const incomingId = getConvId(incoming);
            const cached = currentList.find((c: any) => getConvId(c) === incomingId);
            const backendIsUnread = isConversationUnread(incoming, currentUser);
            const defaultUnreadCount = backendIsUnread ? 1 : 0;

            if (cached) {
              return {
                ...incoming,
                unread: !backendIsUnread ? false : (typeof cached.unread === "boolean" ? cached.unread : true),
                unreadCount: !backendIsUnread ? 0 : (typeof cached.unreadCount === "number" && cached.unreadCount > 0 ? cached.unreadCount : defaultUnreadCount),
                readBySeller: typeof cached.readBySeller === "boolean" ? cached.readBySeller : incoming.readBySeller,
                readByBuyer: typeof cached.readByBuyer === "boolean" ? cached.readByBuyer : incoming.readByBuyer,
              };
            }
            return {
              ...incoming,
              unread: backendIsUnread,
              unreadCount: !backendIsUnread ? 0 : (typeof incoming.unreadCount === "number" ? incoming.unreadCount : defaultUnreadCount),
            };
          });
        };

        if (Array.isArray(data)) {
          // Legacy plain array response fallback
          queryClient.setQueryData(["conversations"], (oldConvs: any = []) => {
            const currentList = Array.isArray(oldConvs) ? oldConvs : [];
            return mergeWithExistingCache(data, currentList);
          });
          setHasMore(false);
          setNextCursor(null);
        } else if (data && typeof data === "object") {
          const newConvs = Array.isArray(data.conversations)
            ? data.conversations
            : Array.isArray(data.data)
            ? data.data
            : [];

          queryClient.setQueryData(["conversations"], (oldConvs: any = []) => {
            const currentList = Array.isArray(oldConvs) ? oldConvs : [];
            const mergedNewConvs = mergeWithExistingCache(newConvs, currentList);
            if (isInitial) {
              return mergedNewConvs;
            }
            // Append only items not already in the list
            const existingIds = new Set(currentList.map(getConvId).filter(Boolean));
            const itemsToAdd = mergedNewConvs.filter((c: any) => !existingIds.has(getConvId(c)));
            return [...currentList, ...itemsToAdd];
          });

          setHasMore(Boolean(data.hasMore));
          setNextCursor(data.nextCursor || null);
        }
      } catch (err) {
        console.warn("Error fetching cursor conversations:", err);
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setIsFetchingNextPage(false);
        }
      }
    },
    [selectedTag, queryClient]
  );

  useEffect(() => {
    fetchConversations();

    let debounceTimer: any = null;
    const triggerDebouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchConversations();
      }, 250);
    };

    const handleRefresh = () => {
      triggerDebouncedFetch();
    };

    window.addEventListener("refresh-conversations", handleRefresh);

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.type === "updated" &&
        event.action?.type === "invalidate" &&
        Array.isArray(event.query.queryKey) &&
        event.query.queryKey[0] === "conversations"
      ) {
        triggerDebouncedFetch();
      }
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("refresh-conversations", handleRefresh);
      unsubscribe();
    };
  }, [fetchConversations, queryClient]);

  const loadMore = useCallback(() => {
    if (!loading && !isFetchingNextPage && hasMore && nextCursor) {
      fetchConversations(nextCursor);
    }
  }, [loading, isFetchingNextPage, hasMore, nextCursor, fetchConversations]);

  return {
    loading,
    isFetchingNextPage,
    hasMore,
    nextCursor,
    loadMore,
    refresh: () => fetchConversations(),
  };
}

export default useConversationsCursor;
