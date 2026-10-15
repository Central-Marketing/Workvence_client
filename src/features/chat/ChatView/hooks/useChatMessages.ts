"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/toast";
import { axiosFetch, socket, getAvatarUrl, parseRevisionNumber } from "@/utils";
import { isTargetConversation } from "@/utils/chatHelpers";
import supportService from "@/utils/supportService";
import { ChatAttachment, AttachmentMetaItem } from "../types";
import { parseMeeting } from "../utils/chatMediaHelpers";

interface UseChatMessagesOptions {
  user: any;
  conversationID: string;
  isValidId: boolean;
  activeConversation: any;
  activeRoomID: string | null;
  targetOtherUserId: string | null;
  finalRecipientUser: any;
  sellerPackages: any[];
  chatBriefs: any[];
  msgSearchQuery: string;
  queryClient: QueryClient;
  stopTypingIndicator: () => void;
  handleTypingKeypress: (len: number) => void;
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  selectedBriefId: string;
  setSelectedBriefId: (id: string) => void;
  offerTitle?: string;
  setOfferTitle?: (title: string) => void;
  offerDesc: string;
  setOfferDesc: (desc: string) => void;
  offerPrice: string;
  setOfferPrice: (price: string) => void;
  offerDelivery: string;
  setOfferDelivery: (del: string) => void;
  offerRevisions: number | string;
  setOfferRevisions: (rev: number | string) => void;
  setShowOfferModal: (show: boolean) => void;
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  isCreatingMeeting: boolean;
  setIsCreatingMeeting: (creating: boolean) => void;
  setShowMeetingModal: (show: boolean) => void;
}

