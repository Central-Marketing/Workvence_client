"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Home, Search, X, MessageSquare, Ticket, LifeBuoy } from "lucide-react";
import { Button } from "@/components";

interface HelpTopic {
  title: string;
  desc: string;
}

const FREELANCER_TOPICS: HelpTopic[] = [
  {
    title: "Getting Started",
    desc: "Profile setup, identity verification, and first steps.",
  },
  {
    title: "Account Security",
    desc: "Setting up two-factor authentication and managing passwords.",
  },
  {
    title: "Customization",
    desc: "Adjusting preferences to tailor the user experience.",
  },
  {
    title: "Notifications",
    desc: "Configuring alerts and communication settings.",
  },
  {
    title: "Data Import",
    desc: "Uploading files and integrating with external services.",
  },
  {
    title: "Collaboration",
    desc: "Inviting team members and managing permissions.",
  },
  {
    title: "Billing & Subscription",
    desc: "Understanding plans, payments, and billing cycles.",
  },
  {
    title: "Troubleshooting",
    desc: "Finding solutions to common problems and FAQs.",
  },
  {
    title: "Advanced Features",
    desc: "Exploring tools for power users and developers.",
  },
];

const CLIENT_TOPICS: HelpTopic[] = [
  {
    title: "Post a Project",
    desc: "Writing descriptions, setting budgets, and categories.",
  },
  {
    title: "Browse Projects",
    desc: "Explore available projects by category and skill requirements.",
  },
  {
    title: "Make Payments",
    desc: "Handle payments safely with multiple supported options.",
  },
  {
    title: "Communicate",
    desc: "Use integrated messaging to collaborate with clients and teams.",
  },
  {
    title: "Manage Contracts",
    desc: "Review and sign contracts securely within the platform.",
  },
  {
    title: "Submit Proposal",
    desc: "Craft personalized proposals to win project opportunities.",
  },
  {
    title: "Track Progress",
    desc: "Monitor project milestones and deadlines effectively.",
  },
  {
    title: "Post a Project",
    desc: "Writing descriptions, setting budgets, and categories.",
  },
  {
    title: "Leave Reviews",
    desc: "Rate and review clients or freelancers after project completion.",
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFreelancerTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FREELANCER_TOPICS;
    return FREELANCER_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredClientTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CLIENT_TOPICS;
    return CLIENT_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalResults =
    filteredFreelancerTopics.length + filteredClientTopics.length;

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased">
      {/* Page Container */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* 1. Hero Section */}
        <section
          aria-label="Help Center Banner"
          className="w-full bg-[#152232] rounded-[20px] sm:rounded-[24px] py-14 sm:py-16 md:py-20 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs"
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2 text-xs sm:text-[13px] text-[#8DA4BE] tracking-wide mb-6 sm:mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5 stroke-[1.8]" />
            </Link>
            <span className="text-[#8DA4BE]/40 text-xs select-none">/</span>
            <span className="font-normal text-[#8DA4BE]">Help Center</span>
          </nav>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal italic tracking-tight text-[#79B5E8] leading-[1.12] sm:leading-[1.08] select-none">
            How Can We Help you?
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-4 text-xs sm:text-[13px] md:text-sm text-[#94A3B8] max-w-xl leading-relaxed">
            Search our knowledge base or browse support categories to quickly find answers.
          </p>

          {/* Search Input Bar */}
          <div className="mt-6 sm:mt-8 w-full max-w-[560px] relative">
            <div className="w-full bg-white rounded-[6px] shadow-sm border border-black/[0.06] flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#79B5E8]/40">
              <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What services are you looking for..."
                className="w-full bg-transparent text-sm sm:text-[15px] text-[#292929] placeholder-[#9CA3AF] focus:outline-none"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  radius="full"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 p-0.5 ml-1 transition-colors w-6 h-6 min-h-0"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* 2. Knowledge Base Topics: 2-Column Cards */}
        <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Card: For Freelancers */}
          <div className="bg-white rounded-[6px] md:rounded-[20px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 sm:p-9 md:p-10 flex flex-col">
            <header>
              <h2 className="font-sf-pro font-normal text-[#292929] text-2xl sm:text-3xl md:text-[34px] tracking-tight leading-snug">
                For Freelancers
              </h2>
              <p className="mt-2 font-inter font-normal text-[#6E6E6E] text-xs sm:text-[13px] md:text-sm leading-relaxed">
                Resources to help you build your business and manage your projects.
              </p>
            </header>

            <div className="border-b border-[#F0F0F0] my-6 sm:my-7" />

            <div className="space-y-6 sm:space-y-7 flex-1">
              {filteredFreelancerTopics.length > 0 ? (
                filteredFreelancerTopics.map((topic, index) => (
                  <div key={index} className="group">
                    <h3 className="font-sf-pro font-bold text-[#292929] text-[15px] sm:text-[16px] md:text-[17px] leading-snug">
                      {topic.title}
                    </h3>
                    <p className="mt-1 sm:mt-1.5 font-inter font-normal text-[#6E6E6E] text-xs sm:text-[13px] md:text-[13.5px] leading-relaxed">
                      {topic.desc}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-400 italic py-4">
                  No freelancer topics matched &quot;{searchQuery}&quot;.
                </p>
              )}
            </div>
          </div>

          {/* Right Card: For Clients */}
          <div className="bg-white rounded-[6px] md:rounded-[20px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 sm:p-9 md:p-10 flex flex-col">
            <header>
              <h2 className="font-sf-pro font-normal text-[#292929] text-2xl sm:text-3xl md:text-[34px] tracking-tight leading-snug">
                For Clients
              </h2>
              <p className="mt-2 font-inter font-normal text-[#6E6E6E] text-xs sm:text-[13px] md:text-sm leading-relaxed">
                Tools and guides to help you find talent and scale your team.
              </p>
            </header>

            <div className="border-b border-[#F0F0F0] my-6 sm:my-7" />

            <div className="space-y-6 sm:space-y-7 flex-1">
              {filteredClientTopics.length > 0 ? (
                filteredClientTopics.map((topic, index) => (
                  <div key={index} className="group">
                    <h3 className="font-sf-pro font-bold text-[#292929] text-[15px] sm:text-[16px] md:text-[17px] leading-snug">
                      {topic.title}
                    </h3>
                    <p className="mt-1 sm:mt-1.5 font-inter font-normal text-[#6E6E6E] text-xs sm:text-[13px] md:text-[13.5px] leading-relaxed">
                      {topic.desc}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-400 italic py-4">
                  No client topics matched &quot;{searchQuery}&quot;.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Support Continuity & Assistance Bar */}
        <aside
          aria-label="Contact and Support Assistance"
          className="mt-10 sm:mt-12 md:mt-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xs"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-[6px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 hidden sm:flex">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sf-pro font-semibold text-[#1E293B] text-sm sm:text-base">
                Still have questions? Our support team is here to help
              </h4>
              <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                Reach out anytime for personalized assistance with your account or projects.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#327C73] hover:bg-[#28635c] text-white text-xs sm:text-[13px] font-semibold transition-colors shadow-xs active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Submit a Ticket</span>
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-[#334155] text-xs sm:text-[13px] font-semibold transition-colors shadow-xs active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
              <span>Support Dashboard</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
