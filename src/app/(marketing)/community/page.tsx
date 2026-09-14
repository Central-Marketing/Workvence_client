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
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Users className="w-4 h-4 text-[#10b981]" />
              <span>The Global Creator Collective</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Where Independent <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Minds Connect</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Join over 1.5 million designers, developers, writers, and digital entrepreneurs sharing insights, attending masterclasses, and growing together.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/forum"
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Visit Forum</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/events"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
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
                  className="bg-white border border-gray-200/90 rounded-3xl p-8 space-y-6 shadow-xs hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0f172a]">{h.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">{h.desc}</p>
                  </div>

                  <Link
                    href={h.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#327C73] hover:text-[#28635c] transition pt-2 border-t border-gray-100"
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">Our Community Values</span>
            <h2 className="text-3xl font-bold text-[#0f172a]">Mutual Respect & Open Collaboration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-[#f8fafc] rounded-2xl border border-gray-200/80 space-y-2">
              <h4 className="font-bold text-[#0f172a] text-base">Knowledge Sharing</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                We believe when one freelancer succeeds, the whole community elevates. Share playbooks and support peers.
              </p>
            </div>
            <div className="p-6 bg-[#f8fafc] rounded-2xl border border-gray-200/80 space-y-2">
              <h4 className="font-bold text-[#0f172a] text-base">Inclusivity & Safety</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                A harassment-free space welcoming creators of all backgrounds, countries, and experience levels.
              </p>
            </div>
            <div className="p-6 bg-[#f8fafc] rounded-2xl border border-gray-200/80 space-y-2">
              <h4 className="font-bold text-[#0f172a] text-base">High Craft Standards</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Encouraging lifelong craft mastery, ethical pricing, and uncompromised client delivery excellence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
