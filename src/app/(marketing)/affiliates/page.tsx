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
  X,
  ChevronDown,
  Layers,
  BarChart3,
  Link2,
  HelpCircle,
  Briefcase,
  Users,
  Wallet,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";
import toast from "react-hot-toast";

const TRAFFIC_SOURCE_OPTIONS: CustomSelectOption[] = [
  { value: "Blog / Content Site", label: "Blog / Content Site" },
  { value: "YouTube / Video", label: "YouTube / Video" },
  { value: "Newsletter", label: "Email Newsletter" },
  { value: "Social Media", label: "Social Media (Twitter/IG/LinkedIn)" },
  { value: "Paid Ads / PPC", label: "Paid Search / Ads" },
];

const PAYOUT_METHOD_OPTIONS: CustomSelectOption[] = [
  { value: "PayPal / Bank", label: "Direct Bank / PayPal" },
  { value: "Stripe Connect", label: "Stripe Connect" },
  { value: "Wire Transfer", label: "International Wire" },
];

const commissionTiers = [
  {
    plan: "Standard Marketplace Orders",
    commission: "Up to 30%",
    type: "First-Time Buyer Purchase",
    desc: "Earn a high-converting 30% commission on any service package booked by your referred buyer (up to $150 per order).",
    highlight: "Most Popular",
    features: [
      "Applies to 500+ service categories",
      "Immediate tracking via 30-day cookie",
      "Dynamic conversion attribution"
    ]
  },
  {
    plan: "Workvence Pro & Select",
    commission: "$100 CPA",
    type: "Flat Bounty Per Qualified Sign-Up",
    desc: "Earn a guaranteed $100 payout when your business referrals upgrade to Workvence Pro or Select verified membership.",
    highlight: "High Ticket",
    features: [
      "Top 1% vetted freelance talent",
      "Higher enterprise transaction volume",
      "Dedicated account management"
    ]
  },
  {
    plan: "Workspace & Invoicing Tools",
    commission: "50% Recurring",
    type: "First 12 Months RevShare",
    desc: "Earn 50% recurring revenue share on all paid freelancer workspace tools, invoice management, and premium contracts.",
    highlight: "Recurring Income",
    features: [
      "Passive monthly subscription revenue",
      "High freelancer retention rates",
      "Compounded annual yield"
    ]
  }
];

const promotionProducts = [
  {
    icon: Briefcase,
    title: "Workvence Marketplace",
    category: "Services & Gigs",
    desc: "Promote digital services across design, web development, copywriting, video, and AI engineering.",
    reward: "Up to 30% CPA"
  },
  {
    icon: ShieldCheck,
    title: "Workvence Pro",
    category: "Enterprise & Business",
    desc: "Refer corporations and agencies seeking rigorously vetted, top-tier freelance experts with verified track records.",
    reward: "$100 Flat Bounty"
  },
  {
    icon: Layers,
    title: "Workvence Workspace",
    category: "Freelance SaaS Suite",
    desc: "Promote proposals, contract escrow, time tracking, and professional invoicing software built for independent talent.",
    reward: "50% Recurring RevShare"
  }
];

const affiliatePerks = [
  {
    icon: BarChart3,
    title: "Real-Time Tracking & Analytics",
    desc: "Monitor your clicks, impressions, conversions, and pending commission balances through an intuitive affiliate portal."
  },
  {
    icon: Clock,
    title: "30-Day Cookie Lifetime",
    desc: "Get full attribution credit even if your referred buyers browse around and complete their purchase up to a month later."
  },
  {
    icon: Link2,
    title: "Creative Assets & Deep Links",
    desc: "Access ready-to-publish display banners, landing pages, category widgets, and custom deep links to individual service packages."
  },
  {
    icon: Wallet,
    title: "Reliable Monthly Settlements",
    desc: "Receive your earnings promptly on the 1st of every month directly to your preferred payout method (PayPal, Stripe Connect, or Wire)."
  }
];

