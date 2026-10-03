"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Video, Play, ArrowRight, Sparkles } from "lucide-react";
import { EventItem } from "@/types";

interface EventCardProps {
  event: EventItem;
  isPast?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isPast }) => {
  const [imgError, setImgError] = useState(false);

  // Format start date and time
  const formattedDate = (() => {
    try {
      const d = new Date(event.startDate);
      if (isNaN(d.getTime())) return event.startDate;
      return d.toLocaleDateString("en-US", {
        month: "short",
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

  const hasBanner = event.banner && !imgError && !event.banner.startsWith("blob:");

  return (
    <article className="group flex flex-col bg-white rounded-[8px] border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200">
      {/* 1. Thumbnail Banner */}
      <Link
        href={`/events/${encodeURIComponent(event.slug || event.id)}`}
        className="block relative w-full aspect-[16/9] overflow-hidden bg-slate-900 select-none"
      >
        {hasBanner ? (
          <img
            src={event.banner}
            alt={event.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0D6D5F] via-[#09473E] to-[#112131] flex flex-col items-center justify-center p-6 text-white text-center">
            <Sparkles className="w-8 h-8 text-[#6AD724] mb-2 opacity-80" />
            <span className="font-sf-pro font-semibold text-sm tracking-wide text-white/90 line-clamp-1">
              {event.category || "Workvence Event"}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {event.category && (
            <span className="px-2.5 py-1 rounded-[4px] bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide uppercase">
              {event.category}
            </span>
          )}

          {event.eventType === "virtual" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#0D6D5F]/90 backdrop-blur-xs text-white text-[11px] font-medium">
              <Video className="w-3 h-3" />
              Virtual
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-slate-800/90 backdrop-blur-xs text-white text-[11px] font-medium">
              <MapPin className="w-3 h-3" />
              In-Person
            </span>
          )}
        </div>

        {/* Recording Available Badge on Past Events */}
        {isPast && event.recordingUrl && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-red-600 text-white text-[11px] font-medium shadow-xs">
            <Play className="w-3 h-3 fill-current" />
            Replay Available
          </div>
        )}
      </Link>

      {/* 2. Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Date, Time & Timezone */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-[#64748b] font-inter">
            <div className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0D6D5F]" />
              <span>{formattedDate}</span>
            </div>
            {formattedTime && (
              <div className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {formattedTime}
                  {event.timezone ? ` (${event.timezone.split("/").pop()})` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-sf-pro font-semibold text-[16px] sm:text-[17px] text-[#112131] leading-snug group-hover:text-[#0D6D5F] transition-colors line-clamp-2">
            <Link href={`/events/${encodeURIComponent(event.slug || event.id)}`}>
              {event.title}
            </Link>
          </h3>

          {/* Summary */}
          {event.summary && (
            <p className="text-[13px] text-[#475569] leading-relaxed font-inter line-clamp-2">
              {event.summary}
            </p>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {event.tags.slice(0, 3).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded-[4px] bg-[#F4F5F7] text-[11px] font-normal text-[#64748b]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Card Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#0D6D5F]">
            {isPast ? "View Recap" : "Free Registration"}
          </span>

          <Link
            href={`/events/${encodeURIComponent(event.slug || event.id)}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#112131] hover:text-[#0D6D5F] transition-colors py-1 px-2.5 rounded-[6px] hover:bg-gray-50"
          >
            <span>{isPast && event.recordingUrl ? "Watch" : "Details"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
