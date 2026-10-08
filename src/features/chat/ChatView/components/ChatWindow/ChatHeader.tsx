"use client";

import React from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { RiMenuLine } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tag01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components";
import { ConversationTagBadge, ConversationTagsManager } from "@/features/chat/ConversationTags";

interface ChatHeaderProps {
  finalRecipientUser: any;
  activeConversation: any;
  conversationID: string;
  isRecipientTyping: boolean;
  isRecipientOnline: boolean;
  recipientLastSeenText: string;
  user: any;
  isTagPopoverOpen: boolean;
  setIsTagPopoverOpen: (open: boolean) => void;
  isMsgSearchActive: boolean;
  setIsMsgSearchActive: (active: boolean) => void;
  msgSearchQuery: string;
  setMsgSearchQuery: (query: string) => void;
  onOpenOfferModal: () => void;
  onOpenMeetingModal: () => void;
  onOpenLeftSide: () => void;
  onOpenRightSide: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  finalRecipientUser,
  activeConversation,
  conversationID,
  isRecipientTyping,
  isRecipientOnline,
  recipientLastSeenText,
  user,
  isTagPopoverOpen,
  setIsTagPopoverOpen,
  isMsgSearchActive,
  setIsMsgSearchActive,
  msgSearchQuery,
  setMsgSearchQuery,
  onOpenOfferModal,
  onOpenMeetingModal,
  onOpenLeftSide,
  onOpenRightSide,
}) => {
  return (
    <div className="sticky top-0 z-30 shrink-0 min-h-[64px] px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-[rgba(0,0,0,0.10)] flex items-center bg-[#F8F8F8]">
      {/* Mobile Full-Width Search Takeover */}
      {isMsgSearchActive && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-[64px] bg-white px-3 flex items-center gap-2 border-b border-slate-200 shadow-xs animate-in fade-in duration-150">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            onClick={() => {
              setIsMsgSearchActive(false);
              setMsgSearchQuery("");
            }}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 shrink-0"
            aria-label="Close search"
            icon={<ArrowLeft className="w-5 h-5" />}
          />
          <div className="flex-1 flex items-center bg-slate-100 rounded-[6px] px-3 py-1.5 min-w-0">
            <input
              type="text"
              placeholder="Search in chat..."
              value={msgSearchQuery}
              onChange={(e) => setMsgSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 py-0.5"
              autoFocus
            />
            {msgSearchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                radius="full"
                onClick={() => setMsgSearchQuery("")}
                className="text-slate-400 hover:text-slate-700 shrink-0 ml-1 !p-0.5 !min-h-0 !h-auto text-xs"
                aria-label="Clear search"
              >
                ✕
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setIsMsgSearchActive(false);
              setMsgSearchQuery("");
            }}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 shrink-0 px-1 py-1"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Mobile Menu */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        radius="md"
        className="md:hidden mr-2 sm:mr-3 shrink-0 w-8 h-8 sm:w-9 sm:h-9 text-slate-600 hover:bg-slate-100"
        onClick={onOpenLeftSide}
        aria-label="Open conversations"
        icon={<RiMenuLine className="text-lg sm:text-xl" />}
      />

      {finalRecipientUser ? (
        <>
          {/* Recipient */}
          <div
            className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={onOpenRightSide}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={finalRecipientUser.image || "/media/noavatar.png"}
                alt=""
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
              />
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 leading-tight truncate">
                {finalRecipientUser.username}
              </h3>

              {/* Active Status Indicator + Horizontal Private Tags Row */}
              <div className="flex items-center gap-2 mt-0.5 min-w-0 flex-nowrap overflow-hidden">
                {/* Presence Status */}
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium shrink-0 flex items-center">
                  {isRecipientTyping ? (
                    <span className="text-brand-green font-semibold animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-green rounded-full shrink-0" />
                      typing...
                    </span>
                  ) : isRecipientOnline ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      Online
                    </span>
                  ) : recipientLastSeenText ? (
                    <span>Last seen {recipientLastSeenText}</span>
                  ) : (
                    "Offline"
                  )}
                </span>

                {/* Active Conversation Private Tags Display */}
                {Array.isArray(activeConversation?.tags) && activeConversation.tags.length > 0 && (
                  <>
                    <span className="text-slate-300 select-none text-[10px] shrink-0">•</span>

                    {/* MOBILE (<640px): Compact Tappable Tag Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTagPopoverOpen(true);
                      }}
                      className="sm:hidden inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-white border border-[rgba(0,0,0,0.10)] shadow-2xs px-2 py-0.5 rounded-full shrink-0 active:scale-95 transition-transform"
                      aria-label="Manage conversation tags"
                    >
                      <HugeiconsIcon className="w-3 h-3 text-[#292929]" icon={Tag01Icon} />
                      <span>{activeConversation.tags.length}</span>
                    </button>

                    {/* DESKTOP (>=640px): Inline Badges + Hover Tooltip */}
                    <div className="hidden sm:flex items-center gap-1 min-w-0 overflow-hidden shrink-0">
                      {activeConversation.tags.slice(0, 2).map((t: string) => (
                        <ConversationTagBadge key={t} tag={t} size="xs" />
                      ))}
                      {activeConversation.tags.length > 2 && (
                        <div
                          className="relative group/tag inline-flex items-center"
                          title={activeConversation.tags.slice(2).join(", ")}
                        >
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTagPopoverOpen(true);
                            }}
                            className="text-[10px] text-slate-600 font-medium shrink-0 cursor-pointer bg-white hover:bg-slate-50 px-2 py-0.5 rounded-full transition-colors leading-none border border-[rgba(0,0,0,0.10)] shadow-2xs"
                          >
                            +{activeConversation.tags.length - 2}
                          </span>

                          {/* Floating Tooltip showing remaining tags with existing tag colors */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover/tag:flex flex-col gap-1.5 bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] shadow-xl p-2.5 z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                              Remaining Tags
                            </span>
                            <div className="flex flex-col gap-1">
                              {activeConversation.tags.slice(2).map((t: string) => (
                                <ConversationTagBadge key={t} tag={t} size="xs" />
                              ))}
                            </div>
                            {/* Upward Arrow */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-t border-l border-[rgba(0,0,0,0.10)] rotate-45" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1 sm:ml-2">


            {/* Video Meeting */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="lg"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-slate-100 text-emerald-600 shrink-0"
              onClick={onOpenMeetingModal}
              title="Start Video Meeting"
              aria-label="Start Video Meeting"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className=""
                >
                  <path
                    d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 18.9749 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z"
                    stroke="#292929"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2998 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941"
                    stroke="#292929"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
                    stroke="#292929"
                    strokeWidth="1.5"
                  />
                </svg>
              }
            />

            {/* Private Conversation Tags Button & Popover */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="lg"
                className={`hidden sm:inline-flex w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] transition-colors shrink-0 ${isTagPopoverOpen ||
                    (activeConversation?.tags && activeConversation.tags.length > 0)
                    ? " text-[#292929]"
                    : "hover:bg-slate-100 text-slate-600"
                  }`}
                onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)}
                title="Private Tags"
                aria-label="Private Tags"
                icon={<HugeiconsIcon className="w-5 h-5 text-[#292929]" icon={Tag01Icon} />}
              />
              <ConversationTagsManager
                conversationId={String(
                  activeConversation?.uuid ||
                  activeConversation?.conversationID ||
                  activeConversation?._id ||
                  conversationID
                )}
                tags={activeConversation?.tags || []}
                mode="popover"
                isOpen={isTagPopoverOpen}
                onClose={() => setIsTagPopoverOpen(false)}
              />
            </div>

            {/* Search */}
            {isMsgSearchActive ? (
              <div className="hidden md:flex items-center h-8 sm:h-9 w-[160px] lg:w-[200px] bg-slate-100 rounded-[6px] px-2 shrink-0">
                <input
                  type="text"
                  placeholder="Search in chat..."
                  value={msgSearchQuery}
                  onChange={(e) => setMsgSearchQuery(e.target.value)}
                  className="border-none bg-transparent outline-none text-xs sm:text-sm py-1 min-w-0 flex-1 text-slate-800 placeholder:text-slate-400"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  radius="full"
                  className="w-5 h-5 min-h-0 !p-0 text-slate-500 hover:text-slate-800 text-lg leading-none"
                  onClick={() => {
                    setIsMsgSearchActive(false);
                    setMsgSearchQuery("");
                  }}
                  aria-label="Close search"
                  icon={<span>&times;</span>}
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="lg"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-slate-100 text-slate-600 shrink-0"
                onClick={() => setIsMsgSearchActive(true)}
                title="Search messages"
                aria-label="Search messages"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className=""
                  >
                    <path
                      d="M17 17L21 21"
                      stroke="#292929"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                      stroke="#292929"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            )}

            {/* Create Offer */}
            {user?.isSeller && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="lg"
                onClick={() => {
                  if (user?.isSuspended) {
                    toast.error(
                      "Account is suspended. You cannot send custom offers during restricted fulfillment mode."
                    );
                    return;
                  }
                  onOpenOfferModal();
                }}
                disabled={Boolean(user?.isSuspended)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-slate-100 text-[#292929] transition-colors shrink-0 ${
                  user?.isSuspended ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                title={user?.isSuspended ? "Offer Restricted" : "Create Offer"}
                aria-label="Create Offer"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#292929"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                }
              />
            )}

            {/* Mobile Right Sidebar */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="lg"
              className="xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] sm:rounded-[6px] hover:bg-slate-100 text-slate-600 shrink-0"
              onClick={onOpenRightSide}
              aria-label="Open contact info"
              icon={<BsThreeDotsVertical />}
            />
          </div>
        </>
      ) : (
        <h3 className="text-sm sm:text-base font-semibold text-slate-800">Conversation</h3>
      )}
    </div>
  );
};
