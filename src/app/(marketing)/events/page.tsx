"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
  Play
} from "lucide-react";
import toast from "react-hot-toast";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "Webinar" | "Workshop" | "Meetup" | "Recording";
  speaker: string;
  speakerRole: string;
  attendeesCount: number;
  description: string;
  isVirtual: boolean;
}

const events: EventItem[] = [
  {
    id: "ev-1",
    title: "Mastering UI/UX Design Systems in Figma for Marketplace Clients",
    date: "September 12, 2026",
    time: "11:00 AM EST (Virtual)",
    type: "Workshop",
    speaker: "Elena Rostova",
    speakerRole: "Top Rated Design Specialist",
    attendeesCount: 420,
    description: "Learn how to structure multi-brand design tokens, build reusable Figma component libraries, and pitch high-ticket design packages.",
    isVirtual: true
  },
  {
    id: "ev-2",
    title: "AI-Powered Full Stack Development: Accelerating Delivery with Next.js 16",
    date: "September 18, 2026",
    time: "2:00 PM EST (Virtual)",
    type: "Webinar",
    speaker: "Kenji Sato",
    speakerRole: "Senior AI & Cloud Engineer",
    attendeesCount: 680,
    description: "Deep dive into real-time server actions, vector embeddings, and building reliable freelance client deliverables with modern TypeScript.",
    isVirtual: true
  },
  {
    id: "ev-3",
    title: "Workvence Creators Meetup — London Tech Week",
    date: "October 05, 2026",
    time: "6:30 PM BST (Shoreditch, London)",
    type: "Meetup",
    speaker: "Workvence Community Team",
    speakerRole: "Global Community Leads",
    attendeesCount: 150,
    description: "An evening of drinks, networking, lightning talks, and freelance agency masterclasses in central London.",
    isVirtual: false
  },
  {
    id: "ev-4",
    title: "Pricing Strategy Masterclass: How to 3x Your Freelance Rates",
    date: "August 20, 2026 (Recorded)",
    time: "60 mins on-demand",
    type: "Recording",
    speaker: "Marcus Vance",
    speakerRole: "Agency Growth Mentor",
    attendeesCount: 1850,
    description: "Watch the recorded recording on value-based pricing, handling client objections, and structuring recurring retainers.",
    isVirtual: true
  }
];

export default function EventsPage() {
  const [filterType, setFilterType] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "" });

  const eventTypes = ["All", "Webinar", "Workshop", "Meetup", "Recording"];

  const filteredEvents = events.filter(
    (e) => filterType === "All" || e.type === filterType
  );

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name || !rsvpForm.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success(`RSVP confirmed for ${selectedEvent?.title}! Calendar invite sent.`);
    setSelectedEvent(null);
    setRsvpForm({ name: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Calendar className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Live & Virtual Events</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Learn, Connect & Grow <br className="hidden sm:inline" />
              <span className="text-[#327C73]">with Industry Masters</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Join interactive live workshops, seller masterclasses, and local creator meetups designed to level up your craft and business.
            </p>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {eventTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    filterType === t
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t === "All" ? "All Events" : `${t}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200/90 rounded-3xl p-8 hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/10 text-[#327C73]">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {item.attendeesCount} Registered
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-[#327C73] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#327C73]" />
                      <span className="font-semibold text-gray-800">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Speaker:</span>
                      <span className="font-medium text-gray-800">{item.speaker} ({item.speakerRole})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedEvent(item)}
                    className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {item.type === "Recording" ? <Play className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    <span>{item.type === "Recording" ? "Watch Recording" : "RSVP for Free"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">
                Event Registration
              </span>
              <h3 className="text-xl font-bold text-[#0f172a]">{selectedEvent.title}</h3>
              <p className="text-xs text-gray-500">
                {selectedEvent.date} • {selectedEvent.time}
              </p>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={rsvpForm.name}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={rsvpForm.email}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                  placeholder="jordan@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm RSVP & Add to Calendar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
