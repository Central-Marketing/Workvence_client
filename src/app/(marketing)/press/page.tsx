"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Download,
  Calendar,
  ArrowRight,
  ExternalLink,
  Mail,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

interface PressRelease {
  id: string;
  title: string;
  date: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
}

const pressReleases: PressRelease[] = [
  {
    id: "pr-1",
    title: "Workvence Announces Next-Generation Escrow & AI-Powered Gig Matching for Global Freelancers",
    date: "August 18, 2026",
    category: "Product Launch",
    readTime: "3 min read",
    summary: "New platform capabilities introduce 256-bit automated escrow milestone protection and semantic AI search connecting buyers to specialized talent in seconds.",
    content: `SAN FRANCISCO & GLOBAL — Workvence, the modern high-trust freelance marketplace, today announced major platform updates designed to transform how businesses hire and collaborate with independent professionals worldwide.

The release introduces zero-latency escrow milestones with automated verification, integrated real-time multilingual messaging, and an AI-powered semantic matching engine that analyzes project specifications to instantly recommend top 1% qualified freelancers.

"Our mission has always been to build the most trustworthy and friction-free operating system for independent work," said the Leadership Team at Workvence. "With these advancements, clients get enterprise-grade security and freelancers get guaranteed payouts without bureaucratic delays."`
  },
  {
    id: "pr-2",
    title: "Workvence Surpasses 1.5 Million Registered Freelancers Across 180+ Countries",
    date: "July 02, 2026",
    category: "Milestone",
    readTime: "2 min read",
    summary: "Exponential international growth driven by fair fee structures, fast multi-currency payouts, and robust seller growth tiers.",
    content: `Workvence today celebrated a landmark milestone, crossing 1.5 million verified creative, engineering, and digital marketing professionals active on the platform.

The company saw notable expansion across North America, Europe, Latin America, and Southeast Asia, driven by transparent platform policies, an industry-low seller commission tier, and dedicated educational programs empowering sellers to build sustainable boutique agencies.`
  },
  {
    id: "pr-3",
    title: "Workvence Launches Pro Vetting Program for High-Growth Scaleups and Enterprise Teams",
    date: "May 14, 2026",
    category: "Enterprise",
    readTime: "4 min read",
    summary: "Workvence Pro introduces rigorous technical auditing, dedicated account concierges, and consolidated monthly billing for enterprise clients.",
    content: `To meet growing demand from venture-backed startups and Fortune 500 teams, Workvence has officially rolled out Workvence Pro.

Every Pro freelancer undergoes a rigorous 4-stage vetting process including background credential validation, live technical assessments, and customer satisfaction audits. Enterprise clients also receive custom NDAs, dedicated talent concierges, and unified corporate billing.`
  }
];

const mediaCoverage = [
  {
    outlet: "TechCrunch",
    headline: "How Workvence is rethinking freelance marketplace trust with automated escrow",
    date: "August 2026",
    link: "#"
  },
  {
    outlet: "Forbes",
    headline: "The future of remote contracting: Inside Workvence's global creator economy",
    date: "July 2026",
    link: "#"
  },
  {
    outlet: "VentureBeat",
    headline: "Workvence integrates semantic vector search to connect clients with niche tech talent",
    date: "June 2026",
    link: "#"
  },
  {
    outlet: "Fast Company",
    headline: "The top marketplace platforms redefining independent work in 2026",
    date: "April 2026",
    link: "#"
  }
];

