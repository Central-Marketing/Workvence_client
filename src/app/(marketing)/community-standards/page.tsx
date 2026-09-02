"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Users,
  Sparkles,
  ArrowRight,
  Lock,
  Mail
} from "lucide-react";

const standards = [
  {
    title: "1. Authentic Identity & Profile Representation",
    do: "Provide genuine portfolios, authentic credentials, accurate identity verification (KYC), and truthful representation of your skills and team capacity.",
    dont: "Create fake accounts, misrepresent your location, use deceptive portfolio samples, or share account credentials with third parties."
  },
  {
    title: "2. Safe Payments & No Off-Platform Transactions",
    do: "Conduct all project discussions, milestone funding, file deliveries, and financial payouts exclusively through the Workvence platform.",
    dont: "Request or accept direct wire transfers, PayPal, crypto, or external payments outside Workvence. Off-platform transactions void all escrow and dispute protection."
  },
  {
    title: "3. Review & Feedback Integrity",
    do: "Leave honest, constructive, and factual reviews after completing real, paid project orders.",
    dont: "Exchange fake reviews, solicit artificial ratings from friends, or threaten bad feedback to coerce refunds or extra unpaid work."
  },
  {
    title: "4. Professional Respect & Zero Discrimination",
    do: "Communicate respectfully, honor agreed project deadlines, maintain professional boundaries, and celebrate diverse global backgrounds.",
    dont: "Engage in hate speech, discrimination, harassment, abusive language, or unsolicited commercial spam."
  },
  {
    title: "5. Intellectual Property & Originality",
    do: "Deliver original creative work or properly licensed assets with full commercial rights transferred to the buyer.",
    dont: "Submit pirated code, unauthorized third-party templates, copyrighted media without licenses, or plagiarized copy."
  }
];

export default function CommunityStandardsPage() {
  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Scale className="w-4 h-4 text-[#10b981]" />
              <span>Platform Integrity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Workvence Community Standards
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Our standards govern interactions across the marketplace to ensure a safe, fair, professional, and trustworthy environment for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Standards List Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-10">
          {standards.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 space-y-6 shadow-xs"
            >
              <h3 className="text-xl font-bold text-[#0f172a]">{s.title}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>What We Encourage (Do)</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-normal">{s.do}</p>
                </div>

                <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Strictly Prohibited (Don't)</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed font-normal">{s.dont}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Violations & Enforcement Box */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-4">
            <h3 className="text-xl font-bold text-[#0f172a]">Enforcement & Reporting</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Workvence employs continuous AI risk monitoring, KYC verification, and a dedicated 24/7 trust operations team. Violations of these standards may result in warnings, gig removal, escrow hold, or permanent account termination.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/support"
                className="px-6 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Report a Violation / Contact Trust Operations
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
