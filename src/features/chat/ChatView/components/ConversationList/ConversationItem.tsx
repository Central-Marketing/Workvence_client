"use client";

import React from "react";
import moment from "moment";
import { getOtherUser, isConversationUnread, isTargetConversation } from "@/utils/chatHelpers";
import { getAvatarUrl } from "@/utils";
import { ConversationTagBadge } from "@/features/chat/ConversationTags";

interface ConversationItemProps {
  conv: any;
  user: any;
  activeConversationID: string;
  onSelect: (canonicalId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  user,
  activeConversationID,
  onSelect,
}) => {
  const isUnread = isConversationUnread(conv, user);
  const contact = getOtherUser(conv, user);
  const contactName =
    contact?.username ||
    contact?.name ||
    (user?.isSeller ? conv.buyer_username : conv.seller_username) ||
    "User";
  const avatarSrc = getAvatarUrl(
    contact?.image || contact?.img || contact?.avatar || "/media/noavatar.png"
  );
  const lastMsg = conv.lastMessage?.startsWith("[CUSTOM_OFFER]")
    ? "📋 Custom Offer"
    : conv.lastMessage?.startsWith("[MEETING_INVITE]")
    ? "📹 Video Meeting Invitation"
    : conv.lastMessage || "No messages yet";
  const canonicalId = conv.uuid || conv.conversationID || conv._id || conv.id;
  const isActive = isTargetConversation(conv, activeConversationID);
  const timeText = conv.updatedAt ? moment(conv.updatedAt).format("h:mm A") : "";
  const unreadCountBadge = conv.unreadCount || (isUnread ? 1 : 0);

  return (
    <div
      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-[6px] cursor-pointer transition-all duration-150 ${
        isActive ? "bg-white" : "hover:bg-slate-50"
      }`}
      onClick={() => onSelect(canonicalId)}
    >
      <img
        src={avatarSrc}
        alt={contactName}
        className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100 shadow-2xs"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-slate-900 text-sm truncate leading-tight">
              {contactName}
            </span>
            {unreadCountBadge > 0 && (
              <span className="w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 leading-none">
                {unreadCountBadge}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-normal shrink-0">
            {timeText}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate leading-snug">{lastMsg}</p>
        {/* Private Tags Badges on Conversation Card */}
        {Array.isArray(conv.tags) && conv.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1 overflow-hidden flex-wrap">
            {conv.tags.slice(0, 2).map((t: string) => (
              <ConversationTagBadge key={t} tag={t} size="xs" />
            ))}
            {conv.tags.length > 2 && (
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                +{conv.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
