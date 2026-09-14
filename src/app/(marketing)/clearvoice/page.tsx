"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Feather,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Search,
  BookOpen,
  Send,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const contentSolutions = [
  {
    icon: Search,
    title: "SEO-Driven Blog Articles",
    desc: "Keyword-optimized, highly engaging articles written by domain experts to rank #1 on Google and capture intent-driven leads."
  },
  {
    icon: FileText,
    title: "Technical Whitepapers & E-books",
    desc: "In-depth research papers, case studies, and corporate reports designed for B2B lead generation and enterprise sales enablement."
  },
  {
    icon: Sparkles,
    title: "High-Converting Ad Copy & Emails",
    desc: "Direct-response copy for landing pages, Klaviyo email sequences, and paid ad scripts engineered to maximize conversion rates."
  }
];

export default function ClearVoicePage() {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [contentForm, setContentForm] = useState({ name: "", email: "", company: "", volume: "4-8 articles/month" });

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm.name || !contentForm.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success("Content strategy request received! Our editorial director will contact you within 24 hours.");
    setIsRequestOpen(false);
    setContentForm({ name: "", email: "", company: "", volume: "4-8 articles/month" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Feather className="w-4 h-4 text-[#10b981]" />
              <span>Workvence ClearVoice • Managed Content Studio</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Managed Content Marketing <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Produced at Scale</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              High-impact SEO articles, technical whitepapers, and copy delivered by vetted specialized writers with full editorial quality assurance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsRequestOpen(true)}
                className="px-8 py-4 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Request Content Strategy Call</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/packages?category=writing-and-translation"
                className="px-8 py-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Explore Copywriting Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Editorial Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              End-to-End Managed Editorial Pipelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contentSolutions.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200/90 rounded-3xl p-8 space-y-4 shadow-xs hover:border-[#327C73] hover:shadow-md transition duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a]">{sol.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-normal">{sol.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Request Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsRequestOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-xl font-bold text-[#0f172a]">Request Content Strategy</h3>
              <p className="text-xs text-gray-500">Plan your managed editorial schedule.</p>
            </div>

            <form onSubmit={handleContentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={contentForm.name}
                  onChange={(e) => setContentForm({ ...contentForm, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={contentForm.email}
                  onChange={(e) => setContentForm({ ...contentForm, email: e.target.value })}
                  placeholder="sarah@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Monthly Volume</label>
                <select
                  value={contentForm.volume}
                  onChange={(e) => setContentForm({ ...contentForm, volume: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                >
                  <option value="2-4 articles/month">2 - 4 articles / month</option>
                  <option value="4-8 articles/month">4 - 8 articles / month</option>
                  <option value="8+ articles/month">8+ articles / month (High Scale)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Strategy Request</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
