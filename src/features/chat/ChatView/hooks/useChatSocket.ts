"use client";

import { useState, useEffect, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";
import { socket } from "@/utils";
import { isTargetConversation, getMessageText, getAttachmentUrl } from "@/utils/chatHelpers";

const getIncomingConversationId = (data: any): string => {
  if (!data) return "";
  const convFieldId =
    typeof data?.conversation === "object"
      ? data.conversation?._id || data.conversation?.id || data.conversation?.uuid
      : data?.conversation;

  return String(
    data?.conversationUUID ||
      data?.conversationID ||
      data?.conversationId ||
      convFieldId ||
      data?.room ||
      data?.roomId ||
      ""
  ).trim();
};

const isMessageSentByCurrentUser = (
  msg: any,
  currentUserId?: string,
  currentUsername?: string
): boolean => {
  if (!msg) return false;
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
  ).trim();

  if (currentUserId && senderId && senderId === String(currentUserId).trim()) {
    return true;
  }

  const senderUsername = String(
    msg.username ||
      msg.senderUsername ||
      msg.sender_username ||
      msg.sender?.username ||
      msg.user?.username ||
      msg.from?.username ||
      ""
  ).trim();

  if (
    currentUsername &&
    senderUsername &&
    senderUsername.toLowerCase() === currentUsername.toLowerCase()
  ) {
    return true;
  }

  return false;
};

interface UseChatSocketOptions {
  user: any;
  conversationID: string;
  isValidId: boolean;
  activeConversation: any;
  queryClient: QueryClient;
}

