"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  CreditCard,
  MessageSquare,
  FileCheck,
  Star,
  ChevronDown,
  RefreshCw
} from "lucide-react";

const buyerGuarantees = [
  {
    icon: Lock,
    title: "100% Escrow Payment Protection",
    desc: "Your payment is held safely in escrow. Sellers only get paid when you review, test, and approve the deliverable."
  },
  {
    icon: Star,
    title: "Verified Authentic Reviews",
    desc: "Every rating and review on Workvence comes from verified clients who completed and paid for real orders."
  },
  {
    icon: FileCheck,
    title: "Full Commercial Ownership",
    desc: "You retain 100% intellectual property and commercial copyright rights for all approved project deliverables."
  },
  {
    icon: RefreshCw,
    title: "Fast Dispute Mediation & Refunds",
    desc: "If a seller fails to meet the agreed milestones, our 24/7 customer operations team will mediate and issue a prompt refund."
  }
];

const buyerSteps = [
  {
    step: "01",
    title: "Find the Perfect Freelancer",
    desc: "Browse pre-packaged gigs across design, development, marketing, and AI. Compare seller ratings, delivery times, and transparent pricing tiers."
  },
  {
    step: "02",
    title: "Fund Project via Secure Escrow",
    desc: "Place your order securely via credit card, PayPal, or enterprise invoice. Funds remain safe in escrow until you're completely satisfied."
  },
  {
    step: "03",
    title: "Collaborate in Real-Time",
    desc: "Communicate directly with your freelancer in our workspace, share assets, and review work-in-progress drafts."
  },
  {
    step: "04",
    title: "Approve & Release Payment",
    desc: "Request revisions if needed. Once you're 100% happy with the final files, approve the delivery and release payment."
  }
];

const buyerFaqs = [
  {
    q: "How does escrow payment protection work on Workvence?",
    a: "When you place an order, your money is securely deposited in Workvence Escrow. The seller sees that the funds are secured and starts working. The money is only transferred to the seller after you inspect the deliverables and click 'Accept & Complete'."
  },
  {
    q: "What if I'm not satisfied with the work delivered?",
    a: "You can request revisions directly through the order page. If the deliverable fundamentally fails to meet the package requirements, you can open a dispute and our support team will review and issue a refund."
  },
  {
    q: "Are there any hidden fees for buyers?",
    a: "No hidden fees. You only pay a small transparent standard processing fee displayed clearly at checkout before you authorize payment."
  },
  {
    q: "Can I hire freelancers for ongoing hourly or custom contracts?",
    a: "Yes! In addition to fixed-price packages, you can create custom milestone briefs and hire freelancers on long-term retainers."
  }
];

export default function HowToBuyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>Buyer Protection Guide</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Hire World-Class Talent with <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Zero Risk & Total Confidence</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Find pre-vetted specialists, manage projects effortlessly, and only pay when work is completed to your exact standards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/packages"
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#guarantees"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Buyer Guarantees
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Buyer Roadmap */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">The Buying Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              How Hiring Works on Workvence
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              From discovering top talent to project sign-off in 4 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyerSteps.map((s, idx) => (
              <div
                key={idx}
                className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-6 space-y-4 hover:border-[#327C73] transition duration-200"
              >
                <div className="text-2xl font-extrabold text-[#327C73] font-mono">{s.step}</div>
                <h3 className="text-lg font-bold text-[#0f172a]">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer Guarantees Section */}
      <section id="guarantees" className="py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Our Promise</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Built-in Buyer Protections
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Every single transaction is safeguarded by industry-leading security and escrow rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {buyerGuarantees.map((g, idx) => {
              const Icon = g.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4 shadow-xs hover:shadow-md transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a]">{g.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{g.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Buyer FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">Help & Answers</span>
            <h2 className="text-3xl font-bold text-[#0f172a]">Buying FAQ</h2>
          </div>

          <div className="space-y-3">
            {buyerFaqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-5 cursor-pointer"
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
                  <p className="text-xs text-gray-600 pt-3 mt-3 border-t border-gray-200 leading-relaxed font-normal">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>Explore Marketplace Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
