"use client";

import { X } from "lucide-react";
import { Toaster } from "sonner";
import { ToastIcon } from "./NavigationToastContent";
import "./WorkvenceToaster.css";

export default function WorkvenceToaster() {
  return (
    <Toaster
      className="workvence-toaster"
      theme="light"
      position="bottom-right"
      visibleToasts={3}
      duration={4000}
      closeButton
      offset={{ bottom: "max(24px, env(safe-area-inset-bottom))", right: "24px" }}
      mobileOffset={{ bottom: "calc(16px + env(safe-area-inset-bottom))", left: "16px", right: "16px" }}
      toastOptions={{ unstyled: true, closeButtonAriaLabel: "Dismiss notification" }}
      icons={{
        success: <ToastIcon variant="success" />,
        error: <ToastIcon variant="error" />,
        warning: <ToastIcon variant="warning" />,
        info: <ToastIcon variant="info" />,
        loading: <ToastIcon variant="loading" />,
        close: <X size={16} aria-hidden="true" />,
      }}
    />
  );
}
