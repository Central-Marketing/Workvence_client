"use client";

import { useState, useEffect, useCallback } from "react";
import { QueryClient } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";

interface UseConversationsCursorOptions {
  selectedTag?: string | null;
  queryClient: QueryClient;
}

export function useConversationsCursor({
  selectedTag,
  queryClient,
}: UseConversationsCursorOptions) {
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);

  // Helper to extract conversation id
  const getConvId = (conv: any): string => {
    return String(conv?._id || conv?.uuid || conv?.conversationID || conv?.id || "");
  };

  const fetchConversations = useCallback(
    async (cursor?: string | null) => {
      const isInitial = !cursor;
      if (isInitial) {
        setLoading(true);
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

        if (Array.isArray(data)) {
          // Legacy plain array response fallback
          queryClient.setQueryData(["conversations"], data);
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
            if (isInitial) {
              return newConvs;
            }
            // Append only items not already in the list
            const existingIds = new Set(currentList.map(getConvId).filter(Boolean));
            const itemsToAdd = newConvs.filter((c: any) => !existingIds.has(getConvId(c)));
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
  }, [fetchConversations]);

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
