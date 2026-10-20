"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { axiosFetch, socket } from "@/utils";
import { isConversationUnread, isTargetConversation } from "@/utils/chatHelpers";
import { Chat01Icon } from "@hugeicons/core-free-icons";

interface HeaderInboxIconProps {
  currentUser: any;
  className?: string;
  iconClassName?: string;
  icon?: any;
}

const HeaderInboxIcon: React.FC<HeaderInboxIconProps> = ({ currentUser, className, iconClassName, icon }) => {
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);
  const userId = currentUser?._id || currentUser?.id;

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get('/conversations');
        const incomingList: any[] = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
        const currentCache: any[] = queryClient.getQueryData(['conversations']) || [];

        return incomingList.map((conv: any) => {
          const cached = Array.isArray(currentCache)
            ? currentCache.find((c: any) =>
                isTargetConversation(conv, c._id || c.uuid || c.conversationID || c.id)
              )
            : null;
          const backendIsUnread = isConversationUnread(conv, currentUser);
          const defaultUnreadCount = backendIsUnread ? 1 : 0;

          if (cached) {
            return {
              ...conv,
              unread: !backendIsUnread ? false : (typeof cached.unread === "boolean" ? cached.unread : true),
              unreadCount: !backendIsUnread ? 0 : (typeof cached.unreadCount === "number" && cached.unreadCount > 0 ? cached.unreadCount : defaultUnreadCount),
              readBySeller: typeof cached.readBySeller === "boolean" ? cached.readBySeller : conv.readBySeller,
              readByBuyer: typeof cached.readByBuyer === "boolean" ? cached.readByBuyer : conv.readByBuyer,
            };
          }
          return {
            ...conv,
            unread: backendIsUnread,
            unreadCount: !backendIsUnread ? 0 : (typeof conv.unreadCount === "number" ? conv.unreadCount : defaultUnreadCount),
          };
        });
      } catch {
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Listen for real-time message notification to trigger icon bounce animation
  useEffect(() => {
    const handleNewMessageAnimation = () => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    };

    window.addEventListener('new-message-received', handleNewMessageAnimation);

    return () => {
      window.removeEventListener('new-message-received', handleNewMessageAnimation);
    };
  }, []);

  // Join all conversation rooms so we receive real-time messages globally
  useEffect(() => {
    if (!socket.connected) socket.connect();
    if (conversations.length > 0) {
      conversations.forEach((c: any) => {
        const convId = c.id || c.conversationID || c._id;
        if (convId) socket.emit('join_conversation', convId);
      });
    }
  }, [conversations]);

  // Compute total unread conversations count
  const unreadChatsCount = useMemo(() => {
    return conversations.filter((c: any) => isConversationUnread(c, currentUser)).length;
  }, [conversations, currentUser]);

  // Compute direct chat target URL
  const targetHref = useMemo(() => {
    if (!conversations || conversations.length === 0) return "/message";
    const unreadConv = conversations.find((c: any) => isConversationUnread(c, currentUser));
    const target = unreadConv || conversations[0];
    const targetId = target?._id || target?.uuid || target?.conversationID || target?.id;
    return targetId ? `/message/${targetId}` : "/message";
  }, [conversations, currentUser]);

  return (
    <Link
      href={targetHref}
      prefetch={false}
      className={className || "text-gray-500 hover:text-brand-green transition-colors relative"}
      title="Messages"
    >
      <HugeiconsIcon
        icon={icon || Chat01Icon}
        size={19}
        className={iconClassName || `transition-transform ${isAnimating ? 'animate-bounce text-brand-green' : ''}`}
      />
      {unreadChatsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-brand-green text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
          {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
        </span>
      )}
    </Link>
  );
};

export default HeaderInboxIcon;
