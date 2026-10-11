import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Info,
  LockKeyhole,
  MessageSquare,
  Package,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";

export type ToastVariant = "neutral" | "info" | "success" | "warning" | "error";
export type NotificationToastType = "success" | "warning" | "error" | "info" | "neutral";

export interface NotificationPresentation {
  variant: ToastVariant;
  icon: LucideIcon;
  title?: string;
  actionLabel?: string;
}

export interface NotificationToastPayload {
  action?: unknown;
  event?: unknown;
  type?: unknown;
  title?: unknown;
  message?: unknown;
  desc?: unknown;
  description?: unknown;
  link?: unknown;
  orderID?: unknown;
  orderId?: unknown;
  ticketID?: unknown;
  ticketId?: unknown;
  briefID?: unknown;
  briefId?: unknown;
  proposalID?: unknown;
  proposalId?: unknown;
}

const text = (value: unknown): string => typeof value === "string" ? value : "";
const key = (value: unknown): string => text(value).trim().toLowerCase().replace(/[\s-]+/g, "_");

export const notificationPresentation: Record<string, NotificationPresentation> = {
  // Chat & messaging
  receive_message: { variant: "info", icon: MessageSquare, title: "New Message", actionLabel: "Open conversation" },
  "receive-message": { variant: "info", icon: MessageSquare, title: "New Message", actionLabel: "Open conversation" },
  chat: { variant: "info", icon: MessageSquare, title: "Chat Message", actionLabel: "Open conversation" },
  message: { variant: "info", icon: MessageSquare, title: "New Message", actionLabel: "Open conversation" },
  new_message: { variant: "info", icon: MessageSquare, title: "New Message", actionLabel: "Open conversation" },
  custom_offer: { variant: "info", icon: MessageSquare, title: "Custom Proposal", actionLabel: "Open conversation" },
  custom_proposal: { variant: "info", icon: MessageSquare, title: "Custom Proposal", actionLabel: "Open conversation" },

  // Orders
  order_completed: { variant: "success", icon: CircleCheck, title: "Order Completed", actionLabel: "View order" },
  order_complete: { variant: "success", icon: CircleCheck, title: "Order Completed", actionLabel: "View order" },
  delivery_accepted: { variant: "success", icon: CircleCheck, title: "Delivery Accepted", actionLabel: "View order" },
  order_delivered: { variant: "info", icon: Package, title: "Work Delivered", actionLabel: "Review delivery" },
  delivery_submitted: { variant: "info", icon: Package, title: "Delivery Submitted", actionLabel: "Review delivery" },
  new_order: { variant: "success", icon: Package, title: "New Order Received", actionLabel: "View order" },
  order_created: { variant: "success", icon: Package, title: "New Order", actionLabel: "View order" },
  order_placed: { variant: "success", icon: Package, title: "Order Placed", actionLabel: "View order" },
  order_cancelled: { variant: "error", icon: CircleX, title: "Order Cancelled", actionLabel: "View order" },
  order_canceled: { variant: "error", icon: CircleX, title: "Order Cancelled", actionLabel: "View order" },
  order_updated: { variant: "info", icon: Package, title: "Order Updated", actionLabel: "View order" },
  order_status_changed: { variant: "info", icon: Package, title: "Order Status Updated", actionLabel: "View order" },

  // Revisions & Extensions
  revision_requested: { variant: "warning", icon: ClipboardCheck, title: "Revision Requested", actionLabel: "View revision" },
  revision_pending: { variant: "warning", icon: ClipboardCheck, title: "Revision Pending", actionLabel: "View revision" },
  extension_requested: { variant: "warning", icon: Clock, title: "Time Extension Requested", actionLabel: "Review request" },
  extension_pending: { variant: "warning", icon: Clock, title: "Extension Pending", actionLabel: "Review request" },
  extension_approved: { variant: "success", icon: CircleCheck, title: "Extension Approved", actionLabel: "View order" },
  extension_accepted: { variant: "success", icon: CircleCheck, title: "Extension Accepted", actionLabel: "View order" },
  time_extension_approved: { variant: "success", icon: CircleCheck, title: "Extension Approved", actionLabel: "View order" },
  extension_declined: { variant: "error", icon: CircleX, title: "Extension Declined", actionLabel: "View order" },
  extension_rejected: { variant: "error", icon: CircleX, title: "Extension Rejected", actionLabel: "View order" },

  // Payments, Refunds & Payouts
  payment_completed: { variant: "success", icon: CircleCheck, title: "Payment Completed", actionLabel: "View order" },
  payment_successful: { variant: "success", icon: CircleCheck, title: "Payment Successful", actionLabel: "View order" },
  payment_failed: { variant: "error", icon: CircleX, title: "Payment Failed", actionLabel: "View details" },
  refund_successful: { variant: "success", icon: CircleCheck, title: "Refund Successful", actionLabel: "View details" },
  refund_completed: { variant: "success", icon: CircleCheck, title: "Refund Completed", actionLabel: "View details" },
  refunded: { variant: "success", icon: CircleCheck, title: "Refund Completed", actionLabel: "View details" },
  refund_requested: { variant: "warning", icon: Clock, title: "Refund Requested", actionLabel: "View details" },
  refund_pending: { variant: "warning", icon: Clock, title: "Refund Pending", actionLabel: "View details" },
  refund_failed: { variant: "error", icon: CircleX, title: "Refund Failed", actionLabel: "View details" },
  payout_completed: { variant: "success", icon: Wallet, title: "Payout Completed", actionLabel: "View earnings" },
  payout_failed: { variant: "error", icon: CircleX, title: "Payout Failed", actionLabel: "View earnings" },

  // KYC & Account Standing
  kyc_approved: { variant: "success", icon: ShieldCheck, title: "Identity Verified", actionLabel: "View verification" },
  kyc_rejected: { variant: "error", icon: ShieldAlert, title: "Verification Failed", actionLabel: "Review verification" },
  suspend: { variant: "error", icon: ShieldAlert, title: "Account Suspended", actionLabel: "Account status" },
  suspended: { variant: "error", icon: ShieldAlert, title: "Account Suspended", actionLabel: "Account status" },
  account_suspended: { variant: "error", icon: ShieldAlert, title: "Account Suspended", actionLabel: "Account status" },
  account_locked: { variant: "error", icon: LockKeyhole, title: "Account Locked", actionLabel: "Account status" },
  lockout: { variant: "error", icon: LockKeyhole, title: "Account Locked", actionLabel: "Account status" },
  grace_expired: { variant: "error", icon: LockKeyhole, title: "Grace Period Expired", actionLabel: "Account status" },
  unsuspend: { variant: "success", icon: CircleCheck, title: "Account Reinstated", actionLabel: "Account status" },
  unsuspended: { variant: "success", icon: CircleCheck, title: "Account Reinstated", actionLabel: "Account status" },
  reinstate: { variant: "success", icon: CircleCheck, title: "Account Reinstated", actionLabel: "Account status" },
  reinstated: { variant: "success", icon: CircleCheck, title: "Account Reinstated", actionLabel: "Account status" },
  lift_suspension: { variant: "success", icon: CircleCheck, title: "Suspension Lifted", actionLabel: "Account status" },
  account_reinstated: { variant: "success", icon: CircleCheck, title: "Account Reinstated", actionLabel: "Account status" },
  account_unsuspended: { variant: "success", icon: CircleCheck, title: "Account Reinstated", actionLabel: "Account status" },
  suspension_lifted: { variant: "success", icon: CircleCheck, title: "Suspension Lifted", actionLabel: "Account status" },
  warning: { variant: "warning", icon: TriangleAlert, title: "Account Notice", actionLabel: "View notice" },
  warn: { variant: "warning", icon: TriangleAlert, title: "Account Notice", actionLabel: "View notice" },
  issue_warning: { variant: "warning", icon: TriangleAlert, title: "Warning Issued", actionLabel: "View notice" },
  warning_issued: { variant: "warning", icon: TriangleAlert, title: "Warning Issued", actionLabel: "View notice" },
  add_warning: { variant: "warning", icon: TriangleAlert, title: "Warning Issued", actionLabel: "View notice" },
  warning_removed: { variant: "success", icon: CircleCheck, title: "Warning Cleared", actionLabel: "Account status" },
  warning_cleared: { variant: "success", icon: CircleCheck, title: "Warning Cleared", actionLabel: "Account status" },
  warning_lifted: { variant: "success", icon: CircleCheck, title: "Warning Cleared", actionLabel: "Account status" },
  remove_warning: { variant: "success", icon: CircleCheck, title: "Warning Cleared", actionLabel: "Account status" },
  clear_warning: { variant: "success", icon: CircleCheck, title: "Warning Cleared", actionLabel: "Account status" },

  // Support & Proposals
  support: { variant: "info", icon: Info, title: "Support Ticket Update", actionLabel: "View ticket" },
  support_ticket: { variant: "info", icon: Info, title: "Support Ticket Update", actionLabel: "View ticket" },
  receive_support_message: { variant: "info", icon: Info, title: "Support Message", actionLabel: "View ticket" },
  brief: { variant: "info", icon: ClipboardList, title: "Brief Notification", actionLabel: "View brief" },
  proposal: { variant: "info", icon: ClipboardList, title: "Proposal Update", actionLabel: "View proposal" },
};

