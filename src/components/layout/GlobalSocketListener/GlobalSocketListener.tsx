"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { socket } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { playNotificationSound } from "@/utils/soundUtil";

const processedNotifIds = new Set<string>();
const processedNotifMessageIds = new Set<string>();

const isSenderCurrentUser = (
  idOrObj?: any,
  username?: string,
  currentUserId?: string,
  currentUsername?: string
) => {
  if (!idOrObj && !username) return false;
  const idStr = String(
    typeof idOrObj === "object" ? idOrObj?._id || idOrObj?.id || "" : idOrObj || ""
  ).trim();
  if (idStr && currentUserId && idStr === currentUserId) return true;
  const uStr = String(
    typeof idOrObj === "object" ? idOrObj?.username || "" : username || ""
  ).trim().toLowerCase();
  if (uStr && currentUsername && uStr === currentUsername) return true;
  return false;
};

const isChatMessageNotif = (notif: any) => {
  if (!notif) return false;
  const type = String(notif.type || "").toLowerCase();
  const title = String(notif.title || "").toLowerCase();
  const msg = String(notif.message || notif.desc || notif.description || "").toLowerCase();
  const link = String(notif.link || notif.url || "").toLowerCase();

  const isChatType =
    type === "message" ||
    type === "chat" ||
    type === "conversation" ||
    type === "new_message" ||
    type === "custom_offer" ||
    type === "direct_message" ||
    type === "dm" ||
    type === "inbox" ||
    Boolean(
      notif.conversationID ||
        notif.conversationId ||
        notif.conversationUUID ||
        notif.conversation ||
        notif.chatId ||
        notif.messageId ||
        notif.messageID
    );

  if (isChatType) return true;
  if (link.includes("/message") || link.includes("/messages")) return true;
  if (/message|chat|conversation|custom proposal|custom offer/i.test(title)) return true;
  if (/sent you a message|sent a message|new message|sent you a custom proposal|sent you an offer/i.test(msg))
    return true;
  return false;
};

