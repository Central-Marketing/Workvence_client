"use client";

import React, { useRef, useEffect } from "react";
import { RiSearchLine, RiArrowDownSLine } from "react-icons/ri";
import { FiTag, FiX, FiCheck } from "react-icons/fi";
import { Button } from "@/components";

interface ConversationFiltersProps {
  convSearchQuery: string;
  setConvSearchQuery: (query: string) => void;
  convFilterTab: "all" | "read" | "unread";
  setConvFilterTab: (tab: "all" | "read" | "unread") => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  allAvailableTags: string[];
  isTagFilterMenuOpen: boolean;
  setIsTagFilterMenuOpen: (open: boolean) => void;
}

export const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  convSearchQuery,
  setConvSearchQuery,
  convFilterTab,
  setConvFilterTab,
  selectedTagFilter,
  setSelectedTagFilter,
  allAvailableTags,
  isTagFilterMenuOpen,
  setIsTagFilterMenuOpen,
}) => {
  const tagFilterDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close tag filter menu
  useEffect(() => {
    if (!isTagFilterMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tagFilterDropdownRef.current &&
        !tagFilterDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTagFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTagFilterMenuOpen, setIsTagFilterMenuOpen]);

  return (
    <>
      {/* Search Bar */}
      <div className="relative w-full">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Find seller..."
          value={convSearchQuery}
          onChange={(e) => setConvSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-[6px] focus:outline-none focus:border-slate-400 placeholder:text-slate-400 text-slate-800 transition-colors"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
        <Button
          type="button"
          variant={convFilterTab === "all" && !selectedTagFilter ? "pill-tab" : "ghost"}
          size="xs"
          radius="full"
          onClick={() => {
            setConvFilterTab("all");
            setSelectedTagFilter(null);
          }}
          className={`px-3 py-1 text-xs font-medium border transition-colors ${
            convFilterTab === "all" && !selectedTagFilter
              ? "!border-teal-700 !text-teal-800 !bg-white shadow-2xs font-semibold"
              : "!border-slate-200 text-slate-700 !bg-white hover:!bg-slate-50"
          }`}
        >
          All
        </Button>

        <Button
          type="button"
          variant={convFilterTab === "unread" ? "pill-tab" : "ghost"}
          size="xs"
          radius="full"
          onClick={() => setConvFilterTab("unread")}
          className={`px-3 py-1 text-xs font-medium border transition-colors ${
            convFilterTab === "unread"
              ? "!border-teal-700 !text-teal-800 !bg-white shadow-2xs font-semibold"
              : "!border-slate-200 text-slate-700 !bg-white hover:!bg-slate-50"
          }`}
        >
          Unread
        </Button>

        {/* Tag Filter Dropdown */}
        {allAvailableTags.length > 0 && (
          <div ref={tagFilterDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsTagFilterMenuOpen(!isTagFilterMenuOpen)}
              className={`px-2.5 py-1 text-xs font-medium border rounded-full transition-colors flex items-center gap-1 ${
                selectedTagFilter
                  ? "!border-[rgba(0,0,0,0.10)] !text-teal-800 !bg-white font-semibold shadow-2xs"
                  : "!border-slate-200 text-slate-600 "
              }`}
            >
              <FiTag className="w-3 h-3 text-teal-700" />
              <span className="truncate max-w-[80px]">{selectedTagFilter || "Tags"}</span>
              <RiArrowDownSLine className="w-3 h-3 text-slate-400" />
            </button>

            {isTagFilterMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-[8px] shadow-lg py-1.5 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Filter by private tag
                </div>
                {selectedTagFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTagFilter(null);
                      setIsTagFilterMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-between"
                  >
                    <span>Clear tag filter</span>
                    <FiX className="w-3 h-3" />
                  </button>
                )}
                {allAvailableTags.map((tagName: string) => (
                  <button
                    key={tagName}
                    type="button"
                    onClick={() => {
                      setSelectedTagFilter(tagName);
                      setIsTagFilterMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      selectedTagFilter?.toLowerCase() === tagName.toLowerCase()
                        ? "font-semibold text-teal-800 bg-teal-50/50"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="truncate">{tagName}</span>
                    {selectedTagFilter?.toLowerCase() === tagName.toLowerCase() && (
                      <FiCheck className="w-3 h-3 text-teal-700 shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
