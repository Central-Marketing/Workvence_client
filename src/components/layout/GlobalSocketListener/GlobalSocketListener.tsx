"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { socket } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { playNotificationSound } from "@/utils/soundUtil";

const getNotificationType = (notif: any): "success" | "warning" | "error" | "info" | "default" => {
  if (!notif) return "default";
  const type = String(notif.type || "").toLowerCase();
  const title = String(notif.title || "").toLowerCase();
  const message = String(notif.message || notif.desc || notif.description || "").toLowerCase();
  const fullText = `${type} ${title} ${message}`;

  if (/cancel|dispute|reject|fail|decline|suspend|terminate|refund/i.test(fullText)) {
    return "error";
  }

  if (/extension|extend|revision|warning|caution|pending|expire|action required|overdue|late/i.test(fullText)) {
    return "warning";
  }

  if (
    /new order|order received|order placed|placed an order|delivered|delivery accepted|complete|success|paid|payout|released|accepted|tip|verified|approved|congrat/i.test(
      fullText
    )
  ) {
    return "success";
  }

  if (/message|chat|support|ticket|proposal|brief|review|comment|feedback|update|notification/i.test(fullText)) {
    return "info";
  }

  return "default";
};

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

      toast.info(displayName, {
        id: `chat-toast-${toastKey}`,
        description: msgPreview,
        duration: 5000,
        ...(targetConvId
          ? {
              action: {
                label: "View",
                onClick: () => {
                  router.push(`/message/${targetConvId}`);
                },
              },
            }
          : {}),
      });
    };

    // Handler for real-time system notifications
    const handleNewNotification = (newNotif: any) => {
      handleOrderUpdate(newNotif);

      if (!newNotif) return;

      // Account standing sync (suspend / unsuspend / warning / lockout) — runs before any early return
      const standingAction = String(newNotif.action || newNotif.event || "").toLowerCase();
      const standingText = `${newNotif.title || ""} ${newNotif.message || ""}`;
      const isAccountLockout =
        standingAction === "account_locked" ||
        standingAction === "lockout" ||
        standingAction === "grace_expired" ||
        newNotif.code === "ACCOUNT_LOCKED" ||
        /grace period (has )?expired/i.test(standingText) ||
        /account (has been )?locked/i.test(standingText);
      const isWarningRemoval =
        /(remove|clear|lift|revoke|expire|withdraw)/.test(standingAction) && /warn/.test(standingAction) ||
        /warning\s+(has\s+been\s+)?(removed|lifted|cleared|revoked|withdrawn|expired)/i.test(standingText);
      const isWarningIssue =
        !isWarningRemoval &&
        (["warning", "warn", "issue_warning", "warning_issued", "add_warning"].includes(standingAction) ||
          /(policy|account|official)\s+warning/i.test(String(newNotif.title || "")));
      const isUnsuspend =
        ["unsuspend", "reinstate", "reinstated", "unsuspended", "lift_suspension"].includes(standingAction) ||
        /reinstated|suspension\s+(has\s+been\s+)?lifted/i.test(standingText);
      const isSuspend =
        !isUnsuspend &&
        (["suspend", "suspended"].includes(standingAction) || /account\s+suspended/i.test(String(newNotif.title || "")));
      const isStandingNotif =
        isAccountLockout ||
        isWarningRemoval ||
        isWarningIssue ||
        isUnsuspend ||
        isSuspend ||
        typeof newNotif.isSuspended === "boolean" ||
        typeof newNotif.isWarningActive === "boolean" ||
        /suspen|reinstat|account standing|warning|lockout/i.test(String(newNotif.title || ""));

      if (isStandingNotif) {
        const targetUserId = String(newNotif.userID || newNotif.userId || "").trim();
        const isForCurrentUser = !targetUserId || targetUserId === currentUserId;

        if (isForCurrentUser) {
          const standingPatch: Record<string, any> = {};

          // Suspension: explicit payload flag wins, otherwise infer from action/title
          if (typeof newNotif.isSuspended === "boolean") standingPatch.isSuspended = newNotif.isSuspended;
          else if (isUnsuspend) standingPatch.isSuspended = false;
          else if (isSuspend) standingPatch.isSuspended = true;
          if (standingPatch.isSuspended === true) {
            if (newNotif.suspensionReason) standingPatch.suspensionReason = newNotif.suspensionReason;
            standingPatch.suspendedAt = newNotif.suspendedAt || newNotif.createdAt || new Date().toISOString();
            if (newNotif.accessUntil) standingPatch.accessUntil = newNotif.accessUntil;
            if (typeof newNotif.accessDays === "number") standingPatch.accessDays = newNotif.accessDays;
            if (newNotif.metricsResetAt) standingPatch.metricsResetAt = newNotif.metricsResetAt;
          }

          // Warning: explicit payload flag wins, otherwise infer from action/title
          if (typeof newNotif.isWarningActive === "boolean") standingPatch.isWarningActive = newNotif.isWarningActive;
          else if (isWarningRemoval) standingPatch.isWarningActive = false;
          else if (isWarningIssue) standingPatch.isWarningActive = true;
          if (standingPatch.isWarningActive === false) {
            // useAccountStanding treats a future warningExpiresAt as active, so clear it too
            standingPatch.warningExpiresAt = null;
          } else if (newNotif.warningExpiresAt) {
            standingPatch.warningExpiresAt = newNotif.warningExpiresAt;
          }
          if (standingPatch.isWarningActive === true && newNotif.warningReason) {
            standingPatch.warningReason = newNotif.warningReason;
          }

          if (Object.keys(standingPatch).length > 0) {
            // Instant UI update for components reading the user store
            const storeUser = useUserStore.getState().user;
            if (storeUser) {
              useUserStore.getState().setUser({ ...storeUser, ...standingPatch });
            }
            // Instant UI update for useAccountStanding (cached remote user takes precedence over store)
            queryClient.setQueryData(["auth-me-standing"], (old: any) =>
              old ? { ...old, ...standingPatch } : old
            );
          }

          // Confirm with server now, and again shortly after in case the first read raced the DB write
          const confirmStanding = () => {
            queryClient.invalidateQueries({ queryKey: ["auth-me-standing"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
          };
          confirmStanding();
          setTimeout(confirmStanding, 2000);
        }
      }

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

      const targetOrderId = newNotif.orderID || newNotif.orderId;
      const targetTicketId = newNotif.ticketID || newNotif.ticketId;
      const targetBriefId = newNotif.briefID || newNotif.briefId;
      const targetProposalId = newNotif.proposalID || newNotif.proposalId;

      // If user is currently looking at this open support ticket, skip toast (message renders live in stream)
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (
        (targetTicketId && currentPath.includes(`/support/${targetTicketId}`)) ||
        (newNotif.type === "support" && newNotif.link && currentPath === newNotif.link)
      ) {
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

      const handleOpenNotification = () => {
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
      };

      const notifType = getNotificationType(newNotif);
      const toastFn =
        notifType === "success"
          ? toast.success
          : notifType === "warning"
          ? toast.warning
          : notifType === "error"
          ? toast.error
          : notifType === "info"
          ? toast.info
          : toast;

      const hasAction = Boolean(
        newNotif.link || targetOrderId || targetTicketId || targetBriefId || targetProposalId
      );

      toastFn(newNotif.title || "Notification", {
        id: `sys-notif-${notifId}`,
        description: newNotif.message,
        duration: 5000,
        ...(hasAction
          ? {
              action: {
                label: "View",
                onClick: handleOpenNotification,
              },
            }
          : {}),
      });
    };

    joinUser();
    socket.on("connect", joinUser);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("order_updated", handleOrderUpdate);
    socket.on("order_status_changed", handleOrderUpdate);
    socket.on("receive_support_message", handleSupportUpdate);
    socket.on("new_notification", handleNewNotification);
    socket.on("notification", handleNewNotification);
    socket.on("notification_received", handleNewNotification);

    return () => {
      socket.off("connect", joinUser);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("order_updated", handleOrderUpdate);
      socket.off("order_status_changed", handleOrderUpdate);
      socket.off("receive_support_message", handleSupportUpdate);
      socket.off("new_notification", handleNewNotification);
      socket.off("notification", handleNewNotification);
      socket.off("notification_received", handleNewNotification);
    };
  }, [user, queryClient, router]);

  return null;
}
