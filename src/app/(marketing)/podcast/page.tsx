"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Play,
  Pause,
  Volume2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
  Headphones,
  Radio,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

interface Episode {
  id: string;
  number: number;
  title: string;
  guest: string;
  guestRole: string;
  duration: string;
  date: string;
  summary: string;
  timestamps: string[];
}

const episodes: Episode[] = [
  {
    id: "ep-1",
    number: 34,
    title: "How to Build a $500k Boutique Creative Agency on Workvence",
    guest: "Elena Rostova",
    guestRole: "Founder of Studio 3D & Level 2 Seller",
    duration: "48 min",
    date: "August 24, 2026",
    summary: "Elena breaks down her journey from a solo 3D modeler to managing a 4-person design studio. We discuss pricing psychology, delegating milestones, and retaining enterprise clients.",
    timestamps: [
      "04:15 - Leaving corporate design for marketplace freelancing",
      "14:30 - The 3-tier package strategy that doubled average order value",
      "28:10 - Delegating production work while preserving quality",
      "41:00 - Elena's advice for new sellers in 2026"
    ]
  },
  {
    id: "ep-2",
    number: 33,
    title: "AI & The Next Decade of Independent Software Engineering",
    guest: "Kenji Sato",
    guestRole: "Principal AI Infrastructure Architect",
    duration: "54 min",
    date: "August 10, 2026",
    summary: "Kenji shares how he integrates LLM coding assistants and semantic search pipelines into full-stack client deliverables, delivering enterprise apps 3x faster.",
    timestamps: [
      "06:20 - Why prompt engineering is evolving into systems engineering",
      "19:45 - The real-time marketplace tech stack of Workvence",
      "35:10 - How senior contractors charge for speed rather than hours"
    ]
  },
  {
    id: "ep-3",
    number: 32,
    title: "Escrow Systems, KYC & Why Trust is the Marketplace Moat",
    guest: "Marcus Vance",
    guestRole: "VP of Marketplace Trust & Risk",
    duration: "42 min",
    date: "July 22, 2026",
    summary: "An inside look at how Workvence protects buyer funds, verifies freelancer identity, and mediates high-stakes international contracts.",
    timestamps: [
      "05:00 - The mathematics behind zero-latency escrow release",
      "18:20 - Preventing buyer fraud and chargebacks",
      "31:40 - The future of global multi-currency settlements"
    ]
  }
];

export default function PodcastPage() {
  const [playingId, setPlayingId] = useState<string | null>("ep-1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(32);

  const activeEpisode = episodes.find((e) => e.id === playingId) || episodes[0];

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingId(id);
      setIsPlaying(true);
      setProgress(0);
      toast.success(`Now playing: Episode #${episodes.find(e => e.id === id)?.number}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Mic className="w-4 h-4 text-[#10b981]" />
              <span>The Official Workvence Podcast</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              The Future of Independent <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Work & Creativity</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Candid conversations with the world's highest-earning freelancers, agency founders, engineers, and tech visionaries.
            </p>

            {/* Listening Platforms Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => toast.success("Opening Spotify channel...")}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
              >
                <span>Listen on Spotify</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={() => toast.success("Opening Apple Podcasts...")}
                className="px-4 py-2 rounded-xl bg-[#f1f5f9] text-gray-800 text-xs font-semibold flex items-center gap-2 hover:bg-gray-200 transition cursor-pointer"
              >
                <span>Apple Podcasts</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={() => toast.success("Opening YouTube...")}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2 hover:bg-red-100 transition cursor-pointer"
              >
                <span>YouTube Watch</span>
                <ExternalLink className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Active Episode Player Banner */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-[#0f172a] text-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6ad724]/20 text-[#6ad724]">
                Episode #{activeEpisode.number} • Featured
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeEpisode.duration}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">{activeEpisode.title}</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Guest: <span className="text-[#6ad724] font-semibold">{activeEpisode.guest}</span> ({activeEpisode.guestRole})
              </p>
            </div>

            {/* Audio Wave / Scrubber Bar */}
            <div className="space-y-2 pt-2">
              <div
                className="w-full bg-white/20 h-2 rounded-full cursor-pointer relative overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  setProgress(Math.round(pct));
                }}
              >
                <div
                  className="bg-[#10b981] h-full rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{Math.floor((progress / 100) * 48)}:12</span>
                <span>{activeEpisode.duration}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => togglePlay(activeEpisode.id)}
                  className="w-12 h-12 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer"
                >
                  {isPlaying && playingId === activeEpisode.id ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                <span className="text-xs font-semibold text-gray-300">
                  {isPlaying ? "Playing Now" : "Click to Play Episode"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Episode link copied!");
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episode Archive List */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-2xl font-bold text-[#0f172a]">All Episodes</h3>
            <span className="text-xs text-gray-500 font-medium">34 Available</span>
          </div>

          <div className="space-y-6">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-7 hover:border-[#327C73] transition duration-200 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#327C73]">Episode #{ep.number}</span>
                    <h4 className="text-xl font-bold text-[#0f172a]">{ep.title}</h4>
                    <p className="text-xs text-gray-500">
                      With {ep.guest} • {ep.date} • {ep.duration}
                    </p>
                  </div>

                  <button
                    onClick={() => togglePlay(ep.id)}
                    className="w-10 h-10 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer"
                  >
                    {isPlaying && playingId === ep.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {ep.summary}
                </p>

                {/* Show Notes / Timestamps */}
                <div className="pt-3 border-t border-gray-200/70 space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Episode Timestamps:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600">
                    {ep.timestamps.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
