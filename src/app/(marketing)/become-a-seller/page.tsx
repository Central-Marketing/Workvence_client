"use client";

import React, { useState } from "react";
import Link from "next/link";
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

export default function BecomeASellerPage() {
  const [selectedSkill, setSelectedSkill] = useState("Web & Mobile Development");
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(65);

  const estimatedMonthly = Math.round(hoursPerWeek * 4 * hourlyRate * 0.9);

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Join 1.5M+ Independent Creators</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Work on Your Terms. <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Earn What You're Worth.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Connect with high-paying businesses worldwide. Create pre-priced packages, get paid securely with escrow, and scale your freelance career.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Become a Seller Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#calculator"
                className="px-8 py-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Estimate Earnings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Counters */}
      <section className="py-12 bg-[#0f172a] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-[#6ad724]">A Gig Sold</div>
              <div className="text-xs text-gray-400 mt-1">Every 4 Seconds</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#10b981]">$180M+</div>
              <div className="text-xs text-gray-400 mt-1">Paid to Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">180+</div>
              <div className="text-xs text-gray-400 mt-1">Countries Supported</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#6ad724]">100%</div>
              <div className="text-xs text-gray-400 mt-1">Escrow Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Simple Onboarding</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              How Selling Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] font-bold text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Create a Free Package</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Sign up, set your prices across 3 transparent tiers (Basic, Standard, Premium), and list your portfolio samples.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] font-bold text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Deliver Great Work</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Get notified when clients fund your order in escrow. Chat directly, submit files, and gather 5-star ratings.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] font-bold text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Get Paid On Time</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Funds are released upon client approval. Withdraw directly to Bank Transfer, Stripe, PayPal, or Payoneer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Estimator */}
      <section id="calculator" className="py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">
                Earning Potential
              </span>
              <h2 className="text-3xl font-bold text-[#0f172a]">How Much Can You Make?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Your Category</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="Web & Mobile Development">Web & Mobile Development</option>
                    <option value="UI/UX & Brand Design">UI/UX & Brand Design</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Video & 3D Animation">Video & 3D Animation</option>
                    <option value="Digital Marketing & SEO">Digital Marketing & SEO</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Hourly Rate / Project Equivalent</span>
                    <span className="text-[#327C73] font-bold text-sm">${hourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={200}
                    step={5}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-[#327C73] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Hours per Week</span>
                    <span className="text-[#327C73] font-bold text-sm">{hoursPerWeek} hrs</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    step={5}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-[#327C73] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-[#0f172a] text-white rounded-2xl p-8 text-center space-y-4">
                <span className="text-xs text-gray-300 uppercase tracking-wider font-semibold block">
                  Estimated Monthly Income
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#6ad724]">
                  ${estimatedMonthly.toLocaleString()}
                </div>
                <span className="text-xs text-gray-400 block">
                  ~ ${(estimatedMonthly * 12).toLocaleString()} per year
                </span>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs shadow-md transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
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
