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
import { Button } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";
import toast from "react-hot-toast";

const VOLUME_OPTIONS: CustomSelectOption[] = [
  { value: "2-4 articles/month", label: "2 - 4 articles / month" },
  { value: "4-8 articles/month", label: "4 - 8 articles / month" },
  { value: "8+ articles/month", label: "8+ articles / month (High Scale)" },
];

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
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-[rgba(0,0,0,0.10)] py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] text-xs font-semibold">
              <Feather className="w-3.5 h-3.5 text-[#0D6D5F]" />
              <span>Workvence ClearVoice • Managed Content Studio</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#0f172a] leading-tight">
              Managed Content Marketing <br className="hidden sm:inline" />
              <span className="text-[#0D6D5F]">Produced at Scale</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              High-impact SEO articles, technical whitepapers, and copy delivered by vetted specialized writers with full editorial quality assurance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Button
                onClick={() => setIsRequestOpen(true)}
                variant="brand"
                size="md"
                radius="fiverr"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-semibold text-xs sm:text-sm shadow-xs"
              >
                Request Content Strategy Call
              </Button>
              <Link
                href="/packages?category=writing-and-translation"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] hover:bg-gray-50 text-[#0f172a] font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                Explore Copywriting Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Editorial Capabilities</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              End-to-End Managed Editorial Pipelines
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Scale your brand content with dedicated freelance editors and domain writers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contentSolutions.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 sm:p-8 space-y-4 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
                >
                  <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#0D6D5F]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">{sol.title}</h3>
                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{sol.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Request Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[6px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[rgba(0,0,0,0.10)] my-8">
            <Button
              onClick={() => setIsRequestOpen(false)}
              variant="soft"
              size="icon"
              radius="full"
              className="absolute top-5 right-5 w-8 h-8 text-gray-600 hover:text-black cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="space-y-1 mb-5">
              <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Content Strategy</span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0f172a]">Request Content Strategy</h3>
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
                  className="w-full px-3.5 py-2.5 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Monthly Volume</label>
                <CustomSelect
                  value={contentForm.volume}
                  onChange={(val) => setContentForm((prev) => ({ ...prev, volume: val }))}
                  options={VOLUME_OPTIONS}
                  size="md"
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                size="md"
                radius="fiverr"
                fullWidth
                leftIcon={<Send className="w-4 h-4" />}
                className="font-semibold shadow-xs mt-2"
              >
                Submit Strategy Request
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
