"use client";

import { useRef, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CircleAlert,
  CircleCheck,
  Info,
  Loader2,
  MessageSquare,
  TriangleAlert,
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
        success: CircleCheck,
        error: CircleAlert,
        warning: TriangleAlert,
        info: Info,
        loading: Loader2,
      }[variant] || Bell;

  return (
    <Icon aria-hidden="true" className={variant === "loading" ? "workvence-toast-spinner" : undefined} />
  );
}

export interface NavigationToastProps {
  title: Content;
  description?: Content;
  variant: ToastVariant;
  kind?: "chat";
  icon?: LucideIcon;
  navigation?: ToastNavigation;
  dismiss: () => void;
}

export default function NavigationToastContent({
  title,
  description,
  variant,
  kind,
  icon,
  navigation,
  dismiss,
}: NavigationToastProps) {
  const activated = useRef(false);
  const rawBody = typeof description === "function" ? description() : description;
  const rawTitle = typeof title === "function" ? title() : title;

  const displayTitle = rawTitle != null && rawTitle !== "" ? rawTitle : "Notification";
  const displayBody = rawBody != null && rawBody !== "" ? rawBody : null;

  const getActionLabel = (nav?: ToastNavigation) => {
    if (!nav) return "View";
    if (nav.actionLabel) {
      if (/view order/i.test(nav.actionLabel)) return "View order";
      if (/review/i.test(nav.actionLabel)) return "Review";
      if (/open|conversation|chat/i.test(nav.actionLabel)) return "View";
      if (/details/i.test(nav.actionLabel)) return "Details";
      return nav.actionLabel.length <= 12 ? nav.actionLabel : "View";
    }
    return "View";
  };

  const actionText = getActionLabel(navigation);

  return (
    <div className="workvence-toast-nav-wrapper">
      <span data-icon="" className="workvence-toast-icon-badge">
        <ToastIcon variant={variant} kind={kind} icon={icon} />
      </span>
      <div className="workvence-toast-copy min-w-0 flex-1">
        <div data-toast-title="" className="workvence-toast-title truncate">
          {displayTitle}
        </div>
        {displayBody != null && (
          <div data-description="" className="workvence-toast-desc truncate">
            {displayBody}
          </div>
        )}
      </div>
      {navigation && (
        <button
          type="button"
          className="workvence-toast-action-btn"
          aria-label={navigation.label}
          onClick={(event) => {
            event.stopPropagation();
            if (activated.current) return;
            activated.current = true;
            navigation.onClick();
            dismiss();
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