const affiliateFaqs = [
  {
    q: "Who can join the Workvence Affiliate Program?",
    a: "Anyone with an active audience can join! Bloggers, digital creators, agencies, newsletter publishers, educators, and social media influencers are all eligible. Joining is 100% free with instant access to tracking links upon account creation."
  },
  {
    q: "How much can I earn per referred customer?",
    a: "There are no caps on total earnings. For marketplace orders, you earn up to 30% (capped at $150 per order). For Workvence Pro client referrals, you earn a flat $100 CPA bounty. For Workspace tool subscriptions, you earn 50% recurring revenue share for 12 months."
  },
  {
    q: "How does the 30-day tracking cookie work?",
    a: "When a visitor clicks your unique affiliate link, a tracking cookie is stored in their browser for 30 days. If they create an account and place an order within that window, the referral is automatically credited to your affiliate dashboard."
  },
  {
    q: "When and how do I receive my commission payouts?",
    a: "Commissions are distributed on the 1st of each calendar month for all cleared earnings from the previous cycle. The minimum payout threshold is $100, and you can withdraw via PayPal, Stripe Connect, or International Wire Transfer."
  },
  {
    q: "Can I promote individual categories or specific gigs?",
    a: "Yes! Your affiliate dashboard includes an intuitive deep-link generator that allows you to direct traffic to specific service categories (e.g. Logo Design, Next.js Development, AI Prompting) or directly to a top seller's package."
  },
  {
    q: "Are there any fees or hidden costs to participate?",
    a: "No. The Workvence Affiliate Program is completely free to join and will always remain free. There are no registration fees, platform charges, or maintenance costs."
  }
];

