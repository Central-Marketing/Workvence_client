"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Sparkles, ArrowRight, Video, MapPin } from "lucide-react";
import { EventItem } from "@/types";

interface EventHeroSpotlightProps {
  featuredEvent?: EventItem | null;
}

export const EventHeroSpotlight: React.FC<EventHeroSpotlightProps> = ({ featuredEvent }) => {
  const [imgError, setImgError] = useState(false);

  if (!featuredEvent) {
    return (
      <header className="flex flex-col items-start pt-6 sm:pt-8 md:pt-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#F4F5F7] border border-[rgba(0,0,0,0.08)] text-[11px] sm:text-[12px] font-medium text-[#0D6D5F]">
          <Sparkles className="w-3.5 h-3.5" />
          Community &amp; Knowledge Hub
        </div>

        <h1 className="mt-3.5 font-sf-pro font-semibold text-[#112131] text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
          Workvence Events &amp; Workshops
        </h1>

        <p className="mt-2.5 font-inter text-[#64748b] text-sm sm:text-base leading-relaxed max-w-3xl">
          Connect with industry experts, master high-income freelance skills, and network with global founders through live interactive webinars, workshops, and exclusive recordings.
        </p>
      </header>
    );
  }

  const formattedDate = (() => {
    try {
      const d = new Date(featuredEvent.startDate);
      if (isNaN(d.getTime())) return featuredEvent.startDate;
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return featuredEvent.startDate;
    }
  })();

  const hasBanner = featuredEvent.banner && !imgError && !featuredEvent.banner.startsWith("blob:");

  return (
    <div className="pt-6 sm:pt-8">
      {/* Overline Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-emerald-50 border border-emerald-200/80 text-[11px] sm:text-[12px] font-medium text-[#0D6D5F] mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        Spotlight Event
      </div>

      {/* Featured Card Container */}
      <div className="relative rounded-[12px] border border-gray-200/80 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-[4px] bg-[#0D6D5F] text-white text-[11px] font-medium uppercase tracking-wider">
                  {featuredEvent.category || "Featured"}
                </span>

                {featuredEvent.eventType === "virtual" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-gray-100 text-[#475569] text-[11px] font-medium">
                    <Video className="w-3 h-3 text-[#0D6D5F]" />
                    Virtual Event
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-gray-100 text-[#475569] text-[11px] font-medium">
                    <MapPin className="w-3 h-3 text-[#0D6D5F]" />
                    In-Person
                  </span>
                )}
              </div>

              <h2 className="font-sf-pro font-semibold text-2xl sm:text-3xl lg:text-[34px] text-[#112131] leading-tight tracking-tight">
                <Link
                  href={`/events/${encodeURIComponent(featuredEvent.slug || featuredEvent.id)}`}
                  className="hover:text-[#0D6D5F] transition-colors"
                >
                  {featuredEvent.title}
                </Link>
              </h2>

              <p className="font-inter text-[#475569] text-sm sm:text-base leading-relaxed line-clamp-3">
                {featuredEvent.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-[13px] text-[#64748b] font-inter pt-2">
                <div className="inline-flex items-center gap-1.5 font-medium text-[#112131]">
                  <Calendar className="w-4 h-4 text-[#0D6D5F]" />
                  <span>{formattedDate}</span>
                </div>
                {featuredEvent.timezone && (
                  <div className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Timezone: {featuredEvent.timezone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
              <Link
                href={`/events/${encodeURIComponent(featuredEvent.slug || featuredEvent.id)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs sm:text-[13px] font-medium transition-colors shadow-2xs"
              >
                <span>View Event Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Banner */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-slate-900 overflow-hidden">
            {hasBanner ? (
              <img
                src={featuredEvent.banner}
                alt={featuredEvent.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0D6D5F] via-[#09473E] to-[#112131] flex flex-col items-center justify-center p-8 text-white text-center">
                <Sparkles className="w-12 h-12 text-[#6AD724] mb-3 opacity-90 animate-pulse" />
                <h3 className="font-sf-pro font-semibold text-lg text-white/90">
                  {featuredEvent.title}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