export function useChatSocket({
  user,
  conversationID,
  isValidId,
  activeConversation,
  queryClient,
}: UseChatSocketOptions) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  const userRef = useRef(user);
  const convIdRef = useRef(conversationID);
  const activeConvRef = useRef<any>(activeConversation);
  const recipientTypingTimerRef = useRef<any>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    convIdRef.current = conversationID;
  }, [conversationID]);

  useEffect(() => {
    activeConvRef.current = activeConversation;
    if (activeConversation && socket) {
      if (!socket.connected) {
        socket.connect();
      }
      const extraIds = [
        activeConversation._id,
        activeConversation.uuid,
        activeConversation.conversationID,
        activeConversation.id,
      ]
        .filter(Boolean)
        .map((id) => String(id).trim());

      extraIds.forEach((id) => {
        socket.emit("join_conversation", id);
        socket.emit("join_room", id);
        socket.emit("join", id);
      });
    }
  }, [activeConversation]);

  // Global socket: connection and online users
  useEffect(() => {
    const currentUserId = user?._id || user?.id || (user as any)?.userId || (user as any)?.userID;
    if (!currentUserId) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("user_connected", currentUserId);

    const handleOnlineUsers = (users: any) => setOnlineUsers(users);

    // Global listener for new messages to update the sidebar even if in a different chat
    const handleGlobalReceiveMessage = (newMsg: any) => {
      if (!newMsg) return;
      const incomingCid = getIncomingConversationId(newMsg);
      const senderId = String(
        (typeof newMsg.sender === "object" && (newMsg.sender?._id || newMsg.sender?.id)) ||
          (typeof newMsg.user === "object" && (newMsg.user?._id || newMsg.user?.id)) ||
          (typeof newMsg.userID === "object" && (newMsg.userID?._id || newMsg.userID?.id)) ||
          newMsg.sender ||
          newMsg.user ||
          newMsg.senderID ||
          newMsg.userID ||
          newMsg.from ||
          ""
      ).trim();
      const senderName = String(
        newMsg.username ||
          newMsg.senderUsername ||
          newMsg.sender_username ||
          newMsg.sender?.username ||
          newMsg.user?.username ||
          newMsg.from?.username ||
          ""
      ).trim();

      const currentUid = userRef.current?._id || userRef.current?.id;
      const currentUname = userRef.current?.username;
      const isSentByMe = isMessageSentByCurrentUser(newMsg, currentUid, currentUname);

      queryClient.setQueryData(["conversations"], (oldConvs: any) => {
        if (!Array.isArray(oldConvs) || oldConvs.length === 0) return oldConvs;
        const currentActiveId = String(convIdRef.current || conversationID || "").trim();
        const incomingFile = getAttachmentUrl(newMsg);
        const incomingText =
          newMsg.description ||
          newMsg.desc ||
          newMsg.text ||
          newMsg.message ||
          (incomingFile ? "📎 Attachment" : "");

        return oldConvs
          .map((c: any) => {
            const isMatch = Boolean(
              (incomingCid && isTargetConversation(c, incomingCid)) ||
              (senderId && isTargetConversation(c, senderId)) ||
              (senderName && isTargetConversation(c, senderName))
            );

            if (isMatch) {
              const isCurrentlyViewingThisChat = Boolean(
                currentActiveId && isTargetConversation(c, currentActiveId)
              );

              const currentUid = String(user?._id || user?.id || "");
              const currentUsername = String(user?.username || "").toLowerCase();
              const sellerObj = c.sellerID || c.seller || c.sellerId || c.sellerDetails;
              const sellerId = String(sellerObj?._id || sellerObj?.id || (typeof sellerObj === "string" ? sellerObj : ""));
              const sellerUsername = String(c.seller_username || sellerObj?.username || "").toLowerCase();
              const isCurrentUserSeller = (sellerId && sellerId === currentUid) || (sellerUsername && sellerUsername === currentUsername);

              return {
                ...c,
                lastMessage: incomingText || c.lastMessage,
                lastMessageSender: senderId,
                updatedAt: new Date().toISOString(),
                readBySeller: isSentByMe ? (isCurrentUserSeller ? true : false) : (isCurrentUserSeller ? isCurrentlyViewingThisChat : true),
                readByBuyer: isSentByMe ? (isCurrentUserSeller ? false : true) : (isCurrentUserSeller ? true : isCurrentlyViewingThisChat),
                unread: isSentByMe || isCurrentlyViewingThisChat ? false : true,
                unreadCount: isSentByMe || isCurrentlyViewingThisChat
                  ? 0
                  : Math.max(1, (Number(c.unreadCount) || 0) + 1),
              };
            }
            return c;
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      });

      // Refetch conversations API in background to sync authoritative fresh data from server
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("refresh-conversations"));
      }
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("receive_message", handleGlobalReceiveMessage);
    socket.on("new_message", handleGlobalReceiveMessage);
    socket.on("message", handleGlobalReceiveMessage);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.off("receive_message", handleGlobalReceiveMessage);
      socket.off("new_message", handleGlobalReceiveMessage);
      socket.off("message", handleGlobalReceiveMessage);
    };
  }, [user?._id, user?.id, queryClient, conversationID, user?.isSeller]);

  // Manage room subscription & realtime events for active conversation
  useEffect(() => {
    if (!isValidId) return;

    const joinRoom = () => {
      const convDoc = activeConvRef.current;
      const idsToJoin = new Set(
        [conversationID, convDoc?._id, convDoc?.uuid, convDoc?.conversationID, convDoc?.id]
          .filter(Boolean)
          .map((id) => String(id).trim())
      );

      idsToJoin.forEach((id) => {
        socket.emit("join_conversation", id);
        socket.emit("join_room", id);
        socket.emit("join", id);
      });
      const currentUserId = user?._id || user?.id || (user as any)?.userId || (user as any)?.userID;
      if (currentUserId) socket.emit("user_connected", currentUserId);
    };

    socket.connect();
    joinRoom();

    const handleConnect = () => {
      joinRoom();
      queryClient.invalidateQueries({ queryKey: ["messages", conversationID] });
    };
    socket.on("connect", handleConnect);

    setIsRecipientTyping(false);

    const isEventForCurrentChat = (data: any, isTypingEvent = true) => {
      if (!data) return false;

      const currentUser = userRef.current;
      const currentUserId = currentUser?._id || currentUser?.id;
      const currentUsername = currentUser?.username;

      if (isTypingEvent && isMessageSentByCurrentUser(data, currentUserId, currentUsername)) {
        return false; // Ignore typing events from self
      }

      const incomingId = getIncomingConversationId(data);
      if (!incomingId || incomingId === "undefined") return false;

      // 1. Check against route parameter / props conversation ID
      const currentParamId = String(convIdRef.current || conversationID || "").trim();
      if (currentParamId && incomingId.toLowerCase() === currentParamId.toLowerCase()) {
        return true;
      }

      // 2. Check against active conversation document identifiers
      const convDoc = activeConvRef.current;
      if (convDoc) {
        const docIds = [
          convDoc._id,
          convDoc.id,
          convDoc.uuid,
          convDoc.conversationID,
        ]
          .filter(Boolean)
          .map((id) => String(id).trim().toLowerCase());

        if (docIds.includes(incomingId.toLowerCase())) {
          return true;
        }

        // Check composite pair of seller and buyer IDs (e.g. sellerId+buyerId or buyerId+sellerId)
        const sId = String(convDoc.sellerID?._id || convDoc.sellerID?.id || convDoc.sellerID || "").trim();
        const bId = String(convDoc.buyerID?._id || convDoc.buyerID?.id || convDoc.buyerID || "").trim();
        if (sId && bId) {
          const pair1 = `${sId}${bId}`.toLowerCase();
          const pair2 = `${bId}${sId}`.toLowerCase();
          const incLower = incomingId.toLowerCase();
          if (incLower === pair1 || incLower === pair2) {
            return true;
          }
        }
      }

      return false;
    };

    const handleReceiveMessage = (newMsg: any) => {
      const isForCurrent = isEventForCurrentChat(newMsg, false);

      if (isForCurrent) {
        const updateCache = (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          const newMsgId = newMsg?._id || newMsg?.id;
          const incomingText = getMessageText(newMsg);
          const incomingFile = getAttachmentUrl(newMsg);
          const incomingSender = String(
            (typeof newMsg.sender === "object" && (newMsg.sender?._id || newMsg.sender?.id)) ||
              (typeof newMsg.user === "object" && (newMsg.user?._id || newMsg.user?.id)) ||
              (typeof newMsg.userID === "object" && (newMsg.userID?._id || newMsg.userID?.id)) ||
              newMsg.sender ||
              newMsg.user ||
              newMsg.senderID ||
              newMsg.userID ||
              newMsg.from ||
              ""
          );
          const incomingTime = newMsg.createdAt ? new Date(newMsg.createdAt).getTime() : Date.now();

          // 1. If already in cache by ID, update existing message in place and clean up any leftover temp messages
          if (newMsgId && arr.some((m: any) => String(m._id || m.id) === String(newMsgId))) {
            return arr
              .filter((m: any) => {
                const mId = String(m._id || m.id || "");
                if (mId.startsWith("temp-")) {
                  if (newMsg.tempId && (m.tempId === newMsg.tempId || mId === String(newMsg.tempId))) {
                    return false;
                  }
                  const tempText = getMessageText(m);
                  const tempFile = getAttachmentUrl(m);
                  if (tempText === incomingText && tempFile === incomingFile) {
                    return false;
                  }
                }
                return true;
              })
              .map((m: any) =>
                String(m._id || m.id) === String(newMsgId) ? { ...m, ...newMsg } : m
              );
          }

          // 2. Only skip duplicate socket echoes if same text/file AND same sender AND created within 15 seconds
          const isDuplicateEcho = arr.some((m: any) => {
            const mId = String(m._id || m.id || "");
            if (mId.startsWith("temp-")) return false;

            const mText = getMessageText(m);
            const mFile = getAttachmentUrl(m);
            if (mText !== incomingText || mFile !== incomingFile) return false;

            const mSender = String(
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
            if (incomingSender && mSender && incomingSender !== mSender) return false;

            const mTime = m.createdAt ? new Date(m.createdAt).getTime() : 0;
            return mTime > 0 && Math.abs(incomingTime - mTime) < 15000;
          });

          if (isDuplicateEcho) {
            return arr.filter((m: any) => {
              const mId = String(m._id || m.id || "");
              if (mId.startsWith("temp-")) {
                const tempText = getMessageText(m);
                const tempFile = getAttachmentUrl(m);
                if (tempText === incomingText && tempFile === incomingFile) {
                  return false;
                }
              }
              return true;
            });
          }

          // 3. Replace matching temp message or remove matching temp- messages
          const withoutTemp = arr.filter((m: any) => {
            const mId = String(m._id || m.id || "");
            if (mId.startsWith("temp-")) {
              if (newMsg.tempId && (m.tempId === newMsg.tempId || mId === String(newMsg.tempId))) {
                return false;
              }
              if (m.isCustomOffer && (newMsg.isCustomOffer || newMsg.customOffer)) {
                return false;
              }
              const tempText = getMessageText(m);
              const tempFile = getAttachmentUrl(m);
              if (tempText === incomingText && tempFile === incomingFile) {
                return false;
              }
            }
            return true;
          });
          return [...withoutTemp, newMsg];
        };

        queryClient.setQueryData(["messages", conversationID], updateCache);
        if (convIdRef.current && convIdRef.current !== conversationID) {
          queryClient.setQueryData(["messages", convIdRef.current], updateCache);
        }
        const activeDocId = activeConvRef.current?.uuid || activeConvRef.current?._id;
        if (activeDocId && activeDocId !== conversationID && activeDocId !== convIdRef.current) {
          queryClient.setQueryData(["messages", activeDocId], updateCache);
        }
      }
    };

    const handleUserTyping = (data: any) => {
      if (isEventForCurrentChat(data, true)) {
        setIsRecipientTyping(true);
        if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
        recipientTypingTimerRef.current = setTimeout(() => setIsRecipientTyping(false), 3000);
      }
    };

    const handleUserStoppedTyping = (data: any) => {
      if (isEventForCurrentChat(data, true)) {
        setIsRecipientTyping(false);
        if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
      }
    };

    const handleOfferWithdrawn = (data: any) => {
      const targetMsgId = data?.messageId || data?.id || data?._id;
      if (!targetMsgId) return;

      const updateMessagesWithdrawn = (oldData: any = []) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((m: any) =>
          String(m._id || m.id) === String(targetMsgId)
            ? { ...m, withdrawn: true, offerStatus: "withdrawn" }
            : m
        );
      };

      queryClient.setQueryData(["messages", conversationID], updateMessagesWithdrawn);
      if (convIdRef.current && convIdRef.current !== conversationID) {
        queryClient.setQueryData(["messages", convIdRef.current], updateMessagesWithdrawn);
      }
      const incomingCid = data?.conversationUUID || data?.conversationID;
      if (incomingCid) {
        queryClient.setQueryData(["messages", incomingCid], updateMessagesWithdrawn);
      }
      queryClient.invalidateQueries({ queryKey: ["messages", conversationID] });
    };

    const handleOfferAccepted = (data: any) => {
      const targetMsgId = data?.messageId || data?.id || data?._id;
      const orderId = data?.orderId || data?.orderID || data?.order?._id || data?.order?.id;
      if (!targetMsgId) return;

      const updateMessagesAccepted = (oldData: any = []) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((m: any) =>
          String(m._id || m.id) === String(targetMsgId)
            ? {
                ...m,
                offerStatus: "accepted",
                isOfferAccepted: true,
                orderId: orderId || m.orderId || m.orderID,
                orderID: orderId || m.orderID || m.orderId,
              }
            : m
        );
      };

      queryClient.setQueryData(["messages", conversationID], updateMessagesAccepted);
      if (convIdRef.current && convIdRef.current !== conversationID) {
        queryClient.setQueryData(["messages", convIdRef.current], updateMessagesAccepted);
      }
      const incomingCid = data?.conversationUUID || data?.conversationID;
      if (incomingCid) {
        queryClient.setQueryData(["messages", incomingCid], updateMessagesAccepted);
      }
      queryClient.invalidateQueries({ queryKey: ["messages", conversationID] });
      queryClient.invalidateQueries({ queryKey: ["contactOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_message", handleReceiveMessage);
    socket.on("message", handleReceiveMessage);
    socket.on("chat_message", handleReceiveMessage);
    socket.on("offer_withdrawn", handleOfferWithdrawn);
    socket.on("offer_accepted", handleOfferAccepted);
    socket.on("typing_start", handleUserTyping);
    socket.on("user_typing", handleUserTyping);
    socket.on("typing", handleUserTyping);
    socket.on("typing_stop", handleUserStoppedTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    socket.on("stop_typing", handleUserStoppedTyping);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_message", handleReceiveMessage);
      socket.off("message", handleReceiveMessage);
      socket.off("chat_message", handleReceiveMessage);
      socket.off("offer_withdrawn", handleOfferWithdrawn);
      socket.off("offer_accepted", handleOfferAccepted);
      socket.off("typing_start", handleUserTyping);
      socket.off("user_typing", handleUserTyping);
      socket.off("typing", handleUserTyping);
      socket.off("typing_stop", handleUserStoppedTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
      socket.off("stop_typing", handleUserStoppedTyping);
      if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
    };
  }, [isValidId, conversationID, queryClient, user?.isSeller, user?._id, user?.id]);

  const activeRoomID =
    activeConversation?._id ||
    activeConversation?.conversationID ||
    activeConversation?.uuid ||
    activeConversation?.id ||
    (conversationID !== "undefined" ? conversationID : null);

  const stopTypingIndicator = () => {
    if (isTypingRef.current && activeRoomID && activeRoomID !== "undefined" && user?.username) {
      isTypingRef.current = false;
      socket.emit("typing_stop", {
        conversationID: activeRoomID,
        conversationUUID: activeRoomID,
        username: user.username,
      });
    }
  };

  const handleTypingKeypress = (textLength: number) => {
    if (activeRoomID && activeRoomID !== "undefined" && user?.username) {
      if (!isTypingRef.current && textLength > 0) {
        isTypingRef.current = true;
        socket.emit("typing_start", {
          conversationID: activeRoomID,
          conversationUUID: activeRoomID,
          username: user.username,
        });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTypingIndicator();
      }, 2000);
    }
  };

  return {
    onlineUsers,
    isRecipientTyping,
    activeRoomID,
    stopTypingIndicator,
    handleTypingKeypress,
  };
}
