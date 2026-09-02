"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Circle,
  MapPin,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  User,
  Send,
  X
} from "lucide-react";
import toast from "react-hot-toast";

interface CreativeMember {
  id: string;
  name: string;
  role: string;
  location: string;
  status: "Working" | "Not Working (Available)";
  statusColor: string;
  availableDate: string;
  dayRate: string;
  specialties: string[];
  bio: string;
}

const creatives: CreativeMember[] = [
  {
    id: "cr-1",
    name: "Elena Rostova",
    role: "Senior 3D Art Director & Motion Lead",
    location: "Berlin / Remote",
    status: "Not Working (Available)",
    statusColor: "bg-emerald-500",
    availableDate: "Immediate",
    dayRate: "$850 / day",
    specialties: ["Cinema 4D", "Brand Motion", "Figma", "Creative Direction"],
    bio: "Ex-agency senior creative director specializing in luxury branding, 3D product animations, and interactive web visual systems."
  },
  {
    id: "cr-2",
    name: "Kenji Sato",
    role: "Principal Frontend Architect",
    location: "Tokyo / Remote",
    status: "Working",
    statusColor: "bg-amber-500",
    availableDate: "Booked until Oct 15",
    dayRate: "$1,100 / day",
    specialties: ["Next.js 16", "TypeScript", "WebGL", "High-Volume Scaling"],
    bio: "Specializing in high-performance web applications, fluid micro-interactions, and complex SaaS frontend architecture."
  },
  {
    id: "cr-3",
    name: "Sophie Dubois",
    role: "Lead Product & UI/UX Designer",
    location: "Paris / Remote",
    status: "Not Working (Available)",
    statusColor: "bg-emerald-500",
    availableDate: "Immediate",
    dayRate: "$780 / day",
    specialties: ["Design Systems", "Fintech UX", "Mobile Apps", "User Research"],
    bio: "10+ years crafting conversion-focused digital experiences for venture-backed Silicon Valley and European startups."
  },
  {
    id: "cr-4",
    name: "Marcus Vance",
    role: "Brand Strategist & Copy Lead",
    location: "New York / Remote",
    status: "Not Working (Available)",
    statusColor: "bg-emerald-500",
    availableDate: "Available for Q4 sprints",
    dayRate: "$900 / day",
    specialties: ["Brand Naming", "Direct Response", "Video Scripts", "B2B SaaS"],
    bio: "Helping scaleups clarify their value propositions and write copy that closes high-ACV enterprise software contracts."
  }
];

export default function WorkingNotWorkingPage() {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedCreative, setSelectedCreative] = useState<CreativeMember | null>(null);
  const [inquiryForm, setInquiryForm] = useState({ clientName: "", email: "", projectSummary: "" });

  const filteredCreatives = creatives.filter((c) => {
    if (filterStatus === "Available") return c.status.includes("Available");
    if (filterStatus === "Booked") return c.status === "Working";
    return true;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.clientName || !inquiryForm.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success(`Booking inquiry sent to ${selectedCreative?.name}! They will reply within 24 hours.`);
    setSelectedCreative(null);
    setInquiryForm({ clientName: "", email: "", projectSummary: "" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0f172a] via-[#112131] to-[#0f172a] text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6ad724]/10 border border-[#6ad724]/20 text-[#6ad724] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#6ad724]" />
              <span>Curated Creative Roster</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Working Not Working <br className="hidden sm:inline" />
              <span className="text-[#6ad724]">Creative Network</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal">
              Find out who is available right now. Connect directly with vetted creative directors, animators, UI/UX architects, and copy leads.
            </p>

            {/* Filter Toggle */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {["All", "Available", "Booked"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    filterStatus === st
                      ? "bg-[#6ad724] text-[#0f172a] font-bold shadow-xs"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {st === "All" ? "All Creatives" : st === "Available" ? "Available Now" : "Currently Booked"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creatives List Grid */}
      <div className="container mx-auto px-4 md:px-6 pt-16 max-w-5xl">
        <div className="space-y-6">
          {filteredCreatives.map((cr) => (
            <div
              key={cr.id}
              className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 hover:bg-white hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 shadow-2xs">
                    <span className={`w-2 h-2 rounded-full ${cr.statusColor} animate-pulse`} />
                    <span className="text-gray-900">{cr.status}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {cr.location}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cr.availableDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-[#0f172a]">{cr.name}</h3>
                  <div className="text-sm font-semibold text-[#327C73]">{cr.role}</div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {cr.bio}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {cr.specialties.map((sp) => (
                    <span
                      key={sp}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white text-gray-700 border border-gray-200/80"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:items-end justify-between gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200">
                <div className="text-left sm:text-right">
                  <span className="text-xl font-extrabold text-[#0f172a] block">{cr.dayRate}</span>
                  <span className="text-[11px] text-gray-400">Standard Day Rate</span>
                </div>

                <button
                  onClick={() => setSelectedCreative(cr)}
                  className="px-6 py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Book / Check Dates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedCreative && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedCreative(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">Direct Talent Booking</span>
              <h3 className="text-xl font-bold text-[#0f172a]">Book {selectedCreative.name}</h3>
              <p className="text-xs text-gray-500">{selectedCreative.role} • {selectedCreative.dayRate}</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name / Organization *</label>
                <input
                  type="text"
                  required
                  value={inquiryForm.clientName}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, clientName: e.target.value })}
                  placeholder="e.g. Alex at Studio Nine"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  placeholder="alex@studionine.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Project Details & Required Timeline</label>
                <textarea
                  rows={3}
                  value={inquiryForm.projectSummary}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, projectSummary: e.target.value })}
                  placeholder="Tell the creative about your project scope, deliverables, and start date..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Booking Request</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
