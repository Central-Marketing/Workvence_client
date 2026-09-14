"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Star,
  Quote,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  Building,
  Briefcase
} from "lucide-react";

interface Story {
  id: string;
  name: string;
  role: string;
  company: string;
  category: string;
  type: "Buyer" | "Freelancer";
  statLabel: string;
  statValue: string;
  headline: string;
  quote: string;
  fullStory: string;
}

const stories: Story[] = [
  {
    id: "s-1",
    name: "Marcus Vance",
    role: "Founder & CEO",
    company: "Loomix AI (SaaS Startup)",
    category: "Tech & Dev",
    type: "Buyer",
    statLabel: "Time to MVP Launch",
    statValue: "3 Weeks",
    headline: "How Loomix built and launched their AI search engine in 21 days with Workvence developers",
    quote: "Workvence allowed us to hire top-tier full-stack React and AI prompt engineers in 24 hours. The escrow milestone structure gave our investors complete peace of mind.",
    fullStory: "When Loomix AI needed to build a customer-facing MVP within a month to close their seed round, local hiring was too slow. Through Workvence, they found two senior full-stack developers and a UI/UX designer. By organizing the sprint into weekly milestones, the platform guaranteed accountability while speeding up delivery by 400%."
  },
  {
    id: "s-2",
    name: "Elena Rostova",
    role: "Brand Identity & 3D Animator",
    company: "Elena Studio",
    category: "Design",
    type: "Freelancer",
    statLabel: "Annual Earnings",
    statValue: "$145,000+",
    headline: "From solo graphic artist to thriving boutique agency on Workvence",
    quote: "I started with one logo package. Today I have repeat clients across 25 countries and run a 4-person design studio through Workvence Workspace.",
    fullStory: "Elena joined Workvence with 3 years of 3D motion design experience. By focusing on rapid delivery and high communication standards, she reached Level 2 Seller within four months. Enterprise clients began booking recurring retainers, enabling her to scale her hourly rates and achieve financial independence."
  },
  {
    id: "s-3",
    name: "David Chen",
    role: "VP of Growth",
    company: "Nordic Wave Apparel",
    category: "Marketing",
    type: "Buyer",
    statLabel: "ROAS Increase",
    statValue: "+320%",
    headline: "Scaling global e-commerce campaigns with specialized marketing freelancers",
    quote: "Finding vetted TikTok ad creators and Klaviyo email specialists on Workvence helped us scale Black Friday revenue past $1.2M.",
    fullStory: "Nordic Wave needed agile creative testing for social ads across US and European markets. Rather than committing to a rigid agency retainer, they hired 5 specialized video editors and copywriters on Workvence. Fast turnaround times allowed them to test 40+ ad hooks weekly, driving a 320% increase in ad spend return."
  },
  {
    id: "s-4",
    name: "Tariq Al-Mansoor",
    role: "Senior Cloud & DevOps Architect",
    company: "Independent Consultant",
    category: "Tech & Dev",
    type: "Freelancer",
    statLabel: "Completed Projects",
    statValue: "280+ Gigs",
    headline: "Transitioning from corporate engineering to full-time remote consulting",
    quote: "The zero-friction escrow payouts and verified enterprise buyer network make Workvence the best platform for senior engineers.",
    fullStory: "Tariq left traditional corporate consulting to gain geographic freedom. Through Workvence Pro, he connects with venture-backed scaleups needing AWS migration and Kubernetes infrastructure auditing. He now works 25 hours a week while earning double his previous corporate salary."
  }
];

export default function SuccessStoriesPage() {
  const [filterType, setFilterType] = useState<"All" | "Buyer" | "Freelancer">("All");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const filteredStories = stories.filter(
    (s) => filterType === "All" || s.type === filterType
  );

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Trophy className="w-4 h-4 text-[#10b981]" />
              <span>Customer Success Stories</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Real Stories. Real Impact. <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Built on Workvence.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Explore how ambitious companies scale their operations and how independent professionals build thriving global careers.
            </p>

            {/* Filter Toggle */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {(["All", "Buyer", "Freelancer"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    filterType === t
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t === "All" ? "All Stories" : `${t} Stories`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-gray-200/90 rounded-3xl p-8 hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/10 text-[#327C73]">
                      {story.type} Case Study • {story.category}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#0f172a] block">{story.statValue}</span>
                      <span className="text-[11px] text-gray-400 block">{story.statLabel}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-[#327C73] transition-colors leading-snug">
                    {story.headline}
                  </h3>

                  <div className="p-4 bg-[#f8fafc] rounded-2xl border border-gray-100 italic text-xs text-gray-700 leading-relaxed relative">
                    <Quote className="w-4 h-4 text-[#327C73] absolute top-2 right-2 opacity-40" />
                    "{story.quote}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-bold text-[#0f172a]">{story.name}</div>
                    <div className="text-xs text-gray-500">{story.role}, {story.company}</div>
                  </div>
                  <button
                    onClick={() => setSelectedStory(story)}
                    className="text-xs font-bold text-[#327C73] hover:text-[#28635c] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="mt-16 bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to write your own success story?</h2>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              Whether you need to hire top talent or sell your specialized services, Workvence gives you the tools to succeed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/packages"
                className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs shadow-md transition active:scale-95"
              >
                Hire Top Talent
              </Link>
              <Link
                href="/become-a-seller"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story Details Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-10 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-3 mb-6">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#10b981]/10 text-[#327C73]">
                {selectedStory.type} Case Study
              </span>
              <h3 className="text-2xl font-bold text-[#0f172a] leading-tight">
                {selectedStory.headline}
              </h3>
              <div className="text-xs text-gray-500">
                {selectedStory.name} • {selectedStory.role}, {selectedStory.company}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between mb-6">
              <span className="text-xs font-semibold text-emerald-800">{selectedStory.statLabel}</span>
              <span className="text-2xl font-extrabold text-emerald-700">{selectedStory.statValue}</span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>{selectedStory.fullStory}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={() => setSelectedStory(null)}
                className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
