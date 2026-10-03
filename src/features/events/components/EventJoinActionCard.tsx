"use client";

import React from "react";
import {
  Video,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Play,
  Globe,
  Share2,
} from "lucide-react";
import { EventItem } from "@/types";
import { toast } from "sonner";

interface EventJoinActionCardProps {
  event: EventItem;
}

export const EventJoinActionCard: React.FC<EventJoinActionCardProps> = ({ event }) => {
  const isPast = (() => {
    try {
      const endOrStart = event.endDate || event.startDate;
      return new Date(endOrStart).getTime() < Date.now();
    } catch {
      return false;
    }
  })();

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

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    try {
      const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
      const end = event.endDate
        ? new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
        : start;
      const title = encodeURIComponent(event.title);
      const details = encodeURIComponent(`${event.summary}\n\nJoin: ${event.eventUrl || window.location.href}`);
      const location = encodeURIComponent(event.location || event.eventUrl || "Virtual Event");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    } catch {
      return "#";
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: event.title,
            text: event.summary,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Event link copied to clipboard!");
        }
      } catch {
        // user cancelled share
      }
    }
  };

  return (
    <aside className="bg-white rounded-[10px] border border-gray-200/80 p-6 space-y-6 shadow-xs sticky top-[100px]">
      {/* 1. Header Information */}
      <div className="space-y-3 pb-5 border-b border-gray-100">
        <span className="inline-block px-2.5 py-1 rounded-[4px] bg-emerald-50 text-[#0D6D5F] text-[11px] font-semibold uppercase tracking-wider">
          {event.category || "Event"}
        </span>

        <h3 className="font-sf-pro font-semibold text-xl text-[#112131] leading-snug">
          {isPast ? "Event Completed" : "Registration Open"}
        </h3>

        <div className="space-y-2 text-xs text-[#475569] font-inter">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#112131]">{formattedDate}</p>
              {formattedTime && (
                <p className="text-gray-500">
                  {formattedTime} {event.timezone ? `(${event.timezone})` : ""}
                </p>
              )}
            </div>
          </div>

          {event.eventType === "virtual" ? (
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#0D6D5F] shrink-0" />
              <span>Virtual Online Event</span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
              <span>{event.location || "Location announced soon"}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Action Buttons */}
      <div className="space-y-3">
        {/* If Past Event and Recording URL is available */}
        {isPast && event.recordingUrl ? (
          <a
            href={event.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-red-600 hover:bg-red-700 text-white text-xs sm:text-[13px] font-semibold transition-colors shadow-2xs"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch Replay Recording</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        {/* If Virtual Event with Meeting URL */}
        {event.eventType === "virtual" && event.eventUrl ? (
          <a
            href={event.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs sm:text-[13px] font-semibold transition-colors shadow-2xs"
          >
            <Video className="w-4 h-4" />
            <span>Join Meeting</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        {/* If In-Person with Location */}
        {event.eventType !== "virtual" && event.location ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-black hover:bg-gray-900 text-white text-xs sm:text-[13px] font-medium transition-colors shadow-2xs"
          >
            <MapPin className="w-4 h-4" />
            <span>Get Directions on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        {/* Fallback if no specific links exist yet */}
        {!event.eventUrl && !event.recordingUrl && !event.location && (
          <div className="p-3 bg-gray-50 rounded-[6px] text-center text-xs text-gray-500 font-inter">
            Access details and links will be shared with registered attendees.
          </div>
        )}



        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] border border-gray-200 hover:bg-gray-50 text-[#112131] text-xs font-medium transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-gray-400" />
          <span>Share This Event</span>
        </button>
      </div>

      {/* 3. Safety & Platform Guarantee */}
      <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-[11px] text-[#64748b]">
        <Globe className="w-4 h-4 text-[#0D6D5F] shrink-0" />
        <span>Official Workvence Marketplace Community Session</span>
      </div>
    </aside>
  );
};
