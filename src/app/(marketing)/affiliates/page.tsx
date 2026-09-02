"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Gift,
  MousePointerClick,
  ShieldCheck,
  Send,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const commissionTiers = [
  {
    plan: "Standard Marketplace Orders",
    commission: "Up to 30%",
    type: "First-time Buyer Purchase",
    desc: "Earn a high-converting 30% commission on any service package booked by your referred buyer (up to $150 per order)."
  },
  {
    plan: "Workvence Pro & Select",
    commission: "$100 CPA",
    type: "Flat Bounty Per Qualified Sign-Up",
    desc: "Earn a guaranteed $100 payout when your business referrals upgrade to Workvence Pro or Select membership."
  },
  {
    plan: "Workvence Workspace Subscriptions",
    commission: "50% Recurring",
    type: "First 12 Months",
    desc: "Earn 50% recurring revenue share on all paid freelancer workspace tools and invoice management subscriptions."
  }
];

export default function AffiliatesPage() {
  const [referredUsers, setReferredUsers] = useState(25);
  const [avgOrderValue, setAvgOrderValue] = useState(120);
  const [isJoining, setIsJoining] = useState(false);
  const [affiliateForm, setAffiliateForm] = useState({
    name: "",
    email: "",
    website: "",
    trafficSource: "Blog / Content Site",
    payoutMethod: "PayPal / Bank"
  });

  const estimatedMonthlyCommission = Math.round(referredUsers * (avgOrderValue * 0.25));
  const estimatedAnnualCommission = estimatedMonthlyCommission * 12;

  const handleAffiliateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateForm.name || !affiliateForm.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success("Affiliate application approved! Your tracking dashboard credentials have been sent via email.");
    setIsJoining(false);
    setAffiliateForm({
      name: "",
      email: "",
      website: "",
      trafficSource: "Blog / Content Site",
      payoutMethod: "PayPal / Bank"
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Percent className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Affiliate Program</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Earn Up to 30% on <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Every Qualified Referral</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Monetize your website traffic, newsletters, or social channels by promoting the world's most trusted freelance marketplace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsJoining(true)}
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Join Affiliate Program Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#calculator"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Calculate Potential Earnings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works 3 Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              How the Affiliate Program Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-7 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Join & Get Your Link</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sign up in under 2 minutes. Get custom tracking links and high-converting marketing banners.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-7 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Promote Workvence</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Share packages, categories, or guides on your blog, social media, videos, or email lists.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-7 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Earn Monthly Payouts</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get paid on the 1st of every month directly to your bank account or PayPal with 30-day tracking cookies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Tiers Grid */}
      <section className="py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Commission Rates</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Transparent Payout Structure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commissionTiers.map((tier, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-3xl font-extrabold text-[#327C73]">{tier.commission}</div>
                  <h3 className="text-lg font-bold text-[#0f172a]">{tier.plan}</h3>
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                    {tier.type}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">{tier.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section id="calculator" className="py-20 bg-[#0f172a] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#6ad724] uppercase tracking-wider">
                Affiliate Revenue Calculator
              </span>
              <h2 className="text-3xl font-bold text-white">Estimate Your Monthly Earnings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2">
                    <span>Referred Customers / Month</span>
                    <span className="text-[#6ad724] font-bold text-sm">{referredUsers} buyers</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    step={5}
                    value={referredUsers}
                    onChange={(e) => setReferredUsers(Number(e.target.value))}
                    className="w-full accent-[#10b981] h-2 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>5</span>
                    <span>100</span>
                    <span>200+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2">
                    <span>Average First-Order Size</span>
                    <span className="text-[#6ad724] font-bold text-sm">${avgOrderValue}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                    className="w-full accent-[#10b981] h-2 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>$50</span>
                    <span>$250</span>
                    <span>$500+</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                    Estimated Monthly Commission
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#6ad724]">
                    ${estimatedMonthlyCommission.toLocaleString()}
                  </div>
                  <span className="text-xs text-gray-400 block">
                    ~ ${estimatedAnnualCommission.toLocaleString()} / year
                  </span>
                </div>

                <button
                  onClick={() => setIsJoining(true)}
                  className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Your Affiliate Link</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Signup Modal */}
      {isJoining && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsJoining(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-xl font-bold text-[#0f172a]">Join Workvence Affiliates</h3>
              <p className="text-xs text-gray-500">Instant approval for active creators and marketers.</p>
            </div>

            <form onSubmit={handleAffiliateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={affiliateForm.name}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
                    placeholder="e.g. Samuel Green"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={affiliateForm.email}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, email: e.target.value })}
                    placeholder="sam@affiliate.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Website / Social URL</label>
                <input
                  type="url"
                  value={affiliateForm.website}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, website: e.target.value })}
                  placeholder="https://yourblog.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Traffic Source</label>
                  <select
                    value={affiliateForm.trafficSource}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, trafficSource: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="Blog / Content Site">Blog / Content Site</option>
                    <option value="YouTube / Video">YouTube / Video</option>
                    <option value="Newsletter">Email Newsletter</option>
                    <option value="Social Media">Social Media (Twitter/IG)</option>
                    <option value="Paid Ads / PPC">Paid Search / Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payout Method</label>
                  <select
                    value={affiliateForm.payoutMethod}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, payoutMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="PayPal / Bank">Direct Bank / PayPal</option>
                    <option value="Stripe Connect">Stripe Connect</option>
                    <option value="Wire Transfer">International Wire</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Create Affiliate Account</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