export function useChatMessages({
  user,
  conversationID,
  isValidId,
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
  offerTitle,
  setOfferTitle,
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
}: UseChatMessagesOptions) {
  // Composer state
  const [messageText, setMessageText] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSendingRef = useRef(false);

  // Cursor pagination state
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const nextCursorRef = useRef<string | null>(null);
  const isFetchingOlderRef = useRef(false);

  // Reset pagination state when switching conversations
  useEffect(() => {
    nextCursorRef.current = null;
    setHasMore(true);
    isFetchingOlderRef.current = false;
    setIsFetchingOlder(false);
  }, [conversationID]);

  // Fetch messages history
  const {
    isLoading: msgsLoading,
    isError: msgsError,
    data: messages = [],
  } = useQuery({
    queryKey: ["messages", conversationID],
    queryFn: async () => {
      const handleResponse = (data: any): any[] => {
        if (!data) return [];
        // Structured paginated response
        if (data.messages && Array.isArray(data.messages)) {
          nextCursorRef.current = data.nextCursor ?? null;
          setHasMore(Boolean(data.hasMore));
          return data.messages;
        }
        if (data.data?.messages && Array.isArray(data.data.messages)) {
          nextCursorRef.current = data.data.nextCursor ?? null;
          setHasMore(Boolean(data.data.hasMore));
          return data.data.messages;
        }
        // Legacy plain array fallbacks
        if (Array.isArray(data)) {
          nextCursorRef.current = null;
          setHasMore(false);
          return data;
        }
        if (Array.isArray(data?.data)) {
          nextCursorRef.current = null;
          setHasMore(false);
          return data.data;
        }
        if (Array.isArray(data?.result)) {
          nextCursorRef.current = null;
          setHasMore(false);
          return data.result;
        }
        return [];
      };

      const targetId = conversationID || activeConversation?.uuid || activeConversation?._id;
      if (!targetId) return [];

      try {
        const { data } = await axiosFetch.get(`/conversations/${targetId}/messages`, {
          params: { limit: 30 },
        });
        return handleResponse(data);
      } catch (err: any) {
        const altId = activeConversation?._id;
        if (altId && String(altId) !== String(targetId)) {
          try {
            const { data } = await axiosFetch.get(`/conversations/${altId}/messages`, {
              params: { limit: 30 },
            });
            return handleResponse(data);
          } catch {}
        }
        return [];
      }
    },
    enabled: isValidId,
    retry: false,
    staleTime: 5000,
  });

  // Fetch older messages using cursor pagination
  const fetchOlderMessages = useCallback(async () => {
    const cursor = nextCursorRef.current;
    if (!hasMore || isFetchingOlderRef.current || !cursor) return;

    const targetId = conversationID || activeConversation?.uuid || activeConversation?._id;
    if (!targetId) return;

    isFetchingOlderRef.current = true;
    setIsFetchingOlder(true);

    try {
      const { data } = await axiosFetch.get(`/conversations/${targetId}/messages`, {
        params: { limit: 30, before: cursor },
      });

      const olderMessages: any[] =
        (data && Array.isArray(data.messages) ? data.messages : null) ||
        (data?.data && Array.isArray(data.data.messages) ? data.data.messages : null) ||
        (Array.isArray(data) ? data : []) ||
        [];

      const newNextCursor = data?.nextCursor ?? data?.data?.nextCursor ?? null;
      const newHasMore = Boolean(data?.hasMore ?? data?.data?.hasMore ?? false);

      nextCursorRef.current = newNextCursor;
      setHasMore(newHasMore);

      if (olderMessages.length > 0) {
        queryClient.setQueryData(["messages", conversationID], (current: any = []) => {
          const currentArr = Array.isArray(current) ? current : [];
          const existingIds = new Set(
            currentArr.map((m: any) => String(m._id || m.id)).filter(Boolean)
          );
          const uniqueOlder = olderMessages.filter((m: any) => {
            const id = String(m._id || m.id);
            return !id || !existingIds.has(id);
          });
          return [...uniqueOlder, ...currentArr];
        });
      }
    } catch (err) {
      console.error("Failed to fetch older messages:", err);
    } finally {
      isFetchingOlderRef.current = false;
      setIsFetchingOlder(false);
    }
  }, [conversationID, activeConversation, hasMore, queryClient]);

  // Filtered messages with robust deduplication
  const filteredMessages = useMemo(() => {
    return messages
      .filter((msg: any, index: number, self: any[]) => {
        const msgId = String(msg._id || msg.id || "");
        if (msgId && !msgId.startsWith("temp-")) {
          const firstIdx = self.findIndex((m: any) => String(m._id || m.id || "") === msgId);
          if (firstIdx !== index) return false;
        }

        const text = (msg.description || msg.desc || msg.text || msg.message || "").trim();
        const fileUrl = msg.file || (Array.isArray(msg.attachments) && msg.attachments[0]) || "";
        const isTemp = !msgId || msgId.startsWith("temp-");

        if (isTemp) {
          const hasRealDuplicate = self.some((m: any, mIdx: number) => {
            if (mIdx === index) return false;
            const otherId = String(m._id || m.id || "");
            if (!otherId || otherId.startsWith("temp-")) return false;
            const otherText = (m.description || m.desc || m.text || m.message || "").trim();
            const otherFile = m.file || (Array.isArray(m.attachments) && m.attachments[0]) || "";
            return otherText === text && otherFile === fileUrl;
          });
          if (hasRealDuplicate) return false;
        }

        const senderId = String(
          (typeof msg.sender === "object" && (msg.sender?._id || msg.sender?.id)) ||
            (typeof msg.user === "object" && (msg.user?._id || msg.user?.id)) ||
            (typeof msg.userID === "object" && (msg.userID?._id || msg.userID?.id)) ||
            msg.sender ||
            msg.user ||
            msg.senderID ||
            msg.userID ||
            msg.from ||
            ""
        );

        const firstDuplicateIdx = self.findIndex((m: any) => {
          const otherText = (m.description || m.desc || m.text || m.message || "").trim();
          const otherFile = m.file || (Array.isArray(m.attachments) && m.attachments[0]) || "";
          if (otherText !== text || otherFile !== fileUrl) return false;

          const otherSenderId = String(
            (typeof m.sender === "object" && (m.sender?._id || m.sender?.id)) ||
              (typeof m.user === "object" && (m.user?._id || m.user?.id)) ||
              (typeof m.userID === "object" && (m.userID?._id || m.userID?.id)) ||
              m.sender ||
              m.user ||
              m.senderID ||
              m.userID ||
              m.from ||
              ""
          );
          if (senderId && otherSenderId && senderId !== otherSenderId) return false;

          const t1 = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
          const t2 = m.createdAt ? new Date(m.createdAt).getTime() : 0;
          if (t1 && t2 && Math.abs(t1 - t2) > 15000) return false;

          return true;
        });

        if (firstDuplicateIdx !== index) {
          const otherMsg = self[firstDuplicateIdx];
          const otherId = String(otherMsg?._id || otherMsg?.id || "");
          if (isTemp && otherId && !otherId.startsWith("temp-")) return false;
          if (firstDuplicateIdx < index) return false;
        }

        const meeting = parseMeeting(msg.meeting || msg.meetingPayload || text);
        if (meeting?.meetingId) {
          const firstMeetingIdx = self.findIndex((m: any) => {
            const mText = (m.description || m.desc || m.text || m.message || "").trim();
            const mMeeting = parseMeeting(m.meeting || m.meetingPayload || mText);
            return mMeeting?.meetingId && String(mMeeting.meetingId) === String(meeting.meetingId);
          });
          if (firstMeetingIdx !== index) return false;
        }

        return true;
      })
      .filter((msg: any) => {
        if (!msgSearchQuery) return true;
        const text = (msg.description || msg.desc || msg.text || msg.message || "").toLowerCase();
        return text.includes(msgSearchQuery.toLowerCase());
      });
  }, [messages, msgSearchQuery]);

  // Awaiting first reply detection
  const isAwaitingFirstReply = useMemo(() => {
    if (!user) return false;
    const currentUid = String(user._id || user.id || "");
    const currentUsername = String(user.username || "").toLowerCase();
    const bId = String(activeConversation?.buyerID?._id || activeConversation?.buyerID || "");
    const sId = String(activeConversation?.sellerID?._id || activeConversation?.sellerID || "");
    const isBuyerInConv = bId ? bId === currentUid : sId ? sId !== currentUid : !user.isSeller;
    if (!isBuyerInConv) return false;

    if (!Array.isArray(filteredMessages) || filteredMessages.length === 0) return false;

    let buyerMsgCount = 0;
    let sellerMsgCount = 0;

    for (const msg of filteredMessages) {
      const senderObj =
        (typeof msg.sender === "object" && msg.sender) ||
        (typeof msg.user === "object" && msg.user) ||
        (typeof msg.userID === "object" && msg.userID) ||
        (typeof msg.senderID === "object" && msg.senderID) ||
        msg.sender ||
        msg.user ||
        msg.senderID ||
        msg.userID ||
        msg.from;
      const senderIdStr = String(senderObj?._id || senderObj?.id || senderObj || "");
      const senderUsername = String(senderObj?.username || msg.username || "").toLowerCase();

      const isMyMsg = Boolean(
        (currentUid && senderIdStr && currentUid === senderIdStr) ||
          (currentUsername && senderUsername && currentUsername === senderUsername)
      );

      if (isMyMsg) buyerMsgCount++;
      else sellerMsgCount++;
    }

    return buyerMsgCount > 0 && sellerMsgCount === 0;
  }, [user, activeConversation, filteredMessages]);

  // Message mutation
  const mutation = useMutation({
    mutationFn: async (msg: any) => {
      const targetId = activeRoomID || conversationID;

      // Strict backend DTO for Call A: Send Custom Offer
      if (msg.isCustomOffer) {
        const customOfferPayload: Record<string, any> = {
          conversationUUID: targetId,
          gigID: msg.gigID ?? null,
          briefID: msg.briefID ?? null,
          isCustomOffer: true,
          customOffer: {
            title: msg.customOffer?.title || "",
            description: msg.customOffer?.description || "",
            price: Number(msg.customOffer?.price || 0),
            deliveryTimeDays: Number(msg.customOffer?.deliveryTimeDays || 3),
          },
        };

        if (
          msg.customOffer?.revisionNumber !== undefined &&
          msg.customOffer?.revisionNumber !== null &&
          msg.customOffer?.revisionNumber !== ""
        ) {
          customOfferPayload.customOffer.revisionNumber = Number(msg.customOffer.revisionNumber);
        }

        try {
          return await axiosFetch.post("/messages", customOfferPayload);
        } catch (err) {
          return await axiosFetch.post(`/conversations/${targetId}/messages`, customOfferPayload);
        }
      }

      // Normal chat messages
      const httpPayload: Record<string, any> = {
        description: msg.description || msg.desc || msg.text || msg.message || "",
      };
      if (msg.file) httpPayload.file = msg.file;
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        httpPayload.attachments = msg.attachments;
      }
      if (Array.isArray(msg.attachmentMeta) && msg.attachmentMeta.length > 0) {
        httpPayload.attachmentMeta = msg.attachmentMeta;
      }

      try {
        return await axiosFetch.post(`/conversations/${targetId}/messages`, httpPayload);
      } catch (err) {
        return await axiosFetch.post("/messages", {
          ...httpPayload,
          conversationID: targetId,
          conversationUUID: targetId,
        });
      }
    },
    onMutate: async (newMsg: any) => {
      queryClient.setQueryData(["conversations"], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        const incomingCid = String(
          newMsg?.conversationUUID ||
            newMsg?.conversationID ||
            newMsg?.uuid ||
            newMsg?.id ||
            conversationID ||
            ""
        ).trim();
        const incomingText =
          newMsg?.isCustomOffer || newMsg?.customOffer
            ? "📋 Custom Offer"
            : newMsg.description || newMsg.desc || newMsg.text || newMsg.message || "";
        return oldConvs
          .map((c: any) => {
            if (isTargetConversation(c, incomingCid)) {
              return {
                ...c,
                lastMessage: incomingText,
                updatedAt: new Date().toISOString(),
                readBySeller: user?.isSeller ? true : false,
                readByBuyer: user?.isSeller ? false : true,
              };
            }
            return c;
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      });
    },
    onSuccess: (res: any) => {
      const savedMsg = res?.data?.data || res?.data?.message || res?.data;
      const msgId = savedMsg?._id || savedMsg?.id;
      if (savedMsg && typeof savedMsg === "object" && msgId) {
        const savedText = (
          savedMsg.customOffer?.description ||
          savedMsg.description ||
          savedMsg.desc ||
          savedMsg.text ||
          savedMsg.message ||
          ""
        ).trim();
        const updateMsgCache = (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          const filtered = arr.filter((m: any) => {
            const mId = String(m._id || m.id || "");
            if (mId === String(msgId)) return false;
            if (mId.startsWith("temp-")) {
              if (m.isCustomOffer && (savedMsg.isCustomOffer || savedMsg.customOffer)) {
                return false;
              }
              const tempText = (
                m.customOffer?.description ||
                m.description ||
                m.desc ||
                m.text ||
                m.message ||
                ""
              ).trim();
              return tempText !== savedText;
            }
            return true;
          });
          return [...filtered, savedMsg];
        };
        queryClient.setQueryData(["messages", conversationID], updateMsgCache);
        if (activeRoomID && activeRoomID !== conversationID) {
          queryClient.setQueryData(["messages", activeRoomID], updateMsgCache);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["messages", conversationID] });
    },
  });

  // File upload handlers
  const handleFileAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    try {
      const uploadedData = await supportService.uploadCloudinaryFile(file);
      setAttachment(uploadedData);
    } catch (err: any) {
      toast.error(err?.message || "Attachment upload failed");
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = async () => {
    if (!attachment) return;
    const targetPublicId = attachment.public_id;
    setAttachment(null);
    if (targetPublicId) {
      try {
        await supportService.deleteCloudinaryFile(targetPublicId);
        toast.success("Attachment deleted from server", { id: "delete-file" });
      } catch (err) {
        console.warn("Failed to delete attachment:", err);
      }
    }
  };

  // Send message
  const handleSend = (e?: any) => {
    if (e) e.preventDefault();
    if (isSendingRef.current || mutation.isPending) return;
    if (!messageText.trim() && !attachment?.url) return;

    isSendingRef.current = true;
    stopTypingIndicator();

    const currentText = messageText;
    const currentAttachment = attachment;

    setMessageText("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }

    const currentUid = String(user?._id || user?.id || "");
    const currentUsername = String(user?.username || "").toLowerCase();
    const hasPriorBuyerMessage = filteredMessages.some((m: any) => {
      const sObj = m.sender || m.user || m.userID || m.senderID || m.from;
      const sId = String(sObj?._id || sObj?.id || sObj || "");
      const sUsername = String(sObj?.username || m.username || "").toLowerCase();
      return (
        (currentUid && sId === currentUid) ||
        (currentUsername && sUsername === currentUsername)
      );
    });

    if (!hasPriorBuyerMessage && !user?.isSeller) {
      toast.success("Message sent successfully", {
        description: "The seller has received your message. You’ll be notified when they reply.",
        duration: 5000,
      });
    }

    const attachmentUrl = currentAttachment?.url || currentAttachment?.secure_url || null;
    const attachmentMeta: AttachmentMetaItem[] = (currentAttachment && attachmentUrl)
      ? [
          {
            url: attachmentUrl,
            name: currentAttachment.name || "attachment",
            size: Number((currentAttachment as any).bytes || currentAttachment.size) || 0,
            type: currentAttachment.type || "application/octet-stream",
            ...(currentAttachment.public_id ? { publicId: currentAttachment.public_id } : {}),
          },
        ]
      : [];

    const attachmentObj = currentAttachment ? {
      url: attachmentUrl,
      name: currentAttachment.name,
      type: currentAttachment.type,
      size: (currentAttachment as any).bytes || currentAttachment.size,
      public_id: currentAttachment.public_id
    } : null;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      conversationID: activeRoomID || conversationID,
      userID: {
        _id: user?._id || user?.id,
        username: user?.username || "User",
        image: getAvatarUrl(user?.image, user?.username || "User"),
      },
      description: currentText,
      desc: currentText,
      text: currentText,
      message: currentText,
      file: attachmentUrl,
      attachments: attachmentUrl ? [attachmentUrl] : [],
      attachmentMeta,
      attachment: attachmentObj,
      fileName: currentAttachment?.name || null,
      originalName: currentAttachment?.name || null,
      createdAt: new Date().toISOString(),
    };

    const appendTempMessage = (oldData: any = []) => {
      const arr = Array.isArray(oldData) ? oldData : [];
      return [...arr, tempMessage];
    };

    queryClient.setQueryData(["messages", conversationID], appendTempMessage);
    if (activeRoomID && activeRoomID !== conversationID) {
      queryClient.setQueryData(["messages", activeRoomID], appendTempMessage);
    }

    const msgPayload = {
      conversationID: activeRoomID || conversationID,
      conversationUUID: activeRoomID || conversationID,
      conversationId: activeRoomID || conversationID,
      description: currentText,
      desc: currentText,
      text: currentText,
      message: currentText,
      file: attachmentUrl,
      attachments: attachmentUrl ? [attachmentUrl] : [],
      ...(attachmentMeta.length > 0 ? { attachmentMeta } : {}),
      attachment: attachmentObj,
      fileName: currentAttachment?.name || null,
      originalName: currentAttachment?.name || null,
      userID: user?._id || user?.id,
      from: user?._id || user?.id,
      to: targetOtherUserId || undefined,
      isSeller: Boolean(user?.isSeller),
    };

    mutation.mutate(msgPayload, {
      onSettled: () => {
        isSendingRef.current = false;
      },
    });

    if (socket) {
      if (!socket.connected) socket.connect();
      socket.emit("send_message", msgPayload);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setMessageText(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 144;
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 36), maxHeight)}px`;
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }

    handleTypingKeypress(value.length);
  };

  // Custom offer submit
  const handleOfferSubmit = (e: any) => {
    e.preventDefault();
    if (user?.isSuspended) {
      toast.error(
        "Account is suspended. You cannot send custom offers during restricted fulfillment mode."
      );
      return;
    }
    const hasContext = Boolean(
      (selectedPackageId && !selectedBriefId) || (!selectedPackageId && selectedBriefId)
    );
    if (!hasContext) {
      toast.error("Please select at least a Package or a Project.");
      return;
    }
    if (!offerDesc.trim() || !offerPrice || !offerDelivery) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const selectedPkg = sellerPackages.find((p: any) => (p._id || p.id) === selectedPackageId);
    const selectedBrf = chatBriefs.find((b: any) => (b._id || b.id) === selectedBriefId);

    // Automatically derive title from selected package or brief
    const autoTitle =
      (selectedPackageId ? selectedPkg?.title : selectedBrf?.title) ||
      offerTitle?.trim() ||
      offerDesc.trim().slice(0, 60) ||
      "Custom Offer";

    const contextFields = selectedPackageId
      ? {
          gigID: selectedPackageId,
          gigTitle: selectedPkg?.title || "",
          packageID: selectedPackageId,
          packageTitle: selectedPkg?.title || "",
          briefID: null,
          briefTitle: null,
        }
      : {
          gigID: null,
          gigTitle: null,
          packageID: null,
          packageTitle: null,
          briefID: selectedBriefId,
          briefTitle: selectedBrf?.title || "",
        };

    const customOfferData = {
      title: autoTitle,
      description: offerDesc.trim(),
      price: Number(offerPrice),
      deliveryTimeDays: Number(offerDelivery),
      revisionNumber: parseRevisionNumber(offerRevisions, 0),
      ...contextFields,
      sellerID: user?._id || user?.id,
    };

    const cleanDescription = offerDesc.trim();
    const targetRoomId = activeRoomID || conversationID;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      id: tempId,
      conversationID: targetRoomId,
      conversationUUID: targetRoomId,
      userID: {
        _id: user?._id || user?.id,
        username: user?.username || "User",
        image: getAvatarUrl(user?.image, user?.username || "User"),
      },
      senderID: user?._id || user?.id,
      sender: user,
      user: user,
      isCustomOffer: true,
      offerStatus: "active",
      customOffer: customOfferData,
      ...contextFields,
      description: cleanDescription,
      desc: cleanDescription,
      text: cleanDescription,
      message: cleanDescription,
      file: null,
      attachments: [],
      isSeller: true,
      createdAt: new Date().toISOString(),
    };

    const appendTempMessage = (oldData: any = []) => {
      const arr = Array.isArray(oldData) ? oldData : [];
      return [...arr, tempMessage];
    };

    queryClient.setQueryData(["messages", conversationID], appendTempMessage);
    if (activeRoomID && activeRoomID !== conversationID) {
      queryClient.setQueryData(["messages", activeRoomID], appendTempMessage);
    }

    const msgPayload = {
      conversationUUID: targetRoomId,
      gigID: selectedPackageId || null,
      briefID: selectedBriefId || null,
      isCustomOffer: true,
      customOffer: {
        title: autoTitle,
        description: cleanDescription,
        price: Number(offerPrice),
        deliveryTimeDays: Number(offerDelivery),
        ...(offerRevisions !== undefined && offerRevisions !== ""
          ? { revisionNumber: parseRevisionNumber(offerRevisions, 0) }
          : {}),
      },
    };

    mutation.mutate(msgPayload);

    if (socket) {
      if (!socket.connected) socket.connect();
      socket.emit("send_message", msgPayload);
    }

    setSelectedPackageId("");
    setSelectedBriefId("");
    if (setOfferTitle) setOfferTitle("");
    setOfferDesc("");
    setOfferPrice("");
    setOfferDelivery("");
    setOfferRevisions(0);
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer: any, msgId?: string) => {
    if (offer?.withdrawn || offer?.offerStatus === "withdrawn") {
      toast.error("This proposal has been withdrawn by the seller.");
      return;
    }
    try {
      const resolvedMessageId = msgId || offer.messageId || offer._id || offer.id || "";
      const resolvedSellerId = offer.sellerID || finalRecipientUser?._id || finalRecipientUser?.id;
      const resolvedTitle = offer.title || offer.desc || "Custom Offer";
      const resolvedPrice = Number(offer.price || 0);
      const resolvedDelivery = Number(offer.deliveryTimeDays || offer.delivery || 3);
      const resolvedGigId = offer.gigID || offer.packageID || null;
      const resolvedGigTitle = offer.gigTitle || offer.packageTitle || null;
      const resolvedBriefId = offer.briefID || null;
      const resolvedBriefTitle = offer.briefTitle || null;

      const origin = typeof window !== "undefined" ? window.location.origin : "https://workvence.com";

      const paymentIntentPayload = {
        gigId: "custom",
        messageId: resolvedMessageId,
        sellerID: resolvedSellerId,
        customPrice: resolvedPrice,
        customTitle: resolvedTitle,
        deliveryTimeDays: resolvedDelivery,
        gigID: resolvedGigId,
        gigTitle: resolvedGigTitle,
        briefID: resolvedBriefId,
        briefTitle: resolvedBriefTitle,
        successUrl: `${origin}/orders`,
        cancelUrl: `${origin}/messages`,
      };

      const { data } = await axiosFetch.post("/orders/create-payment-intent", paymentIntentPayload);
      if (data?.url || data?.checkoutUrl) {
        window.location.href = data.url || data.checkoutUrl;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment.");
    }
  };

  const handleWithdraw = async (msgId: string) => {
    try {
      const res = await axiosFetch.patch(`/messages/withdraw/${msgId}`);
      const updatedMsg = res.data?.messageDoc;
      toast.success(res.data?.message || "Custom offer withdrawn successfully.");
      queryClient.setQueryData(["messages", conversationID], (oldData: any = []) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((m: any) =>
          String(m._id || m.id) === String(msgId)
            ? { ...m, ...(updatedMsg || {}), withdrawn: true, offerStatus: "withdrawn" }
            : m
        );
      });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationID] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to withdraw.");
    }
  };

  // Video meeting creation
  const handleCreateMeeting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isCreatingMeeting) return;

    const targetContactName = finalRecipientUser?.username || "Client";
    const title = meetingTitle.trim() || `Job Discussion with @${targetContactName}`;

    setIsCreatingMeeting(true);
    const toastId = toast.loading("Generating video meeting link...");

    try {
      const targetRoomId = activeRoomID || conversationID;
      const { data } = await axiosFetch.post(
        "/meetings",
        { title, conversationId: targetRoomId },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      const resData = data?.data || data;
      if (resData && (resData.roomUrl || resData.joinUrl || resData.meeting || resData.meetingId)) {
        const meetingPayload = {
          meetingId: resData.meetingId || "",
          roomUrl: resData.joinUrl || resData.roomUrl || resData.meeting || "",
          title: resData.title || title,
          hostEmail: resData.hostEmail || "",
          password: resData.password || "",
          isPrivate: Boolean(resData.isPrivate),
          autoRecording: resData.autoRecording || "",
          createdAt: resData.createdAt || new Date().toISOString(),
          status: resData.status || "success",
        };

        const meetingText = `[MEETING_INVITE]${JSON.stringify(meetingPayload)}`;
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          _id: tempId,
          id: tempId,
          conversationID: targetRoomId,
          userID: {
            _id: user?._id || user?.id,
            username: user?.username || "User",
            image: getAvatarUrl(user?.image, user?.username || "User"),
          },
          senderID: user?._id || user?.id,
          sender: user,
          user: user,
          description: meetingText,
          isSeller: Boolean(user?.isSeller),
          createdAt: new Date().toISOString(),
        };

        const appendTempMessage = (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          return [...arr, tempMessage];
        };

        queryClient.setQueryData(["messages", conversationID], appendTempMessage);
        if (activeRoomID && activeRoomID !== conversationID) {
          queryClient.setQueryData(["messages", activeRoomID], appendTempMessage);
        }

        if (socket && socket.connected) {
          const socketPayload = {
            conversationID: targetRoomId,
            conversationUUID: targetRoomId,
            conversationId: targetRoomId,
            description: meetingText,
            desc: meetingText,
            text: meetingText,
            message: meetingText,
            meeting: meetingPayload,
            meetingPayload,
            userID: user?._id || user?.id,
            from: user?._id || user?.id,
            to: targetOtherUserId || undefined,
            user: {
              _id: user?._id || user?.id,
              username: user?.username || "User",
              image: getAvatarUrl(user?.image, user?.username || "User"),
            },
            sender: {
              _id: user?._id || user?.id,
              username: user?.username || "User",
              image: getAvatarUrl(user?.image, user?.username || "User"),
            },
            createdAt: new Date().toISOString(),
          };
          socket.emit("send_message", socketPayload);
        } else {
          mutation.mutate({
            conversationID: targetRoomId,
            description: meetingText,
          });
        }

        toast.success("Meeting room created and sent to chat!", { id: toastId });
        setShowMeetingModal(false);
        setMeetingTitle("");
      } else {
        toast.error("Failed to generate meeting link. Please try again.", { id: toastId });
      }
    } catch (err: any) {
      console.error("Meeting creation error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create meeting",
        { id: toastId }
      );
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  return {
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
    isPending: mutation.isPending,
    handleFileAttachmentChange,
    handleRemoveAttachment,
    handleSend,
    handleKeyDown,
    handleInputChange,
    handleOfferSubmit,
    handleAcceptOffer,
    handleWithdraw,
    handleCreateMeeting,
  };
}
