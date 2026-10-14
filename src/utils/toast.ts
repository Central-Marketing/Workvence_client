import { toast as sonnerToast } from "sonner";
import type { ExternalToast, ToastT } from "sonner";
import { createElement, isValidElement, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import NavigationToastContent, { ToastIcon, type NavigationToastProps, type ToastNavigation, type ToastVariant } from "../components/ui/WorkvenceToaster/NavigationToastContent";

export type ToastOptions = Pick<ExternalToast,
  "id" | "duration" | "dismissible" | "action" | "cancel" | "onDismiss" | "onAutoClose" | "testId"
> & {
  description?: unknown;
  navigation?: ToastNavigation;
  kind?: "chat";
  icon?: LucideIcon;
  event?: string;
  timestamp?: string;
  avatar?: string;
  image?: string;
  img?: string;
  isOnline?: boolean;
  attachment?: string;
};

/** API validation arrays stay readable; arbitrary response objects never reach React. */
export function normalizeToastContent(value: unknown): ReactNode {
  if (typeof value === "string" || typeof value === "number" || isValidElement(value)) return value;
  if (value == null || typeof value === "boolean") return null;
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) return value.join("\n");
    return value.map(normalizeToastContent);
  }
  return "Unable to display notification details.";
}

function content(value: unknown): ReactNode | (() => ReactNode) {
  return typeof value === "function" ? () => normalizeToastContent(value()) : normalizeToastContent(value);
}

// Explicitly whitelist behavior options so untyped callers cannot override the design.
function options(data: ToastOptions = {}): ExternalToast {
  const result: ExternalToast = {};
  for (const key of ["id", "duration", "dismissible", "action", "cancel", "onDismiss", "onAutoClose", "testId"] as const) {
    if (key in data) Object.assign(result, { [key]: data[key] });
  }
  if ("description" in data) result.description = content(data.description);
  return result;
}

function emit(type: ToastVariant, message: unknown, data: ToastOptions = {}) {
  const existing = data.id === undefined ? undefined : sonnerToast.getToasts().find((item): item is ToastT => item.id === data.id && !("dismiss" in item));
  const previous = isValidElement<NavigationToastProps>(existing?.title) && existing.title.type === NavigationToastContent
    ? existing.title.props : undefined;
  const navigation = "navigation" in data ? data.navigation : previous?.navigation;
  const kind = data.kind ?? previous?.kind;
  const icon = data.icon ?? previous?.icon;
  const timestamp = data.timestamp ?? previous?.timestamp;
  const avatar = data.avatar ?? data.image ?? data.img ?? previous?.avatar ?? previous?.image ?? (previous as any)?.img;
  const isOnline = data.isOnline ?? previous?.isOnline;
  const attachment = data.attachment ?? previous?.attachment;
  const effectiveType = type === "neutral" ? "default" : type;
  const publish = effectiveType === "default" ? sonnerToast : sonnerToast[effectiveType];
  const toastOptions = options(data);

  if (navigation && effectiveType !== "loading") {
    const description = "description" in data ? content(data.description) : previous?.description ?? existing?.description;
    const title = createElement(NavigationToastContent, {
      title: content(message),
      description,
      variant: type,
      kind,
      icon,
      navigation,
      timestamp,
      avatar,
      image: avatar,
      isOnline,
      attachment,
      dismiss: () => sonnerToast.dismiss(id),
    });
    const id = publish(title, {
      ...toastOptions,
      icon: null,
      description: undefined,
      action: undefined,
      cancel: undefined,
      classNames: {
        toast:
          kind === "chat"
            ? "workvence-toast-navigation workvence-toast-chat"
            : "workvence-toast-navigation workvence-toast-system",
      },
    });
    return id;
  }

  return publish(content(message), {
    ...toastOptions,
    ...(previous ? { classNames: {}, description: "description" in data ? content(data.description) : previous.description } : {}),
    icon: icon || kind || effectiveType === "default"
      ? createElement(ToastIcon, { variant: type, kind, icon })
      : undefined,
  });
}

function show(message: unknown, data?: ToastOptions) {
  return emit("default", message, data);
}

function variant(type: "success" | "error" | "info" | "warning" | "loading") {
  return (message: unknown, data?: ToastOptions) => emit(type, message, data);
}

export const toast = Object.assign(show, {
  success: variant("success"),
  error: variant("error"),
  info: variant("info"),
  warning: variant("warning"),
  loading: variant("loading"),
  neutral: (message: unknown, data?: ToastOptions) => emit("neutral", message, data),
  message: show,
  dismiss: sonnerToast.dismiss,
});

export default toast;

