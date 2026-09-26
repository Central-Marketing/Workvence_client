"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CustomSelect, CustomSelectOption } from "@/components/ui";
import {
  Sparkles,
  ArrowRight,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Users,
  Globe2,
  TrendingUp,
  Star,
  Zap,
  CreditCard
} from "lucide-react";

const CATEGORY_OPTIONS: CustomSelectOption[] = [
  { value: "Web & Mobile Development", label: "Web & Mobile Development" },
  { value: "UI/UX & Brand Design", label: "UI/UX & Brand Design" },
  { value: "AI & Machine Learning", label: "AI & Machine Learning" },
  { value: "Video & 3D Animation", label: "Video & 3D Animation" },
  { value: "Digital Marketing & SEO", label: "Digital Marketing & SEO" },
];

export default function BecomeASellerPage() {
  const [selectedSkill, setSelectedSkill] = useState("Web & Mobile Development");
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(65);

  const estimatedMonthly = Math.round(hoursPerWeek * 4 * hourlyRate * 0.9);

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* 1. Hero Banner Card */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="Become a Seller Banner"
          className="relative w-full rounded-[6px] py-16 sm:py-20 md:py-24 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#013571] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/BecomeASeller.png')" }}
        >
          {/* Subtle dark overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-[#011e40]/30 backdrop-blur-[0.5px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-tight">
              Work on Your Terms. <br className="hidden sm:inline" />
              <span className="text-[#6AD724]">Earn What You&apos;re Worth.</span>
            </h1>
            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
              Connect with high-paying businesses worldwide. Create pre-priced packages, get paid securely with escrow, and scale your freelance career.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/register"
                className="px-6 h-10 inline-flex justify-center items-center rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs gap-2 cursor-pointer"
              >
                <span>Become a Seller Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#calculator"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white hover:bg-gray-100 text-[#0f172a] font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                Estimate Earnings
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Trust Counters */}
      <section className="py-12 bg-[#0f172a] text-white mt-10 sm:mt-14 md:mt-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-[#10b981]">A Gig Sold</div>
              <div className="text-xs text-gray-400 mt-1">Every 4 Seconds</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#10b981]">$180M+</div>
              <div className="text-xs text-gray-400 mt-1">Paid to Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#10b981]">180+</div>
              <div className="text-xs text-gray-400 mt-1">Countries Supported</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#10b981]">100%</div>
              <div className="text-xs text-gray-400 mt-1">Escrow Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Simple Onboarding</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              How Selling Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              From account setup to your first direct payout in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200 space-y-4">
              <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-bold text-lg flex items-center justify-center shrink-0">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Create a Free Package</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Sign up, set your prices across 3 transparent tiers (Basic, Standard, Premium), and list your portfolio samples.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200 space-y-4">
              <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-bold text-lg flex items-center justify-center shrink-0">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Deliver Great Work</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Get notified when clients fund your order in escrow. Chat directly, submit files, and gather 5-star ratings.
              </p>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200 space-y-4">
              <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] font-bold text-lg flex items-center justify-center shrink-0">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">Get Paid On Time</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Funds are released upon client approval. Withdraw directly to Bank Transfer, Stripe, PayPal, or Payoneer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Estimator */}
      <section id="calculator" className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-[#f8fafc] border-y border-[rgba(0,0,0,0.10)]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-8 sm:p-12 shadow-xs space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
                Earning Potential
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">How Much Can You Make?</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Estimate your potential freelance earnings based on your rate and schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Your Category</label>
                  <CustomSelect
                    value={selectedSkill}
                    onChange={setSelectedSkill}
                    options={CATEGORY_OPTIONS}
                    size="md"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Hourly Rate / Project Equivalent</span>
                    <span className="text-[#0D6D5F] font-bold text-sm">${hourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={200}
                    step={5}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-[#0D6D5F] h-2 bg-gray-200 rounded-[6px] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Hours per Week</span>
                    <span className="text-[#0D6D5F] font-bold text-sm">{hoursPerWeek} hrs</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    step={5}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-[#0D6D5F] h-2 bg-gray-200 rounded-[6px] cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-[#0f172a] text-white rounded-[6px] p-8 text-center space-y-4 border border-[rgba(0,0,0,0.10)]">
                <span className="text-xs text-gray-300 uppercase tracking-wider font-semibold block">
                  Estimated Monthly Income
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#10b981]">
                  ${estimatedMonthly.toLocaleString()}
                </div>
                <span className="text-xs text-gray-400 block">
                  ~ ${(estimatedMonthly * 12).toLocaleString()} per year
                </span>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs shadow-xs transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Start Selling Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
