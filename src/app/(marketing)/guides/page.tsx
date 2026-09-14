"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Download,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  X,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

interface Guide {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  chapters: string[];
  content: string;
}

const guides: Guide[] = [
  {
    id: "g-1",
    title: "The 2026 Complete Freelancer Playbook: From Zero to $10,000/Month",
    category: "Freelancer Playbooks",
    readTime: "12 min read",
    summary: "A step-by-step masterclass on setting up high-converting packages, optimizing your SEO profile tags, handling client objections, and maintaining 5-star ratings.",
    chapters: [
      "1. Niche Selection & Competitive Market Positioning",
      "2. Crafting High-Converting 3-Tier Packages",
      "3. The First 10 Orders: Accelerating Your Seller Level",
      "4. Managing Client Revisions & Escrow Milestones",
      "5. Building Long-Term Recurring Client Retainers"
    ],
    content: `Building a $10,000/month freelance career is an engineering problem, not luck.

Chapter 1: Niche Positioning
Specialization beats generalization. Instead of 'Full Stack Developer', position yourself as 'Next.js & Stripe Escrow Integration Specialist'. Clients pay 3x higher rates for domain experts who solve their exact bottlenecks.

Chapter 2: The 3-Tier Package Architecture
- Basic Tier: Micro-deliverable to reduce purchase friction (e.g. 1-page UI audit or code review).
- Standard Tier: Complete core solution for 75% of buyers.
- Premium Tier: White-glove turn-key package with source files, expedited turnaround, and 30 days post-launch support.`
  },
  {
    id: "g-2",
    title: "The Founder's Guide to Hiring & Managing Remote Freelance Teams",
    category: "Hiring Playbooks",
    readTime: "10 min read",
    summary: "How startup founders and product managers hire top 1% developers and designers without getting bogged down in endless interviews.",
    chapters: [
      "1. Writing Crystal-Clear Project Briefs",
      "2. Evaluating Portfolios vs. Theoretical Tests",
      "3. Structuring Escrow Milestones for Accountability",
      "4. Asynchronous Communication Rhythms"
    ],
    content: `Great hires start with great briefs. When you provide clear inputs, sample reference links, and concrete acceptance criteria, you filter for senior contractors who respect deadlines.`
  },
  {
    id: "g-3",
    title: "Value-Based Pricing & Negotiation for Independent Contractors",
    category: "Finance & Rates",
    readTime: "8 min read",
    summary: "Stop trading time for money. Learn how to calculate the ROI of your deliverables and price based on client business outcomes.",
    chapters: [
      "1. The Math of Value-Based Pricing",
      "2. Conducting the Discovery Call",
      "3. Handling 'Your Price is Too High' Objections"
    ],
    content: `If your e-commerce redesign increases a client's monthly sales by $50,000, charging $8,000 is an extraordinary return on investment. Price the outcome, not the hours.`
  }
];

const categories = ["All", "Freelancer Playbooks", "Hiring Playbooks", "Finance & Rates"];

export default function GuidesPage() {
  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const filteredGuides = guides.filter((g) => {
    const matchesCat = selectedCat === "All" || g.category === selectedCat;
    const matchesSearch =
      !searchQuery ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <BookOpen className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Masterclass Guides</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Master Independent Work & Hiring
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Curated, actionable playbooks created by top-earning freelancers and high-growth founders.
            </p>
          </div>
        </div>
      </section>

      {/* Main Guides Grid */}
      <div className="container mx-auto px-4 md:px-6 pt-12">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCat === cat
                    ? "bg-[#327C73] text-white shadow-xs"
                    : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#327C73] outline-none"
            />
          </div>
        </div>

        {/* Guides List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 hover:bg-white hover:border-[#327C73] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-[#10b981]/10 text-[#327C73]">
                    {guide.category}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {guide.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#0f172a] hover:text-[#327C73] transition leading-snug">
                  {guide.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {guide.summary}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-gray-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Chapters Included:</span>
                  {guide.chapters.slice(0, 3).map((ch, i) => (
                    <div key={i} className="text-xs text-gray-700 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#327C73]" />
                      <span className="truncate">{ch}</span>
                    </div>
                  ))}
                  {guide.chapters.length > 3 && (
                    <span className="text-[11px] text-[#327C73] font-medium">+ {guide.chapters.length - 3} more chapters</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-[#327C73]">
                <span>Read Masterclass</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Details Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedGuide(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-3 mb-6">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#10b981]/10 text-[#327C73]">
                {selectedGuide.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] leading-snug">
                {selectedGuide.title}
              </h2>
              <div className="text-xs text-gray-500">{selectedGuide.readTime}</div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedGuide.content}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => toast.success("Downloading Guide Checklist PDF...")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#327C73] text-white text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Checklist PDF</span>
              </button>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