export default function AffiliatesPage() {
  const [referredUsers, setReferredUsers] = useState(25);
  const [avgOrderValue, setAvgOrderValue] = useState(120);
  const [isJoining, setIsJoining] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
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
    <div className="min-h-screen bg-white text-[#112131] font-sans antialiased">
      {/* 1. TOP HERO BANNER (Affiliate-Specific Banner & Centered Content) */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="Workvence Affiliates Banner"
          className="relative w-full rounded-[6px] py-14 sm:py-20 md:py-24 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/affilite.png')" }}
        >
          {/* Subtle ambient overlay */}
          <div className="absolute inset-0 bg-[#0c1c1b]/55 backdrop-blur-[0.5px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.12]">
              Boost Your Earnings with the <br className="hidden sm:inline" />
              <span className="text-[#6AD724]">World&apos;s Top Marketplace</span>
            </h1>

            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Promote the world&apos;s most trusted freelance platform. Turn your audience into recurring revenue with up to 30% commission, $100 CPA bounties, and 30-day tracking cookies.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                type="button"
                onClick={() => setIsJoining(true)}
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs gap-2 cursor-pointer"
              >
                <span>Become an Affiliate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#commissions"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white hover:bg-gray-100 text-[#0f172a] font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                View Commission Plans
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* 2. TRUST & PERFORMANCE METRICS BAR */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-[6px] bg-[#f8fafc] border border-[rgba(0,0,0,0.10)] text-left space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D6D5F]">Up to 30%</div>
              <div className="text-xs font-semibold text-[#0f172a]">Marketplace CPA</div>
              <p className="text-[11px] text-gray-500">First-time buyer order payout</p>
            </div>
            <div className="p-5 rounded-[6px] bg-[#f8fafc] border border-[rgba(0,0,0,0.10)] text-left space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D6D5F]">30 Days</div>
              <div className="text-xs font-semibold text-[#0f172a]">Cookie Duration</div>
              <p className="text-[11px] text-gray-500">Attribution tracking window</p>
            </div>
            <div className="p-5 rounded-[6px] bg-[#f8fafc] border border-[rgba(0,0,0,0.10)] text-left space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D6D5F]">$100 Flat</div>
              <div className="text-xs font-semibold text-[#0f172a]">Pro & Enterprise</div>
              <p className="text-[11px] text-gray-500">High-ticket client bounty</p>
            </div>
            <div className="p-5 rounded-[6px] bg-[#f8fafc] border border-[rgba(0,0,0,0.10)] text-left space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D6D5F]">Monthly</div>
              <div className="text-xs font-semibold text-[#0f172a]">Guaranteed Payouts</div>
              <p className="text-[11px] text-gray-500">PayPal, Stripe, or Bank Wire</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS 3-STEP JOURNEY */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              How the Workvence Affiliate Program Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Start earning in 3 simple steps with complete tracking and conversion support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 space-y-4 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200">
              <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Join for Free</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                Sign up in under 2 minutes. Receive instant access to your dedicated affiliate dashboard, custom tracking links, and high-converting marketing creatives.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 space-y-4 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200">
              <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Promote Workvence</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                Share packages, categories, or deep links with your audience on your blog, YouTube channel, social media, podcast, or email newsletter.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 space-y-4 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200">
              <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Earn Monthly Payouts</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                Get paid on the 1st of every month with full transparency. Benefit from 30-day tracking cookies so you get credited for every qualified purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT YOU CAN PROMOTE (Diverse Offerings) */}
      <section className="py-16 sm:py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Diverse Offerings</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              What You Can Promote
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Multiple high-converting products tailored to different audiences and buyer personas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {promotionProducts.map((prod, idx) => {
              const Icon = prod.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#0D6D5F]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#0D6D5F] uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="text-xl font-bold text-[#0f172a] mt-1">{prod.title}</h3>
                    </div>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                      {prod.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Commission Rate:</span>
                    <span className="text-xs font-bold text-[#0D6D5F] bg-white border border-[rgba(0,0,0,0.10)] px-2.5 py-1 rounded-[6px]">
                      {prod.reward}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. COMMISSION TIERS & PAYOUT STRUCTURE */}
      <section id="commissions" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Commission Plans</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Transparent Payout Structure
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Clear tiers with no earnings caps. The more qualified traffic you send, the more you earn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {commissionTiers.map((tier, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-8 shadow-xs hover:border-[#0D6D5F] transition duration-200 space-y-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-white border border-[rgba(0,0,0,0.10)] text-[#0D6D5F]">
                      {tier.highlight}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500">{tier.type}</span>
                  </div>

                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#0D6D5F] tracking-tight">
                      {tier.commission}
                    </div>
                    <h3 className="text-lg font-bold text-[#0f172a] mt-2">{tier.plan}</h3>
                  </div>

                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">{tier.desc}</p>

                  <div className="pt-3 space-y-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                      Plan Highlights
                    </span>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setIsJoining(true)}
                  variant="outline"
                  size="md"
                  radius="fiverr"
                  fullWidth
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="bg-gray-50 hover:bg-[#0D6D5F] hover:text-white text-[#0f172a] font-semibold text-xs border-[rgba(0,0,0,0.10)]"
                >
                  Apply for this Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE REVENUE CALCULATOR (Workvence Clean Card Theme) */}
      <section id="calculator" className="py-16 sm:py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-8 sm:p-12 shadow-xs space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
                Affiliate Revenue Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a]">
                Estimate Your Monthly Earnings
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
                Adjust the sliders below to project your commission potential based on average volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Referred First-Time Buyers / Month</span>
                    <span className="text-[#0D6D5F] font-bold text-sm">{referredUsers} buyers</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    step={5}
                    value={referredUsers}
                    onChange={(e) => setReferredUsers(Number(e.target.value))}
                    className="w-full accent-[#0D6D5F] h-2 bg-gray-200 rounded-[6px] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>5</span>
                    <span>100</span>
                    <span>200+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Average First-Order Basket Value</span>
                    <span className="text-[#0D6D5F] font-bold text-sm">${avgOrderValue}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                    className="w-full accent-[#0D6D5F] h-2 bg-gray-200 rounded-[6px] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>$50</span>
                    <span>$250</span>
                    <span>$500+</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fafc] border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Estimated Monthly Commission
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#0D6D5F]">
                    ${estimatedMonthlyCommission.toLocaleString()}
                  </div>
                  <span className="text-xs text-gray-500 block">
                    ~ ${estimatedAnnualCommission.toLocaleString()} projected / year
                  </span>
                </div>

                <Button
                  onClick={() => setIsJoining(true)}
                  variant="brand"
                  size="md"
                  radius="fiverr"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="font-semibold shadow-md bg-[#0D6D5F] hover:bg-[#0b5c50] text-white"
                >
                  Get Your Affiliate Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY PARTNER WITH WORKVENCE (Affiliate Toolkit & Perks) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Program Benefits</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Why Partner with Workvence?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              We provide everything you need to successfully promote and monetize your platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {affiliatePerks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 text-left space-y-3 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200"
                >
                  <div className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#0D6D5F]">
                    <Icon className="w-5 h-5 text-[#0D6D5F]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a]">{perk.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS (Accordion) */}
      <section className="py-16 sm:py-20 bg-[#f8fafc] border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">FAQ</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Find answers to common questions about tracking, commissions, and affiliate payouts.
            </p>
          </div>

          <div className="space-y-3.5 max-w-3xl mx-auto">
            {affiliateFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-[6px] transition-colors duration-200 overflow-hidden ${isOpen
                    ? "bg-white border-[#0D6D5F]/40 shadow-xs"
                    : "bg-white hover:bg-white border-[rgba(0,0,0,0.10)]"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-sm sm:text-base text-[#0f172a]">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen
                        ? "bg-[#0D6D5F]/10 text-[#0D6D5F] rotate-180"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CTA BANNER (Workvence Standard Left Aligned) */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-16 pb-[80px] min-[1400px]:pb-[100px]">
        <section
          aria-label="Ready to Monetize with Workvence"
          className="relative w-full rounded-[6px] py-14 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 text-left flex flex-col items-start justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/AFreelancerBG.png')" }}
        >
          <div className="absolute inset-0 bg-[#0c1c1b]/55 backdrop-blur-[1px]" />
          <div className="relative z-10 max-w-2xl flex flex-col items-start text-left space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white leading-tight">
              Ready to Turn Traffic into Revenue?
            </h2>
            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-xl leading-relaxed">
              Join thousands of creators, bloggers, agencies, and educators earning passive commissions with Workvence.
            </p>
            <div className="flex flex-wrap items-center justify-start gap-3 pt-2">
              <Button
                onClick={() => setIsJoining(true)}
                variant="brand"
                size="md"
                radius="fiverr"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-semibold text-sm shadow-md hover:shadow-lg bg-[#0D6D5F] hover:bg-[#0b5c50] text-white"
              >
                Become an Affiliate Free
              </Button>
              <a
                href="#calculator"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition backdrop-blur-xs"
              >
                Calculate Potential Earnings
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* 10. AFFILIATE SIGNUP MODAL */}
      {isJoining && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[6px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <Button
              onClick={() => setIsJoining(false)}
              variant="soft"
              size="icon"
              radius="full"
              className="absolute top-5 right-5 w-8 h-8 text-gray-600 hover:text-black"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="space-y-1 mb-5">
              <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
                Instant Registration
              </span>
              <h3 className="text-xl font-bold text-[#0f172a]">Join the Workvence Affiliate Program</h3>
              <p className="text-xs text-gray-500">
                Start sharing links and earning up to 30% commission immediately.
              </p>
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
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Website or Primary Channel URL</label>
                <input
                  type="url"
                  value={affiliateForm.website}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, website: e.target.value })}
                  placeholder="https://yourblog.com or https://youtube.com/@channel"
                  className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Traffic Source</label>
                  <CustomSelect
                    size="md"
                    options={TRAFFIC_SOURCE_OPTIONS}
                    value={affiliateForm.trafficSource}
                    onChange={(val) => setAffiliateForm({ ...affiliateForm, trafficSource: String(val) })}
                    placeholder="Select traffic source"
                    ariaLabel="Traffic Source"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payout Method</label>
                  <CustomSelect
                    size="md"
                    options={PAYOUT_METHOD_OPTIONS}
                    value={affiliateForm.payoutMethod}
                    onChange={(val) => setAffiliateForm({ ...affiliateForm, payoutMethod: String(val) })}
                    placeholder="Select payout method"
                    ariaLabel="Payout Method"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="md"
                radius="fiverr"
                fullWidth
                leftIcon={<Send className="w-4 h-4" />}
                className="font-semibold shadow-md mt-2 bg-[#0D6D5F] hover:bg-[#0b5c50] text-white"
              >
                Create Affiliate Account
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