export default function PressPage() {
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    outlet: "",
    email: "",
    deadline: "",
    message: ""
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.outlet) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Press inquiry submitted! Our media relations team will respond promptly.");
    setInquiryForm({ name: "", outlet: "", email: "", deadline: "", message: "" });
  };

  const handleDownloadKit = () => {
    toast.success("Downloading Workvence Brand Assets Kit (ZIP)...");
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Newspaper className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Newsroom</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              News, Announcements & Media Resources
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Stay up to date with product launches, company milestones, independent work research, and official brand assets.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={handleDownloadKit}
                className="px-6 py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Media Kit (.ZIP)</span>
              </button>
              <a
                href="#media-inquiries"
                className="px-6 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-xs transition"
              >
                Press Inquiries
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Press Releases (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-[#0f172a]">Press Releases</h2>
                <span className="text-xs text-gray-500 font-medium">Official Statements</span>
              </div>

              <div className="space-y-6">
                {pressReleases.map((pr) => (
                  <article
                    key={pr.id}
                    className="bg-white border border-gray-200/90 rounded-2xl p-7 hover:border-[#327C73] hover:shadow-md transition-all duration-200 space-y-3"
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded-md font-bold bg-[#10b981]/10 text-[#327C73]">
                        {pr.category}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {pr.date}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{pr.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#0f172a] hover:text-[#327C73] transition-colors cursor-pointer" onClick={() => setSelectedRelease(pr)}>
                      {pr.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                      {pr.summary}
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedRelease(pr)}
                        className="text-xs font-bold text-[#327C73] hover:text-[#28635c] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Read Full Release</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Media Coverage Section */}
              <div className="pt-10 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-[#0f172a]">In the News</h2>
                  <span className="text-xs text-gray-500 font-medium">Selected Media Coverage</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mediaCoverage.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#f8fafc] border border-gray-200/80 rounded-2xl p-5 space-y-2 hover:bg-white hover:border-[#327C73] hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#327C73]">{item.outlet}</span>
                        <span className="text-gray-400">{item.date}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#0f172a] leading-snug">
                        {item.headline}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Media Kit & Inquiries (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Media Kit Card */}
              <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl p-6 space-y-5">
                <h3 className="text-lg font-bold text-[#0f172a]">Official Brand Assets</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Download high-resolution logos, brand guidelines, product screenshots, and executive portraits.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#327C73]" />
                      Workvence Logos (.SVG, .PNG)
                    </span>
                    <span className="text-gray-400">4.2 MB</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#327C73]" />
                      Brand Identity Guidelines (.PDF)
                    </span>
                    <span className="text-gray-400">8.1 MB</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#327C73]" />
                      Product & Executive Photos (.ZIP)
                    </span>
                    <span className="text-gray-400">18.5 MB</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadKit}
                  className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-black text-white font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete Brand Kit</span>
                </button>
              </div>

              {/* Media Inquiries Form */}
              <div id="media-inquiries" className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0f172a]">Media Relations</h3>
                  <p className="text-xs text-gray-500">
                    Are you a journalist or analyst? Get in touch with our communications team.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] focus:ring-1 focus:ring-[#327C73] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Publication / Outlet *</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.outlet}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, outlet: e.target.value })}
                      placeholder="e.g. Tech Report"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] focus:ring-1 focus:ring-[#327C73] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      placeholder="alex@publication.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] focus:ring-1 focus:ring-[#327C73] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Deadline / Date</label>
                    <input
                      type="text"
                      value={inquiryForm.deadline}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, deadline: e.target.value })}
                      placeholder="e.g. Today 5 PM EST"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] focus:ring-1 focus:ring-[#327C73] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Inquiry Details</label>
                    <textarea
                      rows={3}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      placeholder="Story focus, interview requests..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] focus:ring-1 focus:ring-[#327C73] outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Press Inquiry</span>
                  </button>
                </form>

                <div className="pt-2 text-center text-[11px] text-gray-400">
                  Direct email: <span className="font-semibold text-gray-600">press@workvence.com</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Press Release Reader Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedRelease(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md font-bold bg-[#10b981]/10 text-[#327C73]">
                  {selectedRelease.category}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{selectedRelease.date}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] leading-snug">
                {selectedRelease.title}
              </h2>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedRelease.content}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Workvence Press Office</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Article link copied to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Release</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
