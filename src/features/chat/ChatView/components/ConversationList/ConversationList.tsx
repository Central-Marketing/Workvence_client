"use client";

import React from "react";
import { Home } from "lucide-react";
import { Button, Loader } from "@/components";
import { ConversationFilters } from "./ConversationFilters";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  isLeftSideOpen: boolean;
  onCloseLeftSide: () => void;
  user: any;
  onNavigateDashboard: () => void;
  convSearchQuery: string;
  setConvSearchQuery: (query: string) => void;
  convFilterTab: "all" | "read" | "unread";
  setConvFilterTab: (tab: "all" | "read" | "unread") => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  allAvailableTags: string[];
  isTagFilterMenuOpen: boolean;
  setIsTagFilterMenuOpen: (open: boolean) => void;
  convsLoading: boolean;
  displayedConversations: any[];
  conversationID: string;
  onSelectConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  isLeftSideOpen,
  onCloseLeftSide,
  user,
  onNavigateDashboard,
  convSearchQuery,
  setConvSearchQuery,
  convFilterTab,
  setConvFilterTab,
  selectedTagFilter,
  setSelectedTagFilter,
  allAvailableTags,
  isTagFilterMenuOpen,
  setIsTagFilterMenuOpen,
  convsLoading,
  displayedConversations,
  conversationID,
  onSelectConversation,
}) => {
  return (
    <>
      <div
        className={`md:hidden fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 ease-in-out ${
          isLeftSideOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseLeftSide}
      />

      <aside
        className={`w-[300px] min-w-[280px] md:w-[320px] lg:w-[340px] xl:w-[350px] border-r border-[rgba(0,0,0,0.10)] flex flex-col bg-[var(--Foundation-White-white-200,#F8F8F8)] overflow-hidden box-border transform transition-transform duration-300 ease-in-out max-md:absolute max-md:z-40 max-md:w-[320px] max-md:h-full max-md:shadow-xl max-md:flex ${
          isLeftSideOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        }`}
      >
        {/* Header: Back Button + Messages Heading */}
        <div className="p-4 sm:p-5 pb-3 flex flex-col gap-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3 justify-between">
            <h2 className="text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] macbook:text-[32px] 2xl:text-[36px] font-normal leading-tight tracking-tight text-[#292929] font-sf-pro">
              Messages
            </h2>
            <Button
              type="button"
              variant="outline"
              size="icon"
              radius="full"
              onClick={onNavigateDashboard}
              className="w-9 h-9 min-h-[36px] !p-0 border !border-[rgba(0,0,0,0.10)] text-[#126D6B] bg-white hover:bg-slate-50 shrink-0"
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
              icon={<Home className="w-4 h-4 text-brand-green" />}
            />
          </div>

          <ConversationFilters
            convSearchQuery={convSearchQuery}
            setConvSearchQuery={setConvSearchQuery}
            convFilterTab={convFilterTab}
            setConvFilterTab={setConvFilterTab}
            selectedTagFilter={selectedTagFilter}
            setSelectedTagFilter={setSelectedTagFilter}
            allAvailableTags={allAvailableTags}
            isTagFilterMenuOpen={isTagFilterMenuOpen}
            setIsTagFilterMenuOpen={setIsTagFilterMenuOpen}
          />
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
          {convsLoading ? (
            <div className="list-loader py-10 flex justify-center">
              <Loader size={28} />
            </div>
          ) : displayedConversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {convSearchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            displayedConversations.map((conv: any) => (
              <ConversationItem
                key={conv._id || conv.uuid || conv.conversationID || conv.id}
                conv={conv}
                user={user}
                activeConversationID={conversationID}
                onSelect={(id) => {
                  onSelectConversation(id);
                  onCloseLeftSide();
                }}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
};
