import React from "react";
import type { Metadata } from "next";
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
  RefreshCw
} from "lucide-react";
import HowToBuyFaq from "./HowToBuyFaq";

const buyerGuarantees = [
  {
    icon: Lock,
    title: "100% Escrow Payment Protection",
    desc: "Your payment is held safely in escrow. Sellers only get paid when you review, test, and approve the deliverable.",
    href: "/how-escrow-works",
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

export const metadata: Metadata = {
  title: "How to Buy | Workvence Buyer Guide & Escrow Protection",
  description: "Learn how to safely hire top freelancers with 100% escrow protection, verified reviews, and guaranteed commercial ownership.",
};

export default function HowToBuyPage() {

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* 1. Hero Banner Card */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="How to Buy Banner"
          className="relative w-full rounded-[6px] py-16 sm:py-20 md:py-24 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#013571] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/BuyingonWorkvence.png')" }}
        >
          {/* Subtle dark overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-[#011e40]/30 backdrop-blur-[0.5px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-tight">
              Hire World-Class Talent with <br className="hidden sm:inline" />
              <span className="text-[#6AD724]">Zero Risk &amp; Total Confidence</span>
            </h1>
            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
              Find pre-vetted specialists, manage projects effortlessly, and only pay when work is completed to your exact standards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/packages?category=ai-services"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs gap-2 cursor-pointer"
              >
                <span>Explore Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#guarantees"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white hover:bg-gray-100 text-[#0f172a] font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                Buyer Guarantees
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* 4-Step Buyer Roadmap */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">The Buying Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              How Hiring Works on Workvence
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              From discovering top talent to project sign-off in 4 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyerSteps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200"
              >
                <div className="text-2xl font-extrabold text-[#0D6D5F] font-mono">{s.step}</div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">{s.title}</h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer Guarantees Section */}
      <section id="guarantees" className="py-20 bg-[#f8fafc] border-y border-[rgba(0,0,0,0.10)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Our Promise</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Built-in Buyer Protections
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Every single transaction is safeguarded by industry-leading security and escrow rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {buyerGuarantees.map((g, idx) => {
              const Icon = g.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 sm:p-8 space-y-4 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
                >
                  <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#0D6D5F]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">{g.title}</h3>
                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{g.desc}</p>
                  {"href" in g && g.href && (
                    <Link
                      href={g.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D6D5F] hover:text-[#0b5c50] pt-1"
                    >
                      <span>Learn how escrow works</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Buyer FAQ Section */}
      <section className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Help & Answers</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">Buying FAQ</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Everything you need to know about purchasing services safely.
            </p>
          </div>

          <HowToBuyFaq faqs={buyerFaqs} />

          <div className="mt-12 text-center">
            <Link
              href="/packages?category=ai-services"
              className="inline-flex items-center gap-2 px-6 h-10 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
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
