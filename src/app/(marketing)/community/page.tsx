"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  Globe2,
  Award,
  HeartHandshake,
  BookOpen,
  Share2
} from "lucide-react";

const communityHighlights = [
  {
    icon: MessageSquare,
    title: "Community Forum",
    desc: "Connect with fellow creators, ask for feedback, share tips on pricing, and discuss marketplace updates.",
    href: "/forum",
    cta: "Join the Discussion"
  },
  {
    icon: Calendar,
    title: "Workshops & Events",
    desc: "Attend weekly live webinars, masterclasses from Top Rated sellers, and virtual global networking meetups.",
    href: "/events",
    cta: "Browse Events"
  },
  {
    icon: BookOpen,
    title: "The Workvence Blog",
    desc: "Read in-depth guides on scaling your freelance business, mastering client communications, and design trends.",
    href: "/blog",
    cta: "Read Articles"
  },
  {
    icon: Award,
    title: "Ambassador Program",
    desc: "Represent Workvence in your city, host local meetups, and earn exclusive ambassador perks and grants.",
    href: "/influencers",
    cta: "Learn More"
  }
];

export default function CommunityHubPage() {
  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-[rgba(0,0,0,0.10)] py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-[#0D6D5F]" />
              <span>The Global Creator Collective</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#0f172a] leading-tight">
              Where Independent <br className="hidden sm:inline" />
              <span className="text-[#0D6D5F]">Minds Connect</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Join over 1.5 million designers, developers, writers, and digital entrepreneurs sharing insights, attending masterclasses, and growing together.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/forum"
                className="px-6 h-10 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Visit Forum</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/events"
                className="px-6 h-10 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] hover:bg-gray-50 text-[#0f172a] font-semibold text-xs sm:text-sm transition inline-flex items-center justify-center cursor-pointer"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityHighlights.map((h, idx) => {
              const Icon = h.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 sm:p-8 space-y-6 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#0D6D5F]" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">{h.title}</h3>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{h.desc}</p>
                  </div>

                  <Link
                    href={h.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#0D6D5F] hover:text-[#0b5c50] transition pt-2 border-t border-[rgba(0,0,0,0.06)]"
                  >
                    <span>{h.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Our Community Values</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">Mutual Respect & Open Collaboration</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              The foundational principles guiding every interaction across the Workvence ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)] space-y-2 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200">
              <h4 className="font-bold text-[#0f172a] text-sm sm:text-base">Knowledge Sharing</h4>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                We believe when one freelancer succeeds, the whole community elevates. Share playbooks and support peers.
              </p>
            </div>
            <div className="p-6 bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)] space-y-2 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200">
              <h4 className="font-bold text-[#0f172a] text-sm sm:text-base">Inclusivity & Safety</h4>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                A harassment-free space welcoming creators of all backgrounds, countries, and experience levels.
              </p>
            </div>
            <div className="p-6 bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)] space-y-2 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200">
              <h4 className="font-bold text-[#0f172a] text-sm sm:text-base">High Craft Standards</h4>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Encouraging lifelong craft mastery, ethical pricing, and uncompromised client delivery excellence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
