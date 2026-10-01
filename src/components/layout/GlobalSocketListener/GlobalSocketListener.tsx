"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

    const handleOrderUpdate = (payload?: any) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders-all"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      const targetOrderId =
        payload?.orderID ||
        payload?.orderId ||
        payload?.order?._id ||
        payload?.order?.id;
      if (targetOrderId) {
        queryClient.invalidateQueries({ queryKey: ["order", String(targetOrderId)] });
      }
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    };

    const handleSupportUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-ticket"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
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
        (id) => (
          <div
            className="relative bg-white border-l-4 border-[#0D6D5F] shadow-xl p-4 rounded-[6px] max-w-[350px] flex flex-col gap-1 transition-all duration-300 cursor-pointer pr-6"
            onClick={() => {
              toast.dismiss(id);
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
                toast.dismiss(id);
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
      handleOrderUpdate(newNotif);

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

      // Domain-specific query invalidations based on backend notification payload
      if (newNotif.briefID || newNotif.briefId || newNotif.proposalID || newNotif.proposalId || newNotif.link?.includes("/brief")) {
        queryClient.invalidateQueries({ queryKey: ["briefs"] });
        queryClient.invalidateQueries({ queryKey: ["my-briefs"] });
        queryClient.invalidateQueries({ queryKey: ["proposals"] });
        queryClient.invalidateQueries({ queryKey: ["my-proposals"] });
      }

      if (newNotif.ticketID || newNotif.ticketId || newNotif.link?.includes("/support")) {
        queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
        queryClient.invalidateQueries({ queryKey: ["support-ticket"] });
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
      }

      if (newNotif.type === "payout" || newNotif.link?.includes("/earnings")) {
        queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
        queryClient.invalidateQueries({ queryKey: ["seller-earnings"] });
        queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
        queryClient.invalidateQueries({ queryKey: ["earnings"] });
      }

      if (
        newNotif.link?.includes("/kyc") ||
        newNotif.type === "kyc" ||
        (newNotif.type === "system" && /kyc|verification|identity/i.test(`${newNotif.title || ""} ${newNotif.message || ""}`))
      ) {
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["kyc"] });
        queryClient.invalidateQueries({ queryKey: ["verification"] });
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

      const targetOrderId = newNotif.orderID || newNotif.orderId;
      const targetTicketId = newNotif.ticketID || newNotif.ticketId;
      const targetBriefId = newNotif.briefID || newNotif.briefId;
      const targetProposalId = newNotif.proposalID || newNotif.proposalId;

      toast.custom(
        (id) => (
          <div
            className="relative bg-white border-l-4 border-[#0D6D5F] shadow-xl p-4 rounded-[6px] max-w-[350px] flex flex-col gap-1 transition-all duration-300 cursor-pointer pr-6"
            onClick={() => {
              toast.dismiss(id);
              if (newNotif.link) {
                router.push(newNotif.link);
              } else if (targetOrderId) {
                router.push(`/orders/${targetOrderId}`);
              } else if (targetTicketId) {
                router.push(`/support/${targetTicketId}`);
              } else if (targetBriefId) {
                router.push(`/briefs/${targetBriefId}`);
              } else if (targetProposalId) {
                router.push("/briefs/my-proposals");
              }
            }}
          >
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-0 w-5 h-5 flex items-center justify-center rounded-full text-base leading-none border-none bg-transparent hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(id);
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
    socket.on("order_status_changed", handleOrderUpdate);
    socket.on("receive_support_message", handleSupportUpdate);
    socket.on("new_notification", handleNewNotification);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("connect", joinUser);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("order_updated", handleOrderUpdate);
      socket.off("order_status_changed", handleOrderUpdate);
      socket.off("receive_support_message", handleSupportUpdate);
      socket.off("new_notification", handleNewNotification);
      socket.off("notification", handleNewNotification);
    };
  }, [user, queryClient, router]);

  return null;
}
