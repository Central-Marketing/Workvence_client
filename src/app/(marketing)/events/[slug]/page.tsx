"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components";
import {
  EventJoinActionCard,
  EventVideoPlayer,
  EventGallery,
  EventDetailSkeleton,
} from "@/features/events/components";
import { eventService } from "@/features/events/services/eventService";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ArrowLeft,
  Sparkles,
  Tag,
  AlertCircle,
} from "lucide-react";

export default function SingleEventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [bannerError, setBannerError] = useState(false);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event-detail", slug],
    queryFn: () => eventService.getEventBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError || !event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="font-sf-pro font-semibold text-2xl text-[#112131] mb-2">
          Event Not Found
        </h1>
        <p className="font-inter text-sm text-[#64748b] max-w-md mb-6">
          The event you are looking for does not exist, has been removed, or is still in draft mode.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs sm:text-[13px] font-medium transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      const d = new Date(event.startDate);
      if (isNaN(d.getTime())) return event.startDate;
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return event.startDate;
    }
  })();

  const formattedTime = (() => {
    try {
      const d = new Date(event.startDate);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  })();

  const hasBanner = event.banner && !bannerError && !event.banner.startsWith("blob:");

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased pb-24">
      {/* 1. Top Breadcrumb & Navigation */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Events", href: "/events" },
            { label: event.title, isLast: true },
          ]}
        />
      </div>

      {/* 2. Cover Banner */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8">
        <div className="w-full aspect-[16/7] sm:aspect-[21/9] md:aspect-[24/9] rounded-[10px] overflow-hidden bg-slate-900 border border-black/[0.06] shadow-xs relative">
          {hasBanner ? (
            <img
              src={event.banner}
              alt={event.title}
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0D6D5F] via-[#0b4d43] to-[#112131] flex flex-col items-center justify-center p-8 text-white text-center">
              <Sparkles className="w-12 h-12 text-[#6AD724] mb-3 opacity-90" />
              <span className="font-sf-pro font-semibold text-lg sm:text-xl text-white/90">
                {event.category || "Workvence Marketplace Event"}
              </span>
            </div>
          )}

          {/* Floating Pill on Banner */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            {event.category && (
              <span className="px-3 py-1 rounded-[4px] bg-black/60 backdrop-blur-xs text-white text-xs font-medium uppercase tracking-wider">
                {event.category}
              </span>
            )}
            {event.eventType === "virtual" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#0D6D5F]/95 backdrop-blur-xs text-white text-xs font-medium">
                <Video className="w-3.5 h-3.5" />
                Virtual Event
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-slate-800/95 backdrop-blur-xs text-white text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                In-Person
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Detail Grid */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Details, Description, Videos, Gallery */}
          <main className="lg:col-span-8 space-y-8">
            {/* Header Titles */}
            <div className="space-y-3 pb-6 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-[13px] text-[#64748b] font-inter">
                <div className="inline-flex items-center gap-1.5 font-medium text-[#112131]">
                  <Calendar className="w-4 h-4 text-[#0D6D5F]" />
                  <span>{formattedDate}</span>
                </div>
                {formattedTime && (
                  <div className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {formattedTime} {event.timezone ? `(${event.timezone})` : ""}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="font-sf-pro font-semibold text-2xl sm:text-3xl md:text-4xl text-[#112131] leading-tight tracking-tight">
                {event.title}
              </h1>

              {event.summary && (
                <p className="font-inter text-sm sm:text-base text-[#475569] leading-relaxed">
                  {event.summary}
                </p>
              )}
            </div>

            {/* Promo Video (if present) */}
            {event.videoUrl && (
              <EventVideoPlayer
                url={event.videoUrl}
                title={`${event.title} Preview`}
                isReplay={false}
              />
            )}

            {/* Description Section */}
            <div className="space-y-3">
              <h2 className="font-sf-pro font-semibold text-xl text-[#112131]">
                About This Event
              </h2>

              <div
                className="font-inter text-[14px] sm:text-[14.5px] text-[#334155] leading-relaxed space-y-4
                  [&_p]:mb-3.5 [&_p]:leading-relaxed
                  [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-[#112131] [&_h3]:mt-6 [&_h3]:mb-2.5 [&_h3]:font-sf-pro
                  [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-[#112131] [&_h4]:mt-4 [&_h4]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:marker:text-slate-400
                  [&_li]:pl-1
                  [&_strong]:font-semibold [&_strong]:text-[#112131]
                  [&_a]:text-[#0D6D5F] [&_a]:underline hover:[&_a]:text-[#0b5c50]"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>

            {/* Session Recording / Replay (if present) */}
            {event.recordingUrl && (
              <div className="pt-6 border-t border-gray-100">
                <EventVideoPlayer
                  url={event.recordingUrl}
                  title={`${event.title} Recording Replay`}
                  isReplay={true}
                />
              </div>
            )}

            {/* Photo Gallery (if present) */}
            {event.images && event.images.length > 0 && (
              <EventGallery images={event.images} title={event.title} />
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Related Topics &amp; Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3 py-1 rounded-[6px] bg-[#F4F5F7] border border-gray-200/60 text-xs text-[#475569] font-inter"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Right Column: Sticky Action Card */}
          <div className="lg:col-span-4">
            <EventJoinActionCard event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
