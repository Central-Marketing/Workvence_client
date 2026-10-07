"use client";

import { useState, useEffect, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";
import { socket } from "@/utils";
import { isTargetConversation } from "@/utils/chatHelpers";

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
    if (!user?._id) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("user_connected", user._id);

    const handleOnlineUsers = (users: any) => setOnlineUsers(users);

    // Global listener for new messages to update the sidebar even if in a different chat
    const handleGlobalReceiveMessage = (newMsg: any) => {
      const convFieldId =
        typeof newMsg?.conversation === "object"
          ? newMsg.conversation?._id || newMsg.conversation?.id || newMsg.conversation?.uuid
          : newMsg?.conversation;

      const incomingCid = String(
        newMsg?.conversationUUID ||
          newMsg?.conversationID ||
          newMsg?.conversationId ||
          newMsg?.uuid ||
          convFieldId ||
          ""
      ).trim();
      if (!incomingCid) return;

      queryClient.setQueryData(["conversations"], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs
          .map((c: any) => {
            if (isTargetConversation(c, incomingCid)) {
              const isCurrentlyViewingThisChat =
                (typeof window !== "undefined" &&
                  window.location.pathname.includes(`/message/${incomingCid}`)) ||
                Boolean(conversationID && isTargetConversation(c, conversationID));
              return {
                ...c,
                lastMessage:
                  newMsg.description ||
                  newMsg.desc ||
                  newMsg.text ||
                  newMsg.message ||
                  c.lastMessage,
                updatedAt: new Date().toISOString(),
                readBySeller: user?.isSeller ? isCurrentlyViewingThisChat : c.readBySeller,
                readByBuyer: !user?.isSeller ? isCurrentlyViewingThisChat : c.readByBuyer,
              };
            }
            return c;
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      });
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("receive_message", handleGlobalReceiveMessage);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.off("receive_message", handleGlobalReceiveMessage);
    };
  }, [user?._id, queryClient, conversationID, user?.isSeller]);

  // Manage room subscription & realtime events for active conversation
  useEffect(() => {
    if (!isValidId) return;

    const joinRoom = () => {
      const convDoc = activeConvRef.current;
      const idsToJoin = new Set(
        [conversationID, convDoc?._id, convDoc?.uuid, convDoc?.conversationID]
          .filter(Boolean)
          .map((id) => String(id).trim())
      );

      idsToJoin.forEach((id) => {
        socket.emit("join_conversation", id);
        socket.emit("join_room", id);
        socket.emit("join", id);
      });
      if (user?._id) socket.emit("user_connected", user._id);
    };

    socket.connect();
    joinRoom();

    const handleConnect = () => {
      joinRoom();
    };
    socket.on("connect", handleConnect);

    setIsRecipientTyping(false);

    const isEventForCurrentChat = (data: any, isTypingEvent = true) => {
      if (!data) return false;

      const currentUser = userRef.current;
      if (
        isTypingEvent &&
        data.username &&
        currentUser?.username &&
        data.username.toLowerCase() === currentUser.username.toLowerCase()
      ) {
        return false; // Ignore typing events from self
      }

      const convFieldId =
        typeof data?.conversation === "object"
          ? data.conversation?._id || data.conversation?.id || data.conversation?.uuid
          : data?.conversation;

      const incomingId = String(
        data?.conversationUUID ||
          data?.conversationID ||
          data?.conversationId ||
          data?.uuid ||
          convFieldId ||
          ""
      ).trim();

      if (!incomingId || incomingId === "undefined") return false;

      const currentParamId = String(convIdRef.current || conversationID || "").trim();
      if (currentParamId && incomingId === currentParamId) return true;

      if (
        typeof window !== "undefined" &&
        window.location.pathname.includes(`/message/${incomingId}`)
      ) {
        return true;
      }

      const convDoc = activeConvRef.current;
      if (convDoc) {
        if (isTargetConversation(convDoc, incomingId)) return true;
        if (currentParamId && isTargetConversation(convDoc, currentParamId)) return true;

        if (convDoc.uuid && incomingId === String(convDoc.uuid).trim()) return true;
        if (convDoc.conversationID && incomingId === String(convDoc.conversationID).trim())
          return true;
        if (convDoc._id && incomingId === String(convDoc._id).trim()) return true;
        if (convDoc.id && incomingId === String(convDoc.id).trim()) return true;

        const sId = String(convDoc.sellerID?._id || convDoc.sellerID?.id || convDoc.sellerID || "");
        const bId = String(convDoc.buyerID?._id || convDoc.buyerID?.id || convDoc.buyerID || "");
        if (sId && bId && (`${sId}${bId}` === incomingId || `${bId}${sId}` === incomingId))
          return true;
        if (sId && incomingId === sId) return true;
        if (bId && incomingId === bId) return true;
      }
      return false;
    };

    const handleReceiveMessage = (newMsg: any) => {
      const isForCurrent = isEventForCurrentChat(newMsg, false);

      if (isForCurrent) {
        const updateCache = (oldData: any = []) => {
          const arr = Array.isArray(oldData) ? oldData : [];
          const newMsgId = newMsg?._id || newMsg?.id;
          const incomingText = (
            newMsg.description ||
            newMsg.desc ||
            newMsg.text ||
            newMsg.message ||
            ""
          ).trim();
          const incomingFile =
            newMsg.file || (Array.isArray(newMsg.attachments) && newMsg.attachments[0]) || "";
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

          // 1. If already in cache by ID, update existing message in place
          if (newMsgId && arr.some((m: any) => String(m._id || m.id) === String(newMsgId))) {
            return arr.map((m: any) =>
              String(m._id || m.id) === String(newMsgId) ? { ...m, ...newMsg } : m
            );
          }

          // 2. Only skip duplicate socket echoes if same text/file AND same sender AND created within 15 seconds
          const isDuplicateEcho = arr.some((m: any) => {
            const mId = String(m._id || m.id || "");
            if (mId.startsWith("temp-")) return false;

            const mText = (m.description || m.desc || m.text || m.message || "").trim();
            const mFile = m.file || (Array.isArray(m.attachments) && m.attachments[0]) || "";
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
          if (isDuplicateEcho) return arr;

          // 3. Replace matching temp message or remove matching temp- messages
          const withoutTemp = arr.filter((m: any) => {
            const mId = String(m._id || m.id || "");
            if (mId.startsWith("temp-")) {
              const tempText = (m.description || m.desc || m.text || m.message || "").trim();
              return tempText !== incomingText;
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

      // 2. Instantly update conversation sidebar
      queryClient.setQueryData(["conversations"], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        const convFieldId =
          typeof newMsg?.conversation === "object"
            ? newMsg.conversation?._id || newMsg.conversation?.id || newMsg.conversation?.uuid
            : newMsg?.conversation;
        const incomingCid = String(
          newMsg?.conversationUUID ||
            newMsg?.conversationID ||
            newMsg?.conversationId ||
            newMsg?.uuid ||
            convFieldId ||
            ""
        ).trim();
        if (!incomingCid) return oldConvs;
        const incomingText =
          newMsg.description || newMsg.desc || newMsg.text || newMsg.message || "";
        return oldConvs
          .map((c: any) => {
            if (isTargetConversation(c, incomingCid)) {
              return {
                ...c,
                lastMessage: incomingText || c.lastMessage,
                updatedAt: new Date().toISOString(),
                readBySeller: user?.isSeller ? isForCurrent : c.readBySeller,
                readByBuyer: !user?.isSeller ? isForCurrent : c.readByBuyer,
              };
            }
            return c;
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      });
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

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_start", handleUserTyping);
    socket.on("user_typing", handleUserTyping);
    socket.on("typing_stop", handleUserStoppedTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_start", handleUserTyping);
      socket.off("user_typing", handleUserTyping);
      socket.off("typing_stop", handleUserStoppedTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
      if (recipientTypingTimerRef.current) clearTimeout(recipientTypingTimerRef.current);
    };
  }, [isValidId, conversationID, queryClient, user?.isSeller, user?._id]);

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
