"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { axiosFetch, formatBytes } from "@/utils";
import { formatFileNameWithExtension } from "../utils/chatMediaHelpers";
import { MediaFileItem } from "../types";

interface UseConversationMediaOptions {
  conversationId: string | null | undefined;
  messages?: any[];
}

export function useConversationMedia({
  conversationId,
  messages = [],
}: UseConversationMediaOptions) {
  const [serverMedia, setServerMedia] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  // Normalize server response items
  const mapServerItem = useCallback((item: any): MediaFileItem => {
    const rawUrl = item.url || item.secure_url || item.file || "";
    const rawName =
      item.name ||
      item.fileName ||
      item.originalName ||
      item.original_filename ||
      rawUrl.split("/").pop()?.split("?")[0] ||
      "Attachment";

    const cleanName = formatFileNameWithExtension(rawName, rawUrl);
    const sizeBytes = item.sizeBytes || item.size || item.bytes || 0;
    const sizeText = sizeBytes > 0 ? formatBytes(sizeBytes) : null;

    return {
      id: item.id || item._id,
      name: cleanName,
      sizeText,
      sizeBytes,
      url: rawUrl,
      mimeType: item.mimeType || item.type,
      type: item.type,
      createdAt: item.createdAt,
      messageId: item.messageId,
      sender: item.sender,
    };
  }, []);

  // Fetch initial batch
  const fetchMedia = useCallback(
    async (cursor?: string | null) => {
      if (!conversationId || conversationId === "undefined" || conversationId === "null") {
        setServerMedia([]);
        setLoading(false);
        setHasMore(false);
        setNextCursor(null);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          type: "all",
          limit: "50",
        });
        if (cursor) params.set("before", cursor);

        let data: any = null;
        try {
          const res = await axiosFetch.get(`/conversations/${conversationId}/media?${params.toString()}`);
          data = res.data;
        } catch {
          // Alias fallback if route prefix differs
          try {
            const aliasRes = await axiosFetch.get(`/conversations/${conversationId}/attachments?${params.toString()}`);
            data = aliasRes.data;
          } catch {}
        }

        if (data && (Array.isArray(data.media) || Array.isArray(data.data) || Array.isArray(data))) {
          const rawItems = Array.isArray(data.media)
            ? data.media
            : Array.isArray(data.data)
            ? data.data
            : data;

          const mapped = rawItems.map(mapServerItem);

          setServerMedia((prev) => (cursor ? [...prev, ...mapped] : mapped));
          setHasMore(Boolean(data.hasMore));
          setNextCursor(data.nextCursor || null);
          setTotal(typeof data.total === "number" ? data.total : mapped.length);
        } else {
          // If endpoint returns non-standard format or error, keep previous or empty
          if (!cursor) setServerMedia([]);
        }
      } catch (err) {
        console.warn("Could not fetch media gallery from server:", err);
      } finally {
        setLoading(false);
      }
    },
    [conversationId, mapServerItem]
  );

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && nextCursor) {
      fetchMedia(nextCursor);
    }
  }, [loading, hasMore, nextCursor, fetchMedia]);

  // Extract media from in-memory messages for optimistic updates or fallback
  const inMemoryMedia = useMemo<MediaFileItem[]>(() => {
    const seenUrls = new Set<string>();
    return (messages || []).flatMap((m: any) => {
      const items: MediaFileItem[] = [];
      const parseItem = (item: any) => {
        if (!item) return;
        if (typeof item === "string" && item.trim().length > 0) {
          if (seenUrls.has(item)) return;
          seenUrls.add(item);

          const meta = Array.isArray(m.attachmentMeta)
            ? m.attachmentMeta.find((metaItem: any) => metaItem?.url === item)
            : null;

          const rawName =
            meta?.name ||
            m.attachment?.name ||
            m.fileName ||
            m.name ||
            m.originalName ||
            item.split("/").pop()?.split("?")[0] ||
            "Attachment";

          const rawSize = meta?.size || m.fileSize || m.size || m.bytes || m.attachment?.size;
          const sizeBytes = typeof rawSize === "number" ? rawSize : 0;

          items.push({
            name: formatFileNameWithExtension(rawName, item, null, m),
            sizeText: sizeBytes > 0 ? formatBytes(sizeBytes) : null,
            sizeBytes,
            url: item,
            createdAt: m.createdAt,
            messageId: m._id || m.id,
            sender: m.sender,
          });
        } else if (typeof item === "object" && (item.url || item.file || item.secure_url)) {
          const url = item.url || item.file || item.secure_url;
          if (typeof url === "string" && url.trim().length > 0) {
            if (seenUrls.has(url)) return;
            seenUrls.add(url);

            const meta = Array.isArray(m.attachmentMeta)
              ? m.attachmentMeta.find((metaItem: any) => metaItem?.url === url)
              : null;

            const rawName =
              meta?.name ||
              item.name ||
              item.fileName ||
              item.original_filename ||
              m.attachment?.name ||
              m.fileName ||
              m.name ||
              url.split("/").pop()?.split("?")[0] ||
              "Attachment";

            const rawSize = meta?.size || item.size || item.bytes || m.fileSize || m.size || m.bytes;
            const sizeBytes = typeof rawSize === "number" ? rawSize : 0;

            items.push({
              name: formatFileNameWithExtension(rawName, url, null, m),
              sizeText: sizeBytes > 0 ? formatBytes(sizeBytes) : null,
              sizeBytes,
              url,
              createdAt: m.createdAt,
              messageId: m._id || m.id,
              sender: m.sender,
            });
          }
        }
      };

      if (m.attachment) parseItem(m.attachment);
      if (Array.isArray(m.attachments)) m.attachments.forEach(parseItem);
      if (Array.isArray(m.attachmentMeta)) m.attachmentMeta.forEach(parseItem);
      if (m.file) parseItem(m.file);
      if (m.mediaUrl) parseItem(m.mediaUrl);

      return items;
    });
  }, [messages]);

  // Combined media list: server media prioritized + any recent optimistic message attachments
  const combinedMedia = useMemo<MediaFileItem[]>(() => {
    if (serverMedia.length === 0) {
      return inMemoryMedia;
    }

    const seenUrls = new Set<string>();
    const result: MediaFileItem[] = [];

    // Add server media items first
    for (const item of serverMedia) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        result.push(item);
      }
    }

    // Append any optimistic in-memory attachments not yet in server list
    for (const item of inMemoryMedia) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        result.push(item);
      }
    }

    return result;
  }, [serverMedia, inMemoryMedia]);

  return {
    media: combinedMedia,
    loading,
    hasMore,
    total: Math.max(total, combinedMedia.length),
    loadMore,
    refresh: () => fetchMedia(),
  };
}

export default useConversationMedia;
