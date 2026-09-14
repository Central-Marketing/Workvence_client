"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gem,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Headphones,
  CreditCard,
  Sparkles,
  ArrowRight,
  Send,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const comparison = [
  { feature: "Buyer Processing Fee", standard: "Standard Fee", select: "0% Fee (Save Thousands)" },
  { feature: "Dedicated Talent Concierge", standard: "Self-Serve", select: "Personal 1-on-1 Concierge" },
  { feature: "Talent Matching Speed", standard: "Standard Search", select: "Curated in Under 2 Hours" },
  { feature: "Dispute Priority Level", standard: "Standard Queue", select: "Top Priority 24/7 SLA" },
  { feature: "Custom Master Service Agreement", standard: "Platform Terms", select: "Custom Enterprise MSAs & NDAs" },
  { feature: "Consolidated Invoicing", standard: "Per-Order Card", select: "Monthly Corporate Invoicing" }
];

export default function WorkvenceSelectPage() {
  const [isJoining, setIsJoining] = useState(false);
  const [selectForm, setSelectForm] = useState({ name: "", email: "", company: "", spend: "$5k-$20k/month" });

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectForm.name || !selectForm.email) {
      toast.error("Please fill in required fields.");
      return;
    }
    toast.success("Welcome to Workvence Select! Your VIP Concierge will reach out within 1 business hour.");
    setIsJoining(false);
    setSelectForm({ name: "", email: "", company: "", spend: "$5k-$20k/month" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0f172a] via-[#112131] to-[#0f172a] text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0db890]/10 border border-[#0db890]/20 text-[#0db890] text-xs font-semibold">
              <Gem className="w-4 h-4 text-[#0db890]" />
              <span>Workvence Select • VIP Buyer Membership</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Scale Your Projects with <br className="hidden sm:inline" />
              <span className="text-[#0db890]">Zero Fees & VIP Priority</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal">
              Designed for high-growth startups, scaleups, and agencies spending $3,000+ monthly on freelance creative and tech talent.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsJoining(true)}
                className="px-8 py-4 rounded-xl bg-brand-green hover:bg-[#024939] text-[#ffffff] font-bold text-sm transition shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Join Workvence Select</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">Membership Comparison</span>
            <h2 className="text-3xl font-bold text-[#0f172a]">Why Leading Teams Upgrade to Select</h2>
          </div>

          <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-12 bg-gray-100 p-4 sm:p-5 text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <div className="col-span-6 sm:col-span-6">Benefit / Feature</div>
              <div className="col-span-3 sm:col-span-3 text-center text-gray-500">Standard Buyer</div>
              <div className="col-span-3 sm:col-span-3 text-center text-[#327C73]">Select Member</div>
            </div>

            <div className="divide-y divide-gray-200">
              {comparison.map((row, i) => (
                <div key={i} className="grid grid-cols-12 p-4 sm:p-5 text-xs items-center">
                  <div className="col-span-6 font-semibold text-gray-900">{row.feature}</div>
                  <div className="col-span-3 text-center text-gray-500">{row.standard}</div>
                  <div className="col-span-3 text-center font-bold text-[#327C73] flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span>{row.select}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Select Modal */}
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
              <h3 className="text-xl font-bold text-[#0f172a]">Join Workvence Select</h3>
              <p className="text-xs text-gray-500">Get your 0% fee VIP membership activated.</p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={selectForm.name}
                    onChange={(e) => setSelectForm({ ...selectForm, name: e.target.value })}
                    placeholder="e.g. David Vance"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={selectForm.email}
                    onChange={(e) => setSelectForm({ ...selectForm, email: e.target.value })}
                    placeholder="david@company.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Monthly Project Spend</label>
                <select
                  value={selectForm.spend}
                  onChange={(e) => setSelectForm({ ...selectForm, spend: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                >
                  <option value="$3k-$5k/month">$3,000 - $5,000 / month</option>
                  <option value="$5k-$20k/month">$5,000 - $20,000 / month</option>
                  <option value="$20k+/month">$20,000+ / month</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Activate VIP Membership</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
