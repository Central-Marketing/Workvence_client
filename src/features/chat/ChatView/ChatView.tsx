"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/toast";

import { axiosFetch, getOnlineStatus } from "@/utils";
import { getOtherUser, isConversationUnread, isTargetConversation } from "@/utils/chatHelpers";
import { useUserStore } from "@/store/userStore";
import { ChatSkeleton } from "@/components";

import { ViewingOfferDetailsState } from "./types";
import { useChatScroll, useChatSocket, useChatMessages, useConversationsCursor } from "./hooks";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { ChatHeader, MessageList, MessageComposer } from "./components/ChatWindow";
import { ChatConnectionBanner } from "./components/ChatWindow/ChatConnectionBanner";
import { ConversationList } from "./components/ConversationList";
import { ContactSidebar } from "./components/ContactSidebar";
import {
  CreateOfferModal,
  CreateMeetingModal,
  OfferDetailsModal,
  LightboxModal,
} from "./components/Modals";

export const ChatView = () => {
  const user = useUserStore((state: any) => state.user);
  const params = useParams();
  const conversationID = (params?.id || params?.conversationID) as string;
  const isValidId = Boolean(
    conversationID && conversationID !== "undefined" && conversationID !== "null"
  );
  const queryClient = useQueryClient();
  const navigate = useRouter();

  // Network and server connection status
  const { connectionState, justReconnected, reconnect } = useNetworkStatus();

  // Modals state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");
  const [offerRevisions, setOfferRevisions] = useState<number | string>(0);
  const [viewingOfferDetails, setViewingOfferDetails] = useState<ViewingOfferDetailsState | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Search & filter state
  const [convSearchQuery, setConvSearchQuery] = useState("");
  const [convFilterTab, setConvFilterTab] = useState<"all" | "read" | "unread">("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isTagFilterMenuOpen, setIsTagFilterMenuOpen] = useState(false);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [isMsgSearchActive, setIsMsgSearchActive] = useState(false);

  // Mobile drawers
  const [isLeftSideOpen, setIsLeftSideOpen] = useState(false);
  const [isRightSideOpen, setIsRightSideOpen] = useState(false);

  // Reset tag popovers on conversation change
  useEffect(() => {
    setIsTagPopoverOpen(false);
    setIsTagFilterMenuOpen(false);
  }, [conversationID]);

  // Ensure user session is hydrated immediately even when Navbar is not rendered
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          useUserStore.getState().setUser(JSON.parse(stored));
        } catch (e) {
          console.warn("Could not parse user from localStorage:", e);
        }
      }
      axiosFetch
        .get("/auth/me")
        .then(({ data }) => {
          if (data?.user) {
            useUserStore.getState().setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Fetch conversations with cursor pagination
  const {
    loading: convsLoading,
    isFetchingNextPage: isFetchingNextConvs,
    hasMore: hasNextConvs,
    loadMore: loadMoreConvs,
  } = useConversationsCursor({
    selectedTag: selectedTagFilter,
    queryClient,
  });

  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ["conversations"],
    queryFn: () => queryClient.getQueryData(["conversations"]) || [],
    initialData: () => queryClient.getQueryData(["conversations"]) || [],
    staleTime: Infinity,
  });

  // Fetch single conversation details if needed (supports conversation ID or User ID)
  const { data: activeConvData } = useQuery({
    queryKey: ["conversation-detail", conversationID],
    queryFn: async () => {
      if (!conversationID || conversationID === "undefined" || conversationID === "null") return null;

      // 1. Direct conversation lookup
      try {
        const { data } = await axiosFetch.get(`/conversations/${conversationID}`);
        const conv = data?.conversation || data?.data || data;
        if (conv && (conv._id || conv.uuid || conv.conversationID || conv.id)) {
          return conv;
        }
      } catch {}

      // 2. If conversationID is actually a User ID, query /conversations/single
      const currentUid = user?._id || user?.id;
      if (currentUid && conversationID && String(conversationID) !== String(currentUid)) {
        try {
          const { data } = await axiosFetch.get(`/conversations/single/${conversationID}/${currentUid}`);
          const conv = data?.conversation || data?.data || data;
          if (conv && (conv._id || conv.uuid || conv.conversationID || conv.id)) {
            return conv;
          }
        } catch {}
        try {
          const { data } = await axiosFetch.get(`/conversations/single/${currentUid}/${conversationID}`);
          const conv = data?.conversation || data?.data || data;
          if (conv && (conv._id || conv.uuid || conv.conversationID || conv.id)) {
            return conv;
          }
        } catch {}
      }
      return null;
    },
    enabled: isValidId && !conversations.some((c: any) => isTargetConversation(c, conversationID)),
    staleTime: 10000,
  });

  // Sync activeConvData into conversations cache if missing
  useEffect(() => {
    if (activeConvData && (activeConvData._id || activeConvData.uuid)) {
      queryClient.setQueryData(["conversations"], (oldConvs: any = []) => {
        const list = Array.isArray(oldConvs) ? oldConvs : [];
        const exists = list.some((c: any) => isTargetConversation(c, activeConvData._id || activeConvData.uuid));
        if (!exists) {
          return [activeConvData, ...list];
        }
        return list;
      });
    }
  }, [activeConvData, queryClient]);

  // Resolve effective active conversation
  const resolvedConv = useMemo(() => {
    if (isValidId) {
      return (
        activeConvData ||
        conversations.find((c: any) => isTargetConversation(c, conversationID)) ||
        null
      );
    }
    // On /message with no ID in URL: pick first unread or first available conversation
    if (conversations.length > 0) {
      return (
        conversations.find((c: any) => isConversationUnread(c, user)) ||
        conversations[0]
      );
    }
    return null;
  }, [isValidId, conversationID, activeConvData, conversations, user]);

  const activeConversation = resolvedConv;

  const canonicalConvId = useMemo(() => {
    if (!activeConversation) return null;
    return (
      activeConversation._id ||
      activeConversation.uuid ||
      activeConversation.conversationID ||
      activeConversation.id ||
      null
    );
  }, [activeConversation]);

  const effectiveConversationId =
    canonicalConvId ||
    (conversationID !== "undefined" && conversationID !== "null" ? conversationID : "");

  const hasActiveChat = Boolean(activeConversation || effectiveConversationId);

  // Sync URL to canonical conversation ID:
  // 1. If route was /message (no ID), navigate.replace(`/message/${canonicalConvId}`)
  // 2. If route parameter was a User ID (or non-canonical), normalize it to the real conversation ID
  useEffect(() => {
    if (!canonicalConvId || canonicalConvId === "undefined" || canonicalConvId === "null") return;

    if (!isValidId) {
      navigate.replace(`/message/${canonicalConvId}`);
    } else if (conversationID && conversationID !== canonicalConvId) {
      const isCurrentIdAlias =
        conversationID === String(activeConversation?.sellerID?._id || activeConversation?.sellerID) ||
        conversationID === String(activeConversation?.buyerID?._id || activeConversation?.buyerID) ||
        isTargetConversation(activeConversation, conversationID);

      if (isCurrentIdAlias) {
        navigate.replace(`/message/${canonicalConvId}`);
      }
    }
  }, [isValidId, conversationID, canonicalConvId, activeConversation, navigate]);

  // Mark conversation as read when opened
  useEffect(() => {
    const targetToMark = canonicalConvId || conversationID;
    if (targetToMark && targetToMark !== "undefined" && targetToMark !== "null") {
      queryClient.setQueryData(["conversations"], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, targetToMark)) {
            return {
              ...c,
              readBySeller: true,
              readByBuyer: true,
            };
          }
          return c;
        });
      });
      axiosFetch.patch(`/conversations/${targetToMark}/mark-read`).catch(() => {});
    }
  }, [canonicalConvId, conversationID, queryClient]);

  const recipientUser = getOtherUser(activeConversation, user);

  // Extract recipient IDs
  const targetOtherUserId = useMemo(() => {
    if (recipientUser?._id || recipientUser?.id) return String(recipientUser._id || recipientUser.id);
    if (!activeConversation) return null;
    const currentUid = String(user?._id || user?.id || "");
    const sId = String(activeConversation.sellerID?._id || activeConversation.sellerID || "");
    const bId = String(activeConversation.buyerID?._id || activeConversation.buyerID || "");
    if (sId && sId !== currentUid) return sId;
    if (bId && bId !== currentUid) return bId;
    return null;
  }, [recipientUser, activeConversation, user]);

  const targetOtherUsername = useMemo(() => {
    if (recipientUser?.username) return recipientUser.username;
    if (!activeConversation) return null;
    const currentUsername = String(user?.username || "").toLowerCase();
    const sName = activeConversation.seller_username || activeConversation.sellerID?.username;
    const bName = activeConversation.buyer_username || activeConversation.buyerID?.username;
    if (sName && sName.toLowerCase() !== currentUsername) return sName;
    if (bName && bName.toLowerCase() !== currentUsername) return bName;
    return null;
  }, [recipientUser, activeConversation, user]);

  const fallbackRecipientId =
    !targetOtherUserId && conversationID?.length === 48
      ? conversationID.substring(0, 24) === String(user?._id || user?.id)
        ? conversationID.substring(24)
        : conversationID.substring(0, 24)
      : null;

  const resolveUserId = targetOtherUserId || fallbackRecipientId;

  // Fetch complete real user profile from backend
  const { data: fetchedProfileUser, isLoading: isFetchingTargetUser } = useQuery({
    queryKey: ["user-profile", resolveUserId],
    queryFn: () =>
      axiosFetch
        .get(`/users/${resolveUserId}`)
        .then(({ data }) => data?.user || data?.data || data)
        .catch(() => null),
    enabled: Boolean(resolveUserId && (!recipientUser?.createdAt || !recipientUser?.country)),
  });

  const finalRecipientUser =
    (fetchedProfileUser && typeof fetchedProfileUser === "object"
      ? { ...recipientUser, ...fetchedProfileUser }
      : null) ||
    recipientUser ||
    (targetOtherUsername || resolveUserId
      ? { username: targetOtherUsername || "User", _id: resolveUserId }
      : null);

  // WebSocket hook: online presence & socket room management
  const {
    onlineUsers,
    isRecipientTyping,
    activeRoomID,
    stopTypingIndicator,
    handleTypingKeypress,
  } = useChatSocket({
    user,
    conversationID: effectiveConversationId,
    isValidId: hasActiveChat,
    activeConversation,
    queryClient,
  });

  const socketIsRecipientOnline = Boolean(
    finalRecipientUser &&
      onlineUsers?.some((u: any) => {
        const uId = String(typeof u === "string" ? u : u?.userId || u?._id || u?.id || "");
        const rId = String(finalRecipientUser?._id || finalRecipientUser?.id || "");
        return Boolean(uId && rId && uId === rId);
      })
  );

  const recipientStatus = getOnlineStatus(
    finalRecipientUser?.lastActiveAt ||
      finalRecipientUser?.updatedAt ||
      finalRecipientUser?.lastSeen,
    socketIsRecipientOnline,
    10
  );

  // Fetch all orders
  const { data: allOrders = [] } = useQuery({
    queryKey: ["orders-all"],
    queryFn: () =>
      axiosFetch
        .get("/orders")
        .then(({ data }) => (Array.isArray(data) ? data : data?.orders || data?.data || []))
        .catch(() => []),
  });

  const contactOrders = useMemo(() => {
    return allOrders.filter((o: any) => {
      const sId = String(o.sellerID?._id || o.sellerID || "");
      const bId = String(o.buyerID?._id || o.buyerID || "");
      const currentUserId = String(user?._id || user?.id || "");
      const targetUserId = String(
        finalRecipientUser?._id || finalRecipientUser?.id || recipientUser?._id || ""
      );
      return (
        (sId === currentUserId || bId === currentUserId) &&
        (sId === targetUserId || bId === targetUserId)
      );
    });
  }, [allOrders, user, finalRecipientUser, recipientUser]);

  // Fetch active packages for custom offer creation
  const { data: sellerPackages = [] } = useQuery({
    queryKey: ["seller-packages", user?._id || user?.id || user?.username],
    queryFn: () =>
      axiosFetch
        .get(`/gigs/seller/${user?.username || user?.id}`)
        .then(({ data }) => (Array.isArray(data) ? data : data?.gigs || data?.packages || data?.data || []))
        .catch(() => []),
    enabled: !!user?.isSeller,
  });

  // Fetch active briefs
  const { data: chatBriefs = [] } = useQuery({
    queryKey: ["chat-briefs", effectiveConversationId, conversations.length],
    queryFn: async () => {
      const activeConvDoc = conversations.find((c: any) => isTargetConversation(c, effectiveConversationId));
      const targetUser = getOtherUser(activeConvDoc, user);
      const targetUserId = targetUser?._id || targetUser?.id;
      if (!targetUserId) return [];
      const res = await axiosFetch
        .get(`/briefs/user/${targetUserId}`)
        .catch(() => axiosFetch.get(`/briefs?userId=${targetUserId}`))
        .catch(() => null);
      const data = res?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.briefs)) return data.briefs;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
    enabled: !!user?.isSeller && hasActiveChat,
  });

  // Filtered conversations
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    conversations.forEach((conv: any) => {
      if (Array.isArray(conv.tags)) {
        conv.tags.forEach((t: string) => {
          if (t && typeof t === "string" && t.trim()) tagSet.add(t.trim());
        });
      }
    });
    return Array.from(tagSet);
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv: any) => {
      const isUnread = isConversationUnread(conv, user);
      if (convFilterTab === "read" && isUnread) return false;
      if (convFilterTab === "unread" && !isUnread) return false;

      if (selectedTagFilter) {
        const convTags = Array.isArray(conv.tags) ? conv.tags : [];
        const matches = convTags.some(
          (t: string) => t.toLowerCase() === selectedTagFilter.toLowerCase()
        );
        if (!matches) return false;
      }

      if (!convSearchQuery) return true;
      const contact = getOtherUser(conv, user);
      const searchLower = convSearchQuery.toLowerCase();
      const username = (contact?.username || contact?.name || "").toLowerCase();
      const lastMsg = (conv.lastMessage || "").toLowerCase();
      return username.includes(searchLower) || lastMsg.includes(searchLower);
    });
  }, [conversations, convFilterTab, selectedTagFilter, convSearchQuery, user]);

  // Debounce global conversation search query (300ms)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(convSearchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [convSearchQuery]);

  // Server-side global conversation search across all inbox items
  const { data: serverSearchResults = [], isLoading: isSearchLoading } = useQuery({
    queryKey: ["conversations-search", debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery) return [];
      try {
        const { data } = await axiosFetch.get(
          `/conversations/search?q=${encodeURIComponent(debouncedSearchQuery)}&limit=30`
        );
        if (Array.isArray(data)) return data;
        return Array.isArray(data?.conversations)
          ? data.conversations
          : Array.isArray(data?.data)
          ? data.data
          : [];
      } catch {
        try {
          const { data } = await axiosFetch.get(
            `/conversations?search=${encodeURIComponent(debouncedSearchQuery)}&paginate=cursor&limit=30`
          );
          if (Array.isArray(data)) return data;
          return data?.conversations || [];
        } catch {
          return [];
        }
      }
    },
    enabled: Boolean(debouncedSearchQuery.length > 0),
    staleTime: 10000,
  });

  const displayedConversations = useMemo(() => {
    if (debouncedSearchQuery.length > 0) {
      if (serverSearchResults.length > 0) {
        return serverSearchResults;
      }
      return filteredConversations;
    }
    return filteredConversations;
  }, [debouncedSearchQuery, serverSearchResults, filteredConversations]);

  const scrollToBottomRef = useRef<(behavior?: ScrollBehavior) => void>(() => {});

  // Messages hook
  const {
    messages,
    msgsLoading,
    msgsError,
    filteredMessages,
    hasMore,
    isFetchingOlder,
    fetchOlderMessages,
    isAwaitingFirstReply,
    messageText,
    setMessageText,
    attachment,
    isUploadingAttachment,
    isPolishing,
    setIsPolishing,
    textareaRef,
    fileInputRef,
    isPending,
    handleFileAttachmentChange,
    handleRemoveAttachment,
    handleSend,
    handleKeyDown,
    handleInputChange,
    handleOfferSubmit,
    handleAcceptOffer,
    handleWithdraw,
    handleCreateMeeting,
    handleRetrySend,
  } = useChatMessages({
    user,
    conversationID: effectiveConversationId,
    isValidId: hasActiveChat,
    activeConversation,
    activeRoomID,
    targetOtherUserId,
    finalRecipientUser,
    sellerPackages,
    chatBriefs,
    msgSearchQuery,
    queryClient,
    stopTypingIndicator,
    handleTypingKeypress,
    selectedPackageId,
    setSelectedPackageId,
    selectedBriefId,
    setSelectedBriefId,
    offerDesc,
    setOfferDesc,
    offerPrice,
    setOfferPrice,
    offerDelivery,
    setOfferDelivery,
    offerRevisions,
    setOfferRevisions,
    setShowOfferModal,
    meetingTitle,
    setMeetingTitle,
    isCreatingMeeting,
    setIsCreatingMeeting,
    setShowMeetingModal,
    connectionState,
    onScrollToBottom: (b) => scrollToBottomRef.current?.(b),
  });

  // Auto-scroll hook
  const {
    messagesContainerRef,
    messagesEndRef,
    handleMessagesScroll,
    scrollToBottom,
    showScrollBottom,
    unreadCountBelow,
    isInitialScrolled,
  } = useChatScroll({
    conversationID: effectiveConversationId,
    isValidId: hasActiveChat,
    msgsLoading,
    filteredMessages,
    user,
    hasMore,
    isFetchingOlder,
    onLoadOlder: fetchOlderMessages,
  });

  scrollToBottomRef.current = scrollToBottom;

  const handleCopyText = (text: string, msg: string = "Copied to clipboard!") => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(msg))
      .catch(() => toast.error("Could not copy text"));
  };

  if (convsLoading && conversations.length === 0) {
    return <ChatSkeleton />;
  }

  return (
    <div className="h-full max-h-full min-h-0 bg-white flex overflow-hidden w-full flex-1">
      <div className="flex w-full h-full max-h-full min-h-0 flex-1 overflow-hidden relative">
        {/* ── LEFT: Conversation List ── */}
        <ConversationList
          isLeftSideOpen={isLeftSideOpen}
          onCloseLeftSide={() => setIsLeftSideOpen(false)}
          user={user}
          onNavigateDashboard={() => {
            const targetDashboard = user?.isSeller ? "/dashboard/seller" : "/dashboard/buyer";
            navigate.push(targetDashboard);
          }}
          convSearchQuery={convSearchQuery}
          setConvSearchQuery={setConvSearchQuery}
          convFilterTab={convFilterTab}
          setConvFilterTab={setConvFilterTab}
          selectedTagFilter={selectedTagFilter}
          setSelectedTagFilter={setSelectedTagFilter}
          allAvailableTags={allAvailableTags}
          isTagFilterMenuOpen={isTagFilterMenuOpen}
          setIsTagFilterMenuOpen={setIsTagFilterMenuOpen}
          convsLoading={debouncedSearchQuery.length > 0 ? isSearchLoading : convsLoading}
          displayedConversations={displayedConversations}
          conversationID={effectiveConversationId}
          onSelectConversation={(canonicalId) => {
            if (canonicalId) navigate.push(`/message/${canonicalId}`);
          }}
          hasNextPage={!debouncedSearchQuery && hasNextConvs}
          isFetchingNextPage={isFetchingNextConvs}
          onLoadMore={loadMoreConvs}
        />

        {/* ── CENTER: Chat Window ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white min-w-0">
          {!hasActiveChat && (!convsLoading && conversations.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white gap-3 select-none">
              <div className="w-16 h-16 rounded-[6px] bg-[#E6F7F3] text-[#0D6D5F] flex items-center justify-center shadow-2xs mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  <path d="M8 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M16 12h.01" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-sf-pro tracking-tight">
                No Messages Yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed font-normal">
                When you contact a seller or receive a message from a buyer, your conversations will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <ChatHeader
                finalRecipientUser={finalRecipientUser}
                activeConversation={activeConversation}
                conversationID={effectiveConversationId}
                isRecipientTyping={isRecipientTyping}
                isRecipientOnline={recipientStatus.isOnline}
                recipientLastSeenText={recipientStatus.lastSeenText}
                user={user}
                isTagPopoverOpen={isTagPopoverOpen}
                setIsTagPopoverOpen={setIsTagPopoverOpen}
                isMsgSearchActive={isMsgSearchActive}
                setIsMsgSearchActive={setIsMsgSearchActive}
                msgSearchQuery={msgSearchQuery}
                setMsgSearchQuery={setMsgSearchQuery}
                onOpenOfferModal={() => setShowOfferModal(true)}
                onOpenMeetingModal={() => {
                  setMeetingTitle(
                    `Job Discussion with @${finalRecipientUser?.username || "Client"}`
                  );
                  setShowMeetingModal(true);
                }}
                onOpenLeftSide={() => setIsLeftSideOpen(true)}
                onOpenRightSide={() => setIsRightSideOpen(true)}
              />

              {/* Network connection status banner (offline / reconnecting / reconnected) */}
              <ChatConnectionBanner
                connectionState={connectionState}
                justReconnected={justReconnected}
                onRetry={reconnect}
              />

              {/* Messages Stream */}
              <MessageList
                messagesContainerRef={messagesContainerRef}
                messagesEndRef={messagesEndRef}
                onScroll={handleMessagesScroll}
                msgsError={msgsError}
                msgsLoading={msgsLoading}
                filteredMessages={filteredMessages}
                hasMore={hasMore}
                isFetchingOlder={isFetchingOlder}
                isInitialScrolled={isInitialScrolled}
                msgSearchQuery={msgSearchQuery}
                user={user}
                finalRecipientUser={finalRecipientUser}
                partnerUsername={targetOtherUsername || undefined}
                contactOrders={contactOrders}
                sellerPackages={sellerPackages}
                chatBriefs={chatBriefs}
                isAwaitingFirstReply={isAwaitingFirstReply}
                isRecipientTyping={isRecipientTyping}
                onImagePreview={(url) => setLightboxImage(url)}
                onReadFullProposal={(offer, msgId, acceptedOrder, isOwner, isWithdrawn) => {
                  setViewingOfferDetails({
                    offer,
                    msgId,
                    acceptedOrder,
                    isOwner,
                    isWithdrawn,
                  });
                }}
                onViewOrder={(targetOrderId) => {
                  if (targetOrderId) navigate.push(`/orders/${targetOrderId}`);
                  else navigate.push("/orders");
                }}
                onAcceptOffer={handleAcceptOffer}
                onWithdraw={handleWithdraw}
                onCopyText={handleCopyText}
                onRetrySend={handleRetrySend}
                showScrollBottom={showScrollBottom}
                unreadCountBelow={unreadCountBelow}
                onScrollToBottom={() => scrollToBottom("smooth")}
              />

              {/* Compose Area */}
              <MessageComposer
                attachment={attachment}
                isUploadingAttachment={isUploadingAttachment}
                onFileAttachmentChange={handleFileAttachmentChange}
                onRemoveAttachment={handleRemoveAttachment}
                messageText={messageText}
                setMessageText={setMessageText}
                isPolishing={isPolishing}
                setIsPolishing={setIsPolishing}
                textareaRef={textareaRef}
                fileInputRef={fileInputRef}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                msgsError={msgsError}
                isPending={isPending}
              />
            </>
          )}
        </main>

        {/* ── RIGHT: About This Contact ── */}
        <ContactSidebar
          isValidId={isValidId}
          isRightSideOpen={isRightSideOpen}
          onCloseRightSide={() => setIsRightSideOpen(false)}
          finalRecipientUser={finalRecipientUser}
          isFetchingTargetUser={isFetchingTargetUser}
          activeConversation={activeConversation}
          conversationID={conversationID}
          isRecipientOnline={recipientStatus.isOnline}
          contactOrders={contactOrders}
          messages={messages}
          user={user}
          onOpenOfferModal={() => setShowOfferModal(true)}
          onOpenMeetingModal={() => {
            setMeetingTitle(`Job Discussion with @${finalRecipientUser?.username || "Client"}`);
            setShowMeetingModal(true);
          }}
          onNavigateToProfile={(targetId) => navigate.push(`/seller/${targetId}`)}
          onNavigateToOrder={(orderId) => {
            if (orderId) navigate.push(`/orders/${orderId}`);
            else navigate.push("/orders");
          }}
          onNavigateToAllOrders={() => {
            const targetUserId =
              finalRecipientUser?._id ||
              finalRecipientUser?.id ||
              recipientUser?._id ||
              recipientUser?.id;
            if (targetUserId) {
              navigate.push(`/orders/contact/${targetUserId}`);
            } else {
              navigate.push(user?.isSeller ? "/manage-orders" : "/orders");
            }
          }}
          onImagePreview={(url) => setLightboxImage(url)}
        />
      </div>

      {/* ── Modals Layer ── */}
      <CreateOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        sellerPackages={sellerPackages}
        chatBriefs={chatBriefs}
        selectedPackageId={selectedPackageId}
        setSelectedPackageId={setSelectedPackageId}
        selectedBriefId={selectedBriefId}
        setSelectedBriefId={setSelectedBriefId}
        offerDesc={offerDesc}
        setOfferDesc={setOfferDesc}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        offerDelivery={offerDelivery}
        setOfferDelivery={setOfferDelivery}
        offerRevisions={offerRevisions}
        setOfferRevisions={setOfferRevisions}
        onSubmit={handleOfferSubmit}
      />

      <CreateMeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        meetingTitle={meetingTitle}
        setMeetingTitle={setMeetingTitle}
        isCreatingMeeting={isCreatingMeeting}
        onSubmit={handleCreateMeeting}
      />

      <OfferDetailsModal
        details={viewingOfferDetails}
        messages={messages}
        onClose={() => setViewingOfferDetails(null)}
        onAccept={handleAcceptOffer}
        onWithdraw={handleWithdraw}
        onViewOrder={(targetOrderId) => {
          if (targetOrderId) navigate.push(`/orders/${targetOrderId}`);
          else navigate.push("/orders");
        }}
      />

      <LightboxModal
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default ChatView;