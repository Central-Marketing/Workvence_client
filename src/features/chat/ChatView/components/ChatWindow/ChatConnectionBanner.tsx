"use client";

import React from "react";
import { WifiOff, RefreshCw, Check } from "lucide-react";
import { ChatConnectionState } from "../../hooks/useNetworkStatus";

interface ChatConnectionBannerProps {
  connectionState: ChatConnectionState;
  justReconnected?: boolean;
  onRetry?: () => void;
}

export const ChatConnectionBanner: React.FC<ChatConnectionBannerProps> = ({
  connectionState,
  justReconnected = false,
  onRetry,
}) => {
  // If normally connected and not in the brief "just reconnected" success flash, render nothing
  if (connectionState === "connected" && !justReconnected) {
    return null;
  }

  if (justReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-[#E8F8F5] border-b border-[#A2E2D5] px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-medium text-[#0D6D5F] shadow-2xs transition-all duration-300 animate-in fade-in slide-in-from-top-1"
      >
        <Check className="w-3.5 h-3.5 text-[#0D6D5F] shrink-0" />
        <span>Connected. Syncing messages...</span>
      </div>
    );
  }

  if (connectionState === "offline") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-[#FFF3CD] border-b border-[#FFEBAA] px-4 py-1.5 flex items-center justify-between text-xs font-medium text-[#856404] shadow-2xs transition-all duration-300 animate-in fade-in slide-in-from-top-1"
      >
        <div className="flex items-center gap-2 truncate">
          <WifiOff className="w-3.5 h-3.5 text-[#856404] shrink-0" />
          <span className="truncate">
            Computer not connected. Messages will send automatically once reconnected.
          </span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-3 shrink-0 underline hover:no-underline font-semibold text-[#856404] cursor-pointer"
          >
            Retry now
          </button>
        )}
      </div>
    );
  }

  // connectionState === "reconnecting"
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#FFF8E7] border-b border-[#FFE8B3] px-4 py-1.5 flex items-center justify-between text-xs font-medium text-[#975A16] shadow-2xs transition-all duration-300 animate-in fade-in slide-in-from-top-1"
    >
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 text-[#975A16] animate-spin shrink-0" />
        <span>Connecting to chat...</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-3 shrink-0 underline hover:no-underline font-semibold text-[#975A16] cursor-pointer"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};
