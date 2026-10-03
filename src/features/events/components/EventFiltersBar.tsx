"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Calendar, History, Filter } from "lucide-react";
import { EventTimeline } from "@/types";

interface EventFiltersBarProps {
  timeline: EventTimeline;
  onTimelineChange: (timeline: EventTimeline) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  totalCount: number;
}

const CATEGORIES = ["All", "Webinar", "Workshop", "Meetup", "Masterclass", "Conference"];

export const EventFiltersBar: React.FC<EventFiltersBarProps> = ({
  timeline,
  onTimelineChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync internal state if prop changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, onSearchChange]);

  return (
    <div className="space-y-6">
      {/* 1. Main Timeline Toggle Tabs + Search Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-gray-200/80">
        {/* Timeline Tabs */}
        <div className="inline-flex items-center p-1 bg-[#F4F5F7] rounded-[8px] border border-[rgba(0,0,0,0.06)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => onTimelineChange("upcoming")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs sm:text-[13px] font-medium transition-all ${
              timeline === "upcoming"
                ? "bg-white text-[#112131] shadow-2xs font-semibold"
                : "text-[#64748b] hover:text-[#112131]"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#0D6D5F]" />
            Upcoming Events
          </button>

          <button
            type="button"
            onClick={() => onTimelineChange("past")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs sm:text-[13px] font-medium transition-all ${
              timeline === "past"
                ? "bg-white text-[#112131] shadow-2xs font-semibold"
                : "text-[#64748b] hover:text-[#112131]"
            }`}
          >
            <History className="w-4 h-4 text-[#0D6D5F]" />
            Past Events &amp; Recordings
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search events by keyword..."
            className="w-full bg-[#F4F5F7] focus:bg-white border border-transparent focus:border-gray-300 rounded-[6px] pl-10 pr-9 py-2 text-xs sm:text-[13px] text-[#112131] placeholder-gray-400 outline-none transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-[#0D6D5F] text-white border-[#0D6D5F]"
                    : "bg-white text-[#475569] border-gray-200/80 hover:bg-gray-50 hover:text-[#112131]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <span className="text-xs text-[#64748b] font-inter">
          Showing <span className="font-semibold text-[#112131]">{totalCount}</span> {totalCount === 1 ? "event" : "events"}
        </span>
      </div>
    </div>
  );
};
