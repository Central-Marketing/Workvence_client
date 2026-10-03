"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import { getTagColor } from "@/utils/chatHelpers";

interface ConversationTagBadgeProps {
  tag: string;
  onRemove?: (tag: string) => void;
  size?: "xs" | "sm";
  className?: string;
}

export const ConversationTagBadge: React.FC<ConversationTagBadgeProps> = ({
  tag,
  onRemove,
  size = "xs",
  className = "",
}) => {
  const colorClass = getTagColor(tag);
  const sizeClass =
    size === "xs"
      ? "text-[10px] px-2 py-0.5"
      : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-white border border-[rgba(0,0,0,0.10)] shadow-2xs transition-colors shrink-0 ${colorClass} ${sizeClass} ${className}`}
    >
      <span className="truncate max-w-[120px]">{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="hover:opacity-75 focus:outline-none -mr-0.5 p-0.5 text-current rounded-full"
          aria-label={`Remove tag ${tag}`}
        >
          <FiX className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
};

export default ConversationTagBadge;
