"use client";

import { useRef, useCallback, useEffect } from "react";

interface UseChatScrollOptions {
  conversationID: string;
  isValidId: boolean;
  msgsLoading: boolean;
  filteredMessages: any[];
  user: any;
}

export function useChatScroll({
  conversationID,
  isValidId,
  msgsLoading,
  filteredMessages,
  user,
}: UseChatScrollOptions) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const lastConversationIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (behavior === "auto") {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  }, []);

  const handleMessagesScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    isNearBottomRef.current = distanceFromBottom <= 150;
  }, []);

  // Auto-scroll on initial load, conversation switch, or new messages
  useEffect(() => {
    if (!isValidId) return;

    const isNewConv = lastConversationIdRef.current !== conversationID;
    if (isNewConv) {
      lastConversationIdRef.current = conversationID;
      isNearBottomRef.current = true;
    }

    if (!msgsLoading && filteredMessages.length > 0) {
      if (isNewConv) {
        scrollToBottom("auto");
        requestAnimationFrame(() => scrollToBottom("auto"));
        const timer = setTimeout(() => scrollToBottom("auto"), 100);
        return () => clearTimeout(timer);
      } else {
        const prevCount = prevMessageCountRef.current;
        const newCount = filteredMessages.length;
        if (newCount > prevCount) {
          const lastMsg = filteredMessages[filteredMessages.length - 1];
          const senderId = String(
            (typeof lastMsg?.sender === "object" && (lastMsg.sender?._id || lastMsg.sender?.id)) ||
            (typeof lastMsg?.user === "object" && (lastMsg.user?._id || lastMsg.user?.id)) ||
            (typeof lastMsg?.userID === "object" && (lastMsg.userID?._id || lastMsg.userID?.id)) ||
            lastMsg?.sender ||
            lastMsg?.user ||
            lastMsg?.userID ||
            ""
          );
          const isOwnMessage = Boolean(user?._id && String(user._id) === senderId);

          if (isOwnMessage || isNearBottomRef.current) {
            scrollToBottom("smooth");
            requestAnimationFrame(() => scrollToBottom("smooth"));
          }
        }
      }
    }
    prevMessageCountRef.current = filteredMessages.length;
  }, [conversationID, isValidId, msgsLoading, filteredMessages, scrollToBottom, user?._id]);

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
        if (isNearBottomRef.current) {
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
  };
}