const semanticTypes: Record<string, NotificationPresentation> = {
  success: { variant: "success", icon: CircleCheck, title: "Success", actionLabel: "View details" },
  error: { variant: "error", icon: CircleX, title: "Error", actionLabel: "View details" },
  warning: { variant: "warning", icon: TriangleAlert, title: "Warning", actionLabel: "View details" },
  info: { variant: "info", icon: Info, title: "Information", actionLabel: "View details" },
  neutral: { variant: "neutral", icon: Bell, title: "Notification", actionLabel: "Open notification" },
};

export function getNotificationDescription(notif: NotificationToastPayload): unknown {
  return notif.message || notif.desc || notif.description;
}

export function getNotificationPresentation(notif?: NotificationToastPayload | null): NotificationPresentation {
  if (!notif) return { variant: "info", icon: Bell, title: "Notification" };

  for (const value of [notif.action, notif.event]) {
    const k = key(value);
    if (Object.hasOwn(notificationPresentation, k)) return notificationPresentation[k];
  }

  const typeKey = key(notif.type);
  if (Object.hasOwn(notificationPresentation, typeKey)) return notificationPresentation[typeKey];
  if (Object.hasOwn(semanticTypes, typeKey)) return semanticTypes[typeKey];

  const fullText = [text(notif.type), text(notif.title), text(getNotificationDescription(notif))]
    .join(" ").toLowerCase().replace(/[_-]/g, " ");

  // KYC heuristics
  if (/\b(?:kyc|identity|verification)\b/.test(fullText)) {
    if (/\b(?:approved|verified|passed|successful)\b/.test(fullText)) {
      return { variant: "success", icon: ShieldCheck, title: "Identity Verified", actionLabel: "View verification" };
    }
    if (/\b(?:rejected|failed|declined)\b/.test(fullText)) {
      return { variant: "error", icon: ShieldAlert, title: "Verification Failed", actionLabel: "Review verification" };
    }
  }

  // Account lockout / suspension
  if (/\b(?:account\s+locked|lockout|grace\s+period\s+(?:has\s+)?expired)\b/.test(fullText)) {
    return { variant: "error", icon: LockKeyhole, title: "Account Locked", actionLabel: "Account status" };
  }
  if (/\b(?:account\s+suspended|suspended|suspend)\b/.test(fullText) && !/\b(?:unsuspend|lifted|reinstated)\b/.test(fullText)) {
    return { variant: "error", icon: ShieldAlert, title: "Account Suspended", actionLabel: "Account status" };
  }

  // Negative outcomes
  if (/\b(failed?|failure|rejected?|declined?|refused|unsuccessful)\b|\bnot\s+(?:been\s+)?(?:approved|accepted|completed|successful|verified|paid)\b/.test(fullText)) {
    return { variant: "error", icon: CircleX, title: "Action Failed", actionLabel: "View details" };
  }
  if (/\b(?:unsuspended|reinstated)\b|\b(?:warning|suspension)\s+(?:(?:has been|was|is)\s+)?(?:removed|cleared|lifted|revoked|withdrawn)\b/.test(fullText)) {
    return { variant: "success", icon: CircleCheck, title: "Status Updated", actionLabel: "Account status" };
  }
  if (/\b(?:terminated|cancelled|canceled|dispute)\b/.test(fullText)) {
    return { variant: "error", icon: CircleX, title: "Order Cancelled", actionLabel: "View order" };
  }

  // Revision / extension / pending requests
  if (/\b(?:revision)\b/.test(fullText)) {
    return { variant: "warning", icon: ClipboardCheck, title: "Revision Requested", actionLabel: "View revision" };
  }
  if (/\b(?:pending|awaiting|requested|request|overdue|expired|expiring|late|action required)\b/.test(fullText) &&
      !/\b(?:approved|accepted|completed|successful|successfully|refunded)\b/.test(fullText)) {
    return { variant: "warning", icon: Clock, title: "Pending Action", actionLabel: "Review request" };
  }

  // Completed / approved / positive
  if (/\b(?:approved|accepted|completed?|success(?:ful|fully)?|paid|released|verified|refunded|delivered|congratulations)\b|\b(?:new order|order received|order placed|placed an order)\b/.test(fullText)) {
    const isOrder = /\border|delivery|delivered\b/.test(fullText);
    return {
      variant: "success",
      icon: isOrder ? Package : CircleCheck,
      title: "Success",
      actionLabel: isOrder ? "View order" : "View details",
    };
  }

  if (/\b(?:chat|message|conversation)\b/.test(fullText)) {
    return { variant: "info", icon: MessageSquare, title: "Message", actionLabel: "Open conversation" };
  }
  if (/\b(?:ticket|support)\b/.test(fullText)) {
    return { variant: "info", icon: Info, title: "Support Update", actionLabel: "View ticket" };
  }
  if (/\b(?:brief|proposal)\b/.test(fullText)) {
    return { variant: "info", icon: ClipboardList, title: "Proposal Update", actionLabel: "View proposal" };
  }

  // Fallback for unknown notifications
  return { variant: "info", icon: Bell, title: "Notification", actionLabel: "Open notification" };
}

export function getNotificationToastType(notif?: NotificationToastPayload | null): NotificationToastType {
  return getNotificationPresentation(notif).variant;
}
