"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Video,
  DollarSign,
  Gift,
  Users,
  ArrowRight,
  CheckCircle2,
  Send,
  Globe2,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const creatorTiers = [
  {
    tier: "Rising Creator",
    audience: "5k – 50k Followers",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    perks: [
      "Custom 15% discount promo code for your audience",
      "$250 monthly Workvence credits for your creative projects",
      "Earn 20% commission on every new buyer & seller referral",
      "Access to early beta product launches"
    ]
  },
  {
    tier: "Pro Influencer",
    audience: "50k – 250k Followers",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
    perks: [
      "Sponsored integration deals (YouTube, TikTok, Instagram)",
      "Dedicated Creator Success Manager",
      "Custom co-branded landing page with your profile & top gigs",
      "$1,000 monthly project budget grants"
    ]
  },
  {
    tier: "Workvence Ambassador",
    audience: "250k+ Followers",
    badge: "bg-amber-50 text-amber-700 border border-amber-200 font-extrabold",
    perks: [
      "Long-term annual retainer sponsorships & keynote invites",
      "VIP VIP concierge team for bespoke custom content",
      "Executive advisory council membership",
      "Unlimited platform production credits"
    ]
  }
];

export default function InfluencersPage() {
  const [isApplying, setIsApplying] = useState(false);
  const [influencerForm, setInfluencerForm] = useState({
    name: "",
    email: "",
    platform: "YouTube",
    handle: "",
    followerCount: "5k-50k",
    niche: "Tech & Coding",
    notes: ""
  });

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!influencerForm.name || !influencerForm.email || !influencerForm.handle) {
      toast.error("Please fill in the required fields.");
      return;
    }
    toast.success("Creator application received! Our partnerships team will review your channel within 48 hours.");
    setIsApplying(false);
    setInfluencerForm({
      name: "",
      email: "",
      platform: "YouTube",
      handle: "",
      followerCount: "5k-50k",
      niche: "Tech & Coding",
      notes: ""
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Creator & Influencer Program</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Monetize Your Influence & <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Inspire Global Creators</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Partner with the fastest-growing freelance marketplace. Get sponsored integrations, earn competitive affiliate commissions, and receive free project credits.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsApplying(true)}
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Apply as a Creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#tiers"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                View Program Tiers
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Program Tiers Grid */}
      <section id="tiers" className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Creator Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Tailored Rewards for Every Audience Size
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Whether you're building a niche tech audience or running a massive YouTube channel, we have a tier for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creatorTiers.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200/90 rounded-3xl p-8 shadow-xs hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${t.badge}`}>
                    {t.tier}
                  </span>
                  <div className="text-xl font-bold text-[#0f172a]">{t.audience}</div>
                  
                  <div className="space-y-2.5 pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                      Creator Perks:
                    </span>
                    {t.perks.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsApplying(true)}
                  className="w-full py-3 rounded-xl bg-gray-50 hover:bg-[#327C73] hover:text-white text-[#0f172a] font-semibold text-xs border border-gray-200 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply for {t.tier}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsApplying(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-xl font-bold text-[#0f172a]">Apply to Creator Program</h3>
              <p className="text-xs text-gray-500">Connect with the Workvence sponsorship team.</p>
            </div>

            <form onSubmit={handleCreatorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={influencerForm.name}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, name: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={influencerForm.email}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, email: e.target.value })}
                    placeholder="maya@creators.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Platform</label>
                  <select
                    value={influencerForm.platform}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter/X">Twitter / X</option>
                    <option value="Podcast">Podcast / Newsletter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Channel / Profile Handle *</label>
                  <input
                    type="text"
                    required
                    value={influencerForm.handle}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, handle: e.target.value })}
                    placeholder="@maya_creates or link"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Audience Size</label>
                  <select
                    value={influencerForm.followerCount}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, followerCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="5k-50k">5k - 50k Followers</option>
                    <option value="50k-250k">50k - 250k Followers</option>
                    <option value="250k+">250k+ Followers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Content Niche</label>
                  <select
                    value={influencerForm.niche}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, niche: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="Tech & Coding">Tech & Coding</option>
                    <option value="Design & 3D">Design & 3D</option>
                    <option value="Business & Startups">Business & Startups</option>
                    <option value="Video & Content Creation">Video & Content Creation</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Audience Overview / Notes</label>
                <textarea
                  rows={3}
                  value={influencerForm.notes}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, notes: e.target.value })}
                  placeholder="Tell us about your audience demographics and previous brand partnerships..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Creator Application</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
