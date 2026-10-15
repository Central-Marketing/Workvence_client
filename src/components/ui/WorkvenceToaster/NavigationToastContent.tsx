"use client";

import { useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Check,
  CircleAlert,
  CircleCheck,
  Info,
  Loader2,
  MessageSquare,
  Paperclip,
  TriangleAlert,
  X,
} from "lucide-react";

export type ToastVariant = "default" | "neutral" | "success" | "error" | "warning" | "info" | "loading";
export type ToastNavigation = { label: string; actionLabel?: string; onClick: () => void };
type Content = ReactNode | (() => ReactNode);

export function ToastIcon({
  variant,
  kind,
  icon: CustomIcon,
}: {
  variant: ToastVariant;
  kind?: "chat";
  icon?: LucideIcon;
}) {
  const Icon = CustomIcon
    ? CustomIcon
    : kind === "chat"
    ? MessageSquare
    : {
        default: Bell,
        neutral: Bell,
        success: Check,
        error: X,
        warning: TriangleAlert,
        info: Info,
        loading: Loader2,
      }[variant] || Bell;

  const strokeWidth = variant === "success" ? 3 : variant === "error" ? 2.5 : 2;

  return (
    <Icon
      aria-hidden="true"
      strokeWidth={strokeWidth}
      className={variant === "loading" ? "workvence-toast-spinner" : undefined}
    />
  );
}

export interface NavigationToastProps {
  title: Content;
  description?: Content;
  variant: ToastVariant;
  kind?: "chat";
  icon?: LucideIcon;
  navigation?: ToastNavigation;
  timestamp?: string;
  avatar?: string;
  image?: string;
  img?: string;
  isOnline?: boolean;
  attachment?: string;
  dismiss: () => void;
}

export default function NavigationToastContent({
  title,
  description,
  variant,
  kind,
  icon,
  navigation,
  timestamp,
  avatar,
  image,
  isOnline,
  attachment,
  dismiss,
}: NavigationToastProps) {
  const activated = useRef(false);
  const [imgFailed, setImgFailed] = useState(false);
  const rawBody = typeof description === "function" ? description() : description;
  const rawTitle = typeof title === "function" ? title() : title;

  const displayTitle = rawTitle != null && rawTitle !== "" ? rawTitle : "Notification";
  const displayBody = rawBody != null && rawBody !== "" ? rawBody : null;

  const handleAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (activated.current) return;
    activated.current = true;
    navigation?.onClick();
    dismiss();
  };

  // Dedicated Chat Message Toast Layout
  if (kind === "chat") {
    const avatarSrc = avatar || image;
    const initial =
      typeof displayTitle === "string" && displayTitle.trim()
        ? displayTitle.trim().charAt(0).toUpperCase()
        : "U";

    const hasAttachment = Boolean(attachment);
    const attachmentName =
      typeof attachment === "string"
        ? attachment.split("/").pop()?.split("?")[0] || "attachment"
        : "";

    return (
      <div className="workvence-toast-chat-card flex items-start gap-3 w-full pr-6 select-none">
        {/* Avatar with Green Online Status Dot (rounded-[6px]) */}
        <div className="relative shrink-0 w-11 h-11">
          <div className="w-11 h-11 rounded-[6px] overflow-hidden bg-gray-100 border border-gray-200/80 flex items-center justify-center">
            {avatarSrc && !imgFailed ? (
              <img
                src={avatarSrc}
                alt={typeof displayTitle === "string" ? displayTitle : "User avatar"}
                className="w-full h-full object-cover rounded-[6px]"
                loading="eager"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="text-sm font-semibold text-gray-600 uppercase">
                {initial}
              </span>
            )}
          </div>
          {isOnline && (
            <span
              aria-label="Online"
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full shadow-xs"
            />
          )}
        </div>

        {/* Message Details */}
        <div className="min-w-0 flex-1">
          {/* Header Row: Sender Name | Timestamp */}
          <div className="flex items-center gap-2 text-sm leading-none pt-0.5">
            <span className="font-semibold text-gray-900 truncate">
              {displayTitle}
            </span>
            <span className="text-gray-300 select-none">|</span>
            <span className="text-xs text-gray-500 font-normal shrink-0">
              {timestamp || "Just now"}
            </span>
          </div>

          {/* Body: max 2 lines with ellipsis */}
          {displayBody ? (
            <div className="mt-1">
              <p className="text-[13px] text-gray-600 leading-snug line-clamp-2 break-words">
                {displayBody}
              </p>
              {hasAttachment && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Paperclip className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{attachmentName}</span>
                </p>
              )}
            </div>
          ) : hasAttachment ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-600 leading-snug">
              <Paperclip className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="truncate">
                {attachmentName ? `Sent an attachment: ${attachmentName}` : "Sent an attachment"}
              </span>
            </p>
          ) : null}

          {/* Action: Single Reply button with black bg, rounded-[6px] */}
          {navigation && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                className="workvence-toast-reply-btn px-4 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-[6px] shadow-xs transition-colors cursor-pointer"
                aria-label={navigation.label}
                onClick={handleAction}
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Design 2: System Action / Navigation Toast (Dark Card Layout)
  const getActionLabel = (nav?: ToastNavigation) => {
    if (!nav) return "View";
    if (nav.actionLabel) {
      if (/view order/i.test(nav.actionLabel)) return "View order";
      if (/review/i.test(nav.actionLabel)) return "Review";
      if (/open|conversation|chat/i.test(nav.actionLabel)) return "View";
      if (/details/i.test(nav.actionLabel)) return "Details";
      return nav.actionLabel.length <= 16 ? nav.actionLabel : "View";
    }
    return "View";
  };

  const actionText = getActionLabel(navigation);

  return (
    <div className="workvence-toast-system-card flex items-start gap-3 w-full pr-6 select-none">
      {/* 6px Icon Badge with light background & subtle border */}
      <div className="shrink-0 w-10 h-10 rounded-[6px] bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-700">
        <ToastIcon variant={variant} kind={kind} icon={icon} />
      </div>

      {/* Content Details */}
      <div className="min-w-0 flex-1">
        {/* Header Row: Title | Tag / Timestamp */}
        <div className="flex items-center gap-2 text-sm leading-none pt-0.5">
          <span className="font-semibold text-gray-900 truncate">
            {displayTitle}
          </span>
          {timestamp && (
            <>
              <span className="text-gray-300 select-none">|</span>
              <span className="text-xs text-gray-500 font-normal shrink-0">
                {timestamp}
              </span>
            </>
          )}
        </div>

        {/* Description body */}
        {displayBody != null && (
          <p className="mt-1 text-[13px] text-gray-600 leading-snug line-clamp-2 break-words">
            {displayBody}
          </p>
        )}

        {/* Action Button: Rounded 6px dark action button on light card */}
        {navigation && (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              className="workvence-toast-system-btn px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-[6px] border border-black shadow-xs transition-colors cursor-pointer"
              aria-label={navigation.label}
              onClick={handleAction}
            >
              {actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
