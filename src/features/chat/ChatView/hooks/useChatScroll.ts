"use client";

import { useRef, useCallback, useEffect, useLayoutEffect, useState } from "react";

interface UseChatScrollOptions {
  conversationID: string;
  isValidId: boolean;
  msgsLoading: boolean;
  filteredMessages: any[];
  user: any;
  hasMore?: boolean;
  isFetchingOlder?: boolean;
  onLoadOlder?: () => void;
}

export function useChatScroll({
  conversationID,
  isValidId,
  msgsLoading,
  filteredMessages,
  user,
  hasMore = false,
  isFetchingOlder = false,
  onLoadOlder,
}: UseChatScrollOptions) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const lastConversationIdRef = useRef<string | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isPrependingRef = useRef<{ oldScrollHeight: number; oldScrollTop: number } | null>(null);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadCountBelow, setUnreadCountBelow] = useState(0);
  const [isInitialScrolled, setIsInitialScrolled] = useState(false);

  const initialScrollDoneRef = useRef(false);
  const currentConvIdRef = useRef<string | null>(null);

  // Instant scroll (Frame-0) to bottom with NO smooth animation
  const scrollToBottomInstant = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
    setShowScrollBottom(false);
    setUnreadCountBelow(0);
    isNearBottomRef.current = true;
  }, []);

  // Smooth scroll used ONLY when sending a new message or clicking floating button
  const scrollToBottomSmooth = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    setShowScrollBottom(false);
    setUnreadCountBelow(0);
    isNearBottomRef.current = true;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (behavior === "auto") {
      scrollToBottomInstant();
    } else {
      scrollToBottomSmooth();
    }
  }, [scrollToBottomInstant, scrollToBottomSmooth]);

  const handleMessagesScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const nearBottom = distanceFromBottom <= 160;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottom(!nearBottom);
    if (nearBottom) {
      setUnreadCountBelow(0);
    }

    // Trigger pagination when scrolled near the top (< 100px)
    if (scrollTop < 100 && hasMore && !isFetchingOlder && onLoadOlder) {
      isPrependingRef.current = {
        oldScrollHeight: scrollHeight,
        oldScrollTop: scrollTop,
      };
      onLoadOlder();
    }
  }, [hasMore, isFetchingOlder, onLoadOlder]);

  // Scroll pinning: when older messages are prepended, adjust scrollTop so position is preserved without jump
  useLayoutEffect(() => {
    if (isPrependingRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const { oldScrollHeight, oldScrollTop } = isPrependingRef.current;
      const heightDifference = container.scrollHeight - oldScrollHeight;
      if (heightDifference > 0) {
        container.scrollTop = oldScrollTop + heightDifference;
      }
      isPrependingRef.current = null;
    }
  }, [filteredMessages]);

  // Reset initial scroll status when switching conversations
  useEffect(() => {
    if (currentConvIdRef.current !== conversationID) {
      currentConvIdRef.current = conversationID;
      initialScrollDoneRef.current = false;
      setIsInitialScrolled(false);
      lastMessageIdRef.current = null;
      prevMessageCountRef.current = 0;
      isNearBottomRef.current = true;
      setShowScrollBottom(false);
      setUnreadCountBelow(0);
    }
  }, [conversationID]);

  // Frame-0 synchronous layout jump to bottom BEFORE browser paint
  useLayoutEffect(() => {
    if (!isValidId || msgsLoading) return;

    if (filteredMessages.length === 0) {
      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        setIsInitialScrolled(true);
      }
      return;
    }

    if (!initialScrollDoneRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      initialScrollDoneRef.current = true;
      lastMessageIdRef.current = String(
        filteredMessages[filteredMessages.length - 1]?._id ||
          filteredMessages[filteredMessages.length - 1]?.id ||
          ""
      );
      prevMessageCountRef.current = filteredMessages.length;
      setIsInitialScrolled(true);

      // Re-verify on next frame in case images or fonts expanded layout height
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [conversationID, isValidId, msgsLoading, filteredMessages]);

  // Auto-scroll on NEW incoming messages after initial load is complete
  useEffect(() => {
    if (!isValidId || msgsLoading || !initialScrollDoneRef.current) return;

    if (filteredMessages.length > 0) {
      const prevCount = prevMessageCountRef.current;
      const newCount = filteredMessages.length;

      if (newCount > prevCount) {
        const lastMsg = filteredMessages[filteredMessages.length - 1];
        const currentLastId = String(lastMsg?._id || lastMsg?.id || "");

        // If the last message ID hasn't changed, older messages were prepended to the top
        const isPrepended =
          Boolean(lastMessageIdRef.current) && currentLastId === lastMessageIdRef.current;

        if (!isPrepended) {
          lastMessageIdRef.current = currentLastId;
          const senderId = String(
            (typeof lastMsg?.sender === "object" && (lastMsg.sender?._id || lastMsg.sender?.id)) ||
            (typeof lastMsg?.user === "object" && (lastMsg.user?._id || lastMsg.user?.id)) ||
            (typeof lastMsg?.userID === "object" && (lastMsg.userID?._id || lastMsg.userID?.id)) ||
            lastMsg?.sender ||
            lastMsg?.user ||
            lastMsg?.userID ||
            ""
          );
          const currentUserId = String(user?._id || user?.id || "");
          const isOwnMessage = Boolean(
            String(lastMsg?._id || lastMsg?.id || "").startsWith("temp-") ||
            Boolean(lastMsg?.tempId) ||
            (currentUserId && senderId && currentUserId === senderId)
          );

          if (isOwnMessage || isNearBottomRef.current) {
            scrollToBottomSmooth();
          } else {
            // User is scrolled up and a new message arrived from the other participant
            setUnreadCountBelow((prev) => prev + (newCount - prevCount));
            setShowScrollBottom(true);
          }
        }
      }
      prevMessageCountRef.current = filteredMessages.length;
    }
  }, [filteredMessages, isValidId, msgsLoading, scrollToBottomSmooth, user?._id, user?.id]);

  // Handle dynamic height changes (images, attachments, proposals loading asynchronously)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let prevHeight = container.scrollHeight;

    const ro = new ResizeObserver(() => {
      if (!messagesContainerRef.current) return;
      const currentHeight = messagesContainerRef.current.scrollHeight;
      if (currentHeight !== prevHeight) {
        prevHeight = currentHeight;
        if (isNearBottomRef.current && !isPrependingRef.current) {
          // Instant scroll to keep anchored to bottom without visible animation
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
    });

    Array.from(container.children).forEach((child) => ro.observe(child));
    ro.observe(container);

    return () => ro.disconnect();
  }, [filteredMessages.length, msgsLoading]);

  return {
    messagesContainerRef,
    messagesEndRef,
    scrollToBottom,
    handleMessagesScroll,
    isNearBottomRef,
    showScrollBottom,
    unreadCountBelow,
    isInitialScrolled,
  };
}
