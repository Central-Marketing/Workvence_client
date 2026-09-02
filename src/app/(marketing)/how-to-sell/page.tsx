"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Zap,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Package
} from "lucide-react";

const sellerLevels = [
  {
    level: "New Seller",
    badgeColor: "bg-gray-100 text-gray-700",
    req: "Register & complete profile KYC verification",
    perks: "List up to 5 active packages, 24/7 standard support, fast escrow payouts"
  },
  {
    level: "Level 1 Seller",
    badgeColor: "bg-blue-50 text-blue-700 border border-blue-200",
    req: "Complete 10+ orders with a 4.7+ average rating",
    perks: "List up to 10 packages, priority search placement, custom milestone billing"
  },
  {
    level: "Level 2 Seller",
    badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    req: "Complete 50+ orders with $2,000+ earnings and 4.8+ rating",
    perks: "List up to 20 packages, VIP buyer matching, access to customer success manager"
  },
  {
    level: "Top Rated Seller",
    badgeColor: "bg-amber-50 text-amber-700 border border-amber-200 font-bold",
    req: "Hand-vetted by editorial team, exceptional track record",
    perks: "Unlimited packages, Workvence Pro badge, custom enterprise contracts, 0% delay payouts"
  }
];

const faqs = [
  {
    q: "How much does it cost to start selling on Workvence?",
    a: "Signing up, creating a seller profile, and listing packages is 100% free. Workvence only takes a competitive platform fee when you successfully complete an order and earn money."
  },
  {
    q: "How and when do I get paid?",
    a: "Once the buyer reviews and approves your deliverable, escrow funds are instantly released to your seller balance. You can withdraw directly to Bank Transfer, Stripe, PayPal, or Payoneer."
  },
  {
    q: "What can I sell on Workvence?",
    a: "You can offer services in hundreds of categories: Web & Mobile Development, AI Prompting, Graphic Design, Video & Animation, Copywriting, Digital Marketing, Audio Engineering, Business Consulting, and more."
  },
  {
    q: "How am I protected against chargebacks and fraudulent buyers?",
    a: "Workvence holds all client funds in secure escrow before you start working. As long as you deliver the agreed work according to the gig terms, your earnings are 100% guaranteed."
  }
];

export default function HowToSellPage() {
  const [selectedCategory, setSelectedCategory] = useState("Programming & Tech");
  const [ratePerProject, setRatePerProject] = useState(150);
  const [projectsPerMonth, setProjectsPerMonth] = useState(6);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const estimatedMonthlyEarnings = ratePerProject * projectsPerMonth * 0.9;
  const estimatedAnnualEarnings = estimatedMonthlyEarnings * 12;

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Seller Growth Guide</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Turn Your Expertise Into a <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Thriving Global Business</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Work with clients from over 180 countries. Set your own prices, work on your own schedule, and get paid with guaranteed escrow protection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/become-a-seller"
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Start Selling Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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

      {/* 4-Step Seller Journey */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Your 4-Step Path to Success
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Simple, transparent, and built from the ground up for independent professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Create Your Package</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Showcase your skills with clear pricing tiers, turnaround times, portfolio samples, and gig add-ons.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Receive Orders</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Clients find your package and fund the project in escrow. You get instant notification to start work.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Deliver Quality Work</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Communicate directly via real-time chat, share progress files, and submit completed deliverables.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] font-extrabold flex items-center justify-center text-base">
                4
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Get Paid Instantly</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Escrow funds are deposited into your account upon client approval. Withdraw anytime to your bank or card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <section id="calculator" className="py-20 bg-[#0f172a] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#6ad724] uppercase tracking-wider">
                Earnings Estimator
              </span>
              <h2 className="text-3xl font-bold text-white">Estimate Your Earning Potential</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Adjust the sliders below to see what you could earn on Workvence based on your rates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2">
                    <span>Average Project / Gig Price</span>
                    <span className="text-[#6ad724] font-bold text-sm">${ratePerProject}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={1000}
                    step={10}
                    value={ratePerProject}
                    onChange={(e) => setRatePerProject(Number(e.target.value))}
                    className="w-full accent-[#10b981] h-2 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>$20</span>
                    <span>$500</span>
                    <span>$1,000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2">
                    <span>Completed Orders / Month</span>
                    <span className="text-[#6ad724] font-bold text-sm">{projectsPerMonth} orders</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={projectsPerMonth}
                    onChange={(e) => setProjectsPerMonth(Number(e.target.value))}
                    className="w-full accent-[#10b981] h-2 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>1</span>
                    <span>15</span>
                    <span>30 orders</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                    Estimated Monthly Take-Home
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#6ad724]">
                    ${Math.round(estimatedMonthlyEarnings).toLocaleString()}
                  </div>
                  <span className="text-xs text-gray-400 block">
                    ~ ${Math.round(estimatedAnnualEarnings).toLocaleString()} / year
                  </span>
                </div>

                <Link
                  href="/become-a-seller"
                  className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs shadow-md transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Your Free Seller Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Levels Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Progression</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Seller Levels & Recognition
            </h2>
            <p className="text-sm text-gray-600">
              The more quality work you deliver, the more perks, visibility, and enterprise clients you unlock.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellerLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4 hover:border-[#327C73] transition"
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${lvl.badgeColor}`}>
                  {lvl.level}
                </span>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Requirement:</span>
                  <p className="text-xs font-medium text-gray-800">{lvl.req}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-[#327C73] uppercase tracking-wider">Perks:</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{lvl.perks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller FAQ */}
      <section className="py-20 bg-[#f8fafc] border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">Questions & Answers</span>
            <h2 className="text-3xl font-bold text-[#0f172a]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#0f172a]">{faq.q}</h4>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180 text-[#327C73]" : ""
                    }`}
                  />
                </div>
                {openFaq === i && (
                  <p className="text-xs text-gray-600 pt-3 mt-3 border-t border-gray-100 leading-relaxed font-normal">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
