"use client";

import React from "react";
import { Skeleton } from "@/components";
import { MessageItem } from "./MessageItem";
import { FirstMessageMilestone } from "./FirstMessageMilestone";

interface MessageListProps {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  msgsError: any;
  msgsLoading: boolean;
  filteredMessages: any[];
  msgSearchQuery: string;
  user: any;
  finalRecipientUser?: any;
  partnerUsername?: string;
  contactOrders: any[];
  sellerPackages: any[];
  chatBriefs: any[];
  isAwaitingFirstReply: boolean;
  isRecipientTyping: boolean;
  onImagePreview: (url: string) => void;
  onReadFullProposal: (
    offer: any,
    msgId: string,
    acceptedOrder: any,
    isOwner: boolean,
    isWithdrawn: boolean
  ) => void;
  onViewOrder: (targetOrderId?: string | null) => void;
  onAcceptOffer: (offer: any) => void;
  onWithdraw: (msgId: string) => void;
  onCopyText: (text: string, msg?: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messagesContainerRef,
  messagesEndRef,
  onScroll,
  msgsError,
  msgsLoading,
  filteredMessages,
  msgSearchQuery,
  user,
  finalRecipientUser,
  partnerUsername,
  contactOrders,
  sellerPackages,
  chatBriefs,
  isAwaitingFirstReply,
  isRecipientTyping,
  onImagePreview,
  onReadFullProposal,
  onViewOrder,
  onAcceptOffer,
  onWithdraw,
  onCopyText,
}) => {
  return (
    <div
      ref={messagesContainerRef}
      onScroll={onScroll}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 flex flex-col gap-4 bg-[#F0F0F0] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
    >
      {msgsError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 m-6 rounded-[6px] border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-3xl mb-4 font-bold">
            🚫
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Access Denied (403)
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm leading-relaxed">
            You are not a participant in this conversation. You do not have permission to view or
            send messages in this chat.
          </p>
        </div>
      ) : msgsLoading ? (
        <div className="p-6 space-y-6 flex-1 overflow-hidden">
          <div className="flex gap-3 max-w-md">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-12 rounded-[10px_10px_10px_0]" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
          <div className="flex gap-3 max-w-md ml-auto flex-row-reverse">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex flex-col items-end">
              <Skeleton className="w-64 h-16 rounded-[10px_10px_0_10px]" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
          <div className="flex gap-3 max-w-md">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="w-36 h-10 rounded-[10px_10px_10px_0]" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="py-12 m-auto text-center text-sm text-slate-400 font-medium">
          {msgSearchQuery ? "No messages found" : "Send the first message!"}
        </div>
      ) : (
        filteredMessages.map((msg: any, index: number) => (
          <MessageItem
            key={msg._id || msg.id}
            msg={msg}
            index={index}
            user={user}
            prevMsg={index > 0 ? filteredMessages[index - 1] : undefined}
            finalRecipientUser={finalRecipientUser}
            partnerUsername={partnerUsername}
            contactOrders={contactOrders}
            sellerPackages={sellerPackages}
            chatBriefs={chatBriefs}
            onImagePreview={onImagePreview}
            onReadFullProposal={onReadFullProposal}
            onViewOrder={onViewOrder}
            onAcceptOffer={onAcceptOffer}
            onWithdraw={onWithdraw}
            onCopyText={onCopyText}
          />
        ))
      )}

      {/* First Message Sent Milestone Card */}
      <FirstMessageMilestone
        isAwaitingFirstReply={isAwaitingFirstReply}
        finalRecipientUser={finalRecipientUser}
      />

      {isRecipientTyping && (
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-14 italic mb-4">
          <span className="flex gap-[3px]">
            <span
              className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </span>
          💬 {partnerUsername || finalRecipientUser?.username || "User"} is typing...
        </div>
      )}
      <div ref={messagesEndRef} className="h-3 shrink-0" aria-hidden="true" />
    </div>
  );
};