export default function GlobalSocketListener() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const currentUserId = String(user._id || user.id || "").trim();
    const currentUsername = String(user.username || "").trim().toLowerCase();

    if (!socket.connected) {
      socket.connect();
    }

    const joinUser = () => {
      socket.emit("user_connected", currentUserId);
    };

    const handleOrderUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders-all"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    };

    // Handler for real-time incoming chat messages
    const handleReceiveMessage = (newMsg: any) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (!newMsg) return;

      const senderId =
        newMsg.userID?._id ||
        newMsg.userID?.id ||
        newMsg.senderID?._id ||
        newMsg.senderID?.id ||
        newMsg.senderID ||
        newMsg.senderId ||
        newMsg.sender?._id ||
        newMsg.sender?.id ||
        newMsg.sender ||
        newMsg.from?._id ||
        newMsg.from?.id ||
        newMsg.from ||
        (typeof newMsg.userID === "string" ? newMsg.userID : "");

      const senderName =
        newMsg.userID?.username ||
        newMsg.senderName ||
        newMsg.sender_username ||
        newMsg.senderUsername ||
        newMsg.sender?.username ||
        newMsg.from?.username ||
        newMsg.user?.username ||
        "";

      // Do not notify for messages sent by the current user
      if (isSenderCurrentUser(senderId, senderName, currentUserId, currentUsername)) {
        return;
      }

      const conversationId = String(
        newMsg.conversationID ||
          newMsg.conversationId ||
          newMsg.conversationUUID ||
          newMsg.uuid ||
          ""
      ).trim();

      const senderIdStr = String(senderId || "").trim();
      const convIdStr = String(conversationId || "").trim();
      const rawText = String(
        newMsg.description || newMsg.desc || newMsg.text || newMsg.message || ""
      ).trim();
      const fileAttachment = String(
        newMsg.file || (Array.isArray(newMsg.attachments) && newMsg.attachments[0]) || ""
      ).trim();
      const contentSnippet = rawText.slice(0, 100);

      // Deterministic fingerprint for deduplication
      const contentFingerprint = `${senderIdStr}_${convIdStr}_${contentSnippet || fileAttachment}`;
      const msgId = String(newMsg._id || newMsg.id || newMsg.uuid || "").trim();

      if (
        (contentFingerprint && processedNotifMessageIds.has(contentFingerprint)) ||
        (msgId && processedNotifMessageIds.has(msgId))
      ) {
        return;
      }

      if (contentFingerprint) {
        processedNotifMessageIds.add(contentFingerprint);
        setTimeout(() => processedNotifMessageIds.delete(contentFingerprint), 10000);
      }
      if (msgId) {
        processedNotifMessageIds.add(msgId);
        setTimeout(() => processedNotifMessageIds.delete(msgId), 10000);
      }
      if (senderIdStr) {
        processedNotifMessageIds.add(senderIdStr);
        setTimeout(() => processedNotifMessageIds.delete(senderIdStr), 3000);
      }

      // Check if user is currently looking at this active conversation
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      const isViewingThisChat = Boolean(
        convIdStr &&
          (pathname.includes(`/message/${convIdStr}`) ||
            pathname.endsWith(`/message/${convIdStr}`))
      );

      // Dispatch event to update conversation badges across components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("new-message-received"));
      }

      // If user is currently looking at this active conversation, skip toast (message renders in stream)
      if (isViewingThisChat) {
        return;
      }

      // Play message notification sound
      playNotificationSound("message");

      const displayName = senderName || "Someone";
      const msgPreview = newMsg.description?.startsWith("[CUSTOM_OFFER]")
        ? "sent you a custom proposal"
        : rawText.slice(0, 60) || (fileAttachment ? "sent an attachment" : "sent a message");

      const targetConvId = conversationId || newMsg.conversationID;
      const toastKey = contentFingerprint || msgId || `${senderIdStr}-${Date.now()}`;

      toast.custom(
        (t) => (
          <div
            className={`relative bg-white border-l-4 border-[#0D6D5F] shadow-xl p-4 rounded-[6px] max-w-[350px] flex flex-col gap-1 transition-all duration-300 cursor-pointer pr-6 ${
              t.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            }`}
            onClick={() => {
              toast.dismiss(t.id);
              if (targetConvId) {
                router.push(`/message/${targetConvId}`);
              }
            }}
          >
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-0 w-5 h-5 flex items-center justify-center rounded-full text-base leading-none border-none bg-transparent hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <strong className="text-[#333] text-sm font-bold">💬 {displayName}</strong>
            <p className="text-[#666] text-[13px] m-0 leading-snug line-clamp-2">{msgPreview}</p>
          </div>
        ),
        { id: `chat-toast-${toastKey}`, duration: 5000 }
      );
    };

    // Handler for real-time system notifications
    const handleNewNotification = (newNotif: any) => {
      handleOrderUpdate();

      if (!newNotif) return;

      const notifSenderId =
        newNotif.senderId ||
        newNotif.senderID ||
        newNotif.sender?._id ||
        newNotif.sender?.id ||
        newNotif.sender ||
        newNotif.from?._id ||
        newNotif.from?.id ||
        newNotif.from ||
        newNotif.creatorId ||
        newNotif.creator?._id;

      const notifSenderName =
        newNotif.senderUsername ||
        newNotif.sender_username ||
        newNotif.sender?.username ||
        newNotif.from?.username;

      if (isSenderCurrentUser(notifSenderId, notifSenderName, currentUserId, currentUsername)) {
        return;
      }

      // Skip chat messages (handled exclusively by handleReceiveMessage)
      if (isChatMessageNotif(newNotif)) {
        return;
      }

      // If user is currently on the notifications page, skip toast
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/notifications")) {
        return;
      }

      const notifId = String(
        newNotif._id ||
          newNotif.id ||
          `${newNotif.title || ""}-${newNotif.message || ""}`
      ).trim();

      if (processedNotifIds.has(notifId)) return;
      processedNotifIds.add(notifId);
      setTimeout(() => processedNotifIds.delete(notifId), 8000);

      playNotificationSound("notification");

      toast.custom(
        (t) => (
          <div
            className={`relative bg-white border-l-4 border-[#0D6D5F] shadow-xl p-4 rounded-[6px] max-w-[350px] flex flex-col gap-1 transition-all duration-300 cursor-pointer pr-6 ${
              t.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            }`}
            onClick={() => {
              toast.dismiss(t.id);
              if (newNotif.link) {
                router.push(newNotif.link);
              } else if (newNotif.orderID) {
                router.push(`/orders/${newNotif.orderID}`);
              } else if (newNotif.briefID) {
                router.push(`/briefs/${newNotif.briefID}`);
              } else if (newNotif.proposalID) {
                router.push("/briefs/my-proposals");
              }
            }}
          >
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-0 w-5 h-5 flex items-center justify-center rounded-full text-base leading-none border-none bg-transparent hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <strong className="text-[#333] text-sm font-bold">🔔 {newNotif.title}</strong>
            <p className="text-[#666] text-[13px] m-0 leading-snug line-clamp-2">{newNotif.message}</p>
          </div>
        ),
        { id: `sys-notif-${notifId}`, duration: 5000 }
      );
    };

    joinUser();
    socket.on("connect", joinUser);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("order_updated", handleOrderUpdate);
    socket.on("new_notification", handleNewNotification);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("connect", joinUser);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("order_updated", handleOrderUpdate);
      socket.off("new_notification", handleNewNotification);
      socket.off("notification", handleNewNotification);
    };
  }, [user, queryClient, router]);

  return null;
}
