"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components";
import {
  EventHeroSpotlight,
  EventFiltersBar,
  EventCard,
  EventGridSkeleton,
} from "@/features/events/components";
import { eventService } from "@/features/events/services/eventService";
import { EventTimeline } from "@/types";
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Inbox } from "lucide-react";

export default function EventsPage() {
  const [timeline, setTimeline] = useState<EventTimeline>("upcoming");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 9;

  // 1. Fetch Featured Event for Hero Spotlight
  const { data: featuredData } = useQuery({
    queryKey: ["featured-event"],
    queryFn: () => eventService.getEvents({ featured: true, limit: 1 }),
    staleTime: 1000 * 60 * 5,
  });

  const featuredEvent = featuredData?.events?.[0] || null;

  // 2. Fetch Events for Listing Grid
  const {
    data: eventsData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["events", { timeline, selectedCategory, searchQuery, page, limit }],
    queryFn: () =>
      eventService.getEvents({
        timeline,
        category: selectedCategory,
        search: searchQuery,
        page,
        limit,
      }),
    staleTime: 1000 * 60 * 2,
  });

  const events = eventsData?.events || [];
  const total = eventsData?.total || 0;
  const totalPages = eventsData?.totalPages || 0;

  // Handler for timeline change (resets page)
  const handleTimelineChange = (newTimeline: EventTimeline) => {
    setTimeline(newTimeline);
    setPage(1);
  };

  // Handler for category change (resets page)
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setPage(1);
  };

  // Handler for search change (resets page)
  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased">
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 pb-24">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Community", href: "/community" },
              { label: "Events", isLast: true },
            ]}
          />
        </div>

        {/* Hero Spotlight Section */}
        <EventHeroSpotlight featuredEvent={featuredEvent} />

        {/* Events Directory & Filter Section */}
        <section className="mt-12 sm:mt-16 md:mt-20 space-y-8">
          {/* Filter Bar with Tabs, Categories and Search */}
          <EventFiltersBar
            timeline={timeline}
            onTimelineChange={handleTimelineChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            totalCount={total}
          />

          {/* Events Grid or States */}
          {isLoading ? (
            <EventGridSkeleton count={6} />
          ) : isError ? (
            <div className="rounded-[8px] border border-red-200 bg-red-50/50 p-8 text-center text-red-600 space-y-2">
              <p className="font-semibold text-sm">Failed to load events.</p>
              <p className="text-xs text-red-500">
                Please check your network connection or try refreshing the page.
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-gray-300 bg-[#FBFBFB] p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="font-sf-pro font-semibold text-lg text-[#112131]">
                {timeline === "upcoming"
                  ? "No upcoming events scheduled right now"
                  : "No past event recordings found"}
              </h3>
              <p className="font-inter text-xs sm:text-sm text-[#64748b] max-w-md">
                {timeline === "upcoming"
                  ? "We are preparing exciting webinars, workshops, and meetups. In the meantime, explore past sessions and recordings."
                  : "We couldn't find any recorded events matching your current filters. Try changing categories or search terms."}
              </p>
              {timeline === "upcoming" && (
                <button
                  type="button"
                  onClick={() => handleTimelineChange("past")}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs font-medium transition-colors shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Browse Past Recordings</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={timeline === "past"}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-gray-200 text-xs font-medium text-[#112131] hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs text-[#64748b] font-inter">
                    Page <span className="font-semibold text-[#112131]">{page}</span> of{" "}
                    <span className="font-semibold text-[#112131]">{totalPages}</span>
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-gray-200 text-xs font-medium text-[#112131] hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
