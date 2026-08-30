"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiMessageSquare } from "react-icons/fi";
import { axiosFetch, socket } from "@/utils";
import { isConversationUnread, isTargetConversation } from "@/utils/chatHelpers";

interface HeaderInboxIconProps {
  currentUser: any;
}

const HeaderInboxIcon: React.FC<HeaderInboxIconProps> = ({ currentUser }) => {
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);
  const userId = currentUser?._id || currentUser?.id;

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || [])).catch(() => []),
    enabled: !!userId,
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Listen for real-time message events to update unread badge instantly
  useEffect(() => {
    if (!userId) return;

    const handleReceiveMessage = (newMsg: any) => {
      if (!newMsg) return;

      const senderId = String(newMsg.userID?._id || newMsg.userID?.id || (typeof newMsg.userID === 'string' ? newMsg.userID : '') || '');
      const currentUserIdStr = String(userId);

      // Do not count messages sent by current user as unread
      if (senderId && currentUserIdStr && senderId === currentUserIdStr) return;

      const incomingCid = String(newMsg?.conversationUUID || newMsg?.conversationID || newMsg?.uuid || newMsg?.id || '').trim();

      // Trigger subtle bounce animation on the inbox icon
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);

      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs) || oldConvs.length === 0) {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          return oldConvs;
        }

        const matchFound = oldConvs.some((c: any) => isTargetConversation(c, incomingCid));
        if (!matchFound) {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          return oldConvs;
        }

        return oldConvs.map((c: any) => {
          if (isTargetConversation(c, incomingCid)) {
            const isViewing = typeof window !== 'undefined' && (
              window.location.pathname.includes(`/message/${incomingCid}`) ||
              (c._id && window.location.pathname.includes(`/message/${c._id}`)) ||
              (c.id && window.location.pathname.includes(`/message/${c.id}`))
            );

            const isRecipientSeller = String(c.sellerID?._id || c.sellerID?.id || c.sellerID) === currentUserIdStr;

            return {
              ...c,
              lastMessage: newMsg.description || c.lastMessage,
              updatedAt: new Date().toISOString(),
              readBySeller: isRecipientSeller ? isViewing : true,
              readByBuyer: !isRecipientSeller ? isViewing : true,
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    const handleCustomNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    if (!socket.connected) socket.connect();
    socket.on('receive_message', handleReceiveMessage);
    window.addEventListener('new-message-received', handleCustomNewMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      window.removeEventListener('new-message-received', handleCustomNewMessage);
    };
  }, [userId, queryClient]);

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

  return (
    <Link href="/messages" prefetch={false} className="text-gray-500 hover:text-brand-green transition-colors relative" title="Messages">
      <FiMessageSquare className={`text-[22px] transition-transform ${isAnimating ? 'animate-bounce text-brand-green' : ''}`} />
      {unreadChatsCount > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-brand-green text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
          {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
        </span>
      )}
    </Link>
  );
};

export default HeaderInboxIcon;
