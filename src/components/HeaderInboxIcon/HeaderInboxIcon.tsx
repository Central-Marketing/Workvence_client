"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FiMessageSquare } from "react-icons/fi";
import { axiosFetch } from "@/utils";
import { isConversationUnread } from "@/utils/chatHelpers";

interface HeaderInboxIconProps {
  currentUser: any;
}

const HeaderInboxIcon: React.FC<HeaderInboxIconProps> = ({ currentUser }) => {
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || [])).catch(() => []),
    enabled: !!currentUser?._id,
    refetchInterval: 15000
  });

  // Compute total unread conversations count
  const unreadChatsCount = useMemo(() => {
    return conversations.filter((c: any) => isConversationUnread(c, currentUser)).length;
  }, [conversations, currentUser]);

  return (
    <Link href="/messages" className="text-gray-500 hover:text-brand-green transition-colors relative" title="Messages">
      <FiMessageSquare className="text-[22px]" />
      {unreadChatsCount > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-brand-green text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">
          {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
        </span>
      )}
    </Link>
  );
};

export default HeaderInboxIcon;
