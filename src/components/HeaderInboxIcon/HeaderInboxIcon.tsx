"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiMessageSquare } from "react-icons/fi";
import { axiosFetch, socket } from "@/utils";
import { isConversationUnread } from "@/utils/chatHelpers";

interface HeaderInboxIconProps {
  currentUser: any;
}

const HeaderInboxIcon: React.FC<HeaderInboxIconProps> = ({ currentUser }) => {
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || [])).catch(() => []),
    enabled: !!currentUser?._id,
    staleTime: 60000,
    refetchInterval: false,
  });

  // Listen for real-time message events to update badge instantly
  useEffect(() => {
    if (!currentUser?._id) return;

    // Listen for socket receive_message to update conversations cache
    const handleReceiveMessage = (newMsg: any) => {
      const senderId = newMsg.userID?._id || newMsg.userID;
      if (senderId === currentUser._id) return;

      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (c.id === newMsg.conversationID || c.conversationID === newMsg.conversationID || c._id === newMsg.conversationID) {
            const isViewing = typeof window !== 'undefined' && window.location.pathname.includes(`/message/${newMsg.conversationID}`);
            const isSellerInConv = String(c.sellerID?._id || c.sellerID || '') === String(currentUser._id || currentUser.id || '');
            return {
              ...c,
              lastMessage: newMsg.description,
              updatedAt: new Date().toISOString(),
              readBySeller: isSellerInConv ? isViewing : c.readBySeller,
              readByBuyer: !isSellerInConv ? isViewing : c.readByBuyer
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
      
      // Trigger subtle animation on the icon
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000); // 2 seconds of bounce
    };

    if (!socket.connected) socket.connect();
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [currentUser, queryClient]);

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
    <Link href="/messages" className="text-gray-500 hover:text-brand-green transition-colors relative" title="Messages">
      <FiMessageSquare className={`text-[22px] transition-transform ${isAnimating ? 'animate-bounce text-brand-green' : ''}`} />
      {unreadChatsCount > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-brand-green text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">
          {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
        </span>
      )}
    </Link>
  );
};

export default HeaderInboxIcon;
