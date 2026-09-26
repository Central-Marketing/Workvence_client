import React from "react";
import type { Metadata } from "next";
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
  TrendingUp,
  CreditCard,
  MessageSquare,
  Package
} from "lucide-react";
import EarningsCalculator from "./EarningsCalculator";
import HowToSellFaq from "./HowToSellFaq";

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

export const metadata: Metadata = {
  title: "How to Sell | Workvence Seller Growth Guide & Escrow Payouts",
  description: "Turn your skills into a thriving business on Workvence. Set your own prices, work globally, and get paid with guaranteed escrow protection.",
};

export default function HowToSellPage() {

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-[rgba(0,0,0,0.10)] py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#0D6D5F]" />
              <span>Seller Growth Guide</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#0f172a] leading-tight">
              Turn Your Expertise Into a <br className="hidden sm:inline" />
              <span className="text-[#0D6D5F]">Thriving Global Business</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Work with clients from over 180 countries. Set your own prices, work on your own schedule, and get paid with guaranteed escrow protection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/become-a-seller"
                className="px-6 h-10 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Start Selling Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#calculator"
                className="px-6 h-10 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] hover:bg-gray-50 text-[#0f172a] font-semibold text-xs sm:text-sm transition inline-flex items-center justify-center cursor-pointer"
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
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">How It Works</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Your 4-Step Path to Success
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Simple, transparent, and built from the ground up for independent professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200 relative">
              <div className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base shrink-0">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Create Your Package</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Showcase your skills with clear pricing tiers, turnaround times, portfolio samples, and gig add-ons.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200 relative">
              <div className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base shrink-0">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Receive Orders</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Clients find your package and fund the project in escrow. You get instant notification to start work.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200 relative">
              <div className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base shrink-0">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Deliver Quality Work</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Communicate directly via real-time chat, share progress files, and submit completed deliverables.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200 relative">
              <div className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-extrabold flex items-center justify-center text-base shrink-0">
                4
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Get Paid Instantly</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Escrow funds are deposited into your account upon client approval. Withdraw anytime to your bank or card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <EarningsCalculator />

      {/* Seller Levels Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Progression</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Seller Levels & Recognition
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              The more quality work you deliver, the more perks, visibility, and enterprise clients you unlock.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellerLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200"
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${lvl.badgeColor}`}>
                  {lvl.level}
                </span>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Requirement:</span>
                  <p className="text-xs font-medium text-gray-800">{lvl.req}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-[rgba(0,0,0,0.06)]">
                  <span className="text-[11px] font-bold text-[#0D6D5F] uppercase tracking-wider">Perks:</span>
                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{lvl.perks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller FAQ */}
      <section className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-[#f8fafc] border-t border-[rgba(0,0,0,0.10)]">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Questions & Answers</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Everything you need to know about starting your seller journey.
            </p>
          </div>

          <HowToSellFaq faqs={faqs} />
        </div>
      </section>
    </div>
  );
}
