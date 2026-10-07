"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosFetch, socket, getAvatarUrl, parseRevisionNumber } from "@/utils";
import { isTargetConversation } from "@/utils/chatHelpers";
import supportService from "@/utils/supportService";
import { ChatAttachment } from "../types";
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

  // Fetch messages history
  const {
    isLoading: msgsLoading,
    isError: msgsError,
    data: messages = [],
  } = useQuery({
    queryKey: ["messages", conversationID],
    queryFn: async () => {
      const extractMessages = (data: any): any[] | null => {
        if (!data) return null;
        if (Array.isArray(data) && data.length > 0) return data;
        if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
        if (Array.isArray(data?.messages) && data.messages.length > 0) return data.messages;
        if (Array.isArray(data?.data?.messages) && data.data.messages.length > 0)
          return data.data.messages;
        if (Array.isArray(data?.result) && data.result.length > 0) return data.result;
        return null;
      };

      const targetId = conversationID || activeConversation?.uuid || activeConversation?._id;
      if (!targetId) return [];

      try {
        const { data } = await axiosFetch.get(`/conversations/${targetId}/messages`);
        return extractMessages(data) || [];
      } catch (err: any) {
        const altId = activeConversation?._id;
        if (altId && String(altId) !== String(targetId)) {
          try {
            const { data } = await axiosFetch.get(`/conversations/${altId}/messages`);
            return extractMessages(data) || [];
          } catch {}
        }
        return [];
      }
    },
    enabled: isValidId,
    retry: false,
    staleTime: 5000,
  });

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
      const httpPayload: Record<string, any> = {
        description: msg.description || msg.desc || msg.text || msg.message || "",
      };
      if (msg.file) httpPayload.file = msg.file;
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        httpPayload.attachments = msg.attachments;
      }

      try {
        return await axiosFetch.post(`/conversations/${targetId}/messages`, httpPayload);
      } catch (err) {
        return await axiosFetch.post("/messages", {
          ...httpPayload,
          conversationID: targetId,
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
          newMsg.description || newMsg.desc || newMsg.text || newMsg.message || "";
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
              const tempText = (m.description || m.desc || m.text || m.message || "").trim();
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
      toast.success("File attached successfully");
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
      file: currentAttachment?.url || null,
      attachments: currentAttachment?.url ? [currentAttachment.url] : [],
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
      file: currentAttachment?.url || null,
      attachments: currentAttachment?.url ? [currentAttachment.url] : [],
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
      if (textareaRef.current.scrollHeight > 150) {
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
    if (!selectedPackageId && !selectedBriefId) {
      toast.error("Select at least a Package or a Project.");
      return;
    }
    if (!offerDesc || !offerPrice || !offerDelivery) {
      toast.error("Fill all fields.");
      return;
    }

    const payload: any = {
      price: Number(offerPrice),
      desc: offerDesc,
      delivery: Number(offerDelivery),
      revisions: parseRevisionNumber(offerRevisions, 0),
      sellerID: user._id,
    };
    if (selectedPackageId) {
      payload.packageID = selectedPackageId;
      const pkg = sellerPackages.find((p: any) => (p._id || p.id) === selectedPackageId);
      if (pkg?.title) payload.title = pkg.title;
    }
    if (selectedBriefId) {
      payload.briefID = selectedBriefId;
      const brief = chatBriefs.find((b: any) => (b._id || b.id) === selectedBriefId);
      if (brief?.title) payload.title = brief.title;
    }

    const offerText = `[CUSTOM_OFFER]${JSON.stringify(payload)}`;
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
      description: offerText,
      desc: offerText,
      text: offerText,
      message: offerText,
      isCustomOffer: true,
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
      conversationID: targetRoomId,
      conversationUUID: targetRoomId,
      conversationId: targetRoomId,
      description: offerText,
      desc: offerText,
      text: offerText,
      message: offerText,
      isCustomOffer: true,
      file: null,
      attachments: [],
      userID: user?._id || user?.id,
      from: user?._id || user?.id,
      to: targetOtherUserId || undefined,
    };

    mutation.mutate(msgPayload);

    if (socket) {
      if (!socket.connected) socket.connect();
      socket.emit("send_message", msgPayload);
      socket.emit("sendMessage", msgPayload);
    }

    setSelectedPackageId("");
    setSelectedBriefId("");
    setOfferDesc("");
    setOfferPrice("");
    setOfferDelivery("");
    setOfferRevisions(0);
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer: any) => {
    if (offer?.withdrawn || offer?.offerStatus === "withdrawn") {
      toast.error("This proposal has been withdrawn by the seller.");
      return;
    }
    try {
      const { data } = await axiosFetch.post("/orders/create-payment-intent/custom", {
        packageID: offer.packageID,
        briefID: offer.briefID,
        customPrice: offer.price,
        customTitle: offer.desc,
        sellerID: offer.sellerID,
        delivery: offer.delivery,
      });
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to initiate payment.");
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
