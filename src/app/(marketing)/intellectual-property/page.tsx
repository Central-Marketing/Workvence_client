import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldAlert,
  FileCheck,
  Scale,
  AlertTriangle,
  HelpCircle,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  Layers,
  Sparkles,
  Info
} from "lucide-react";
import IpClaimForm from "./IpClaimForm";
import IpFaq, { IpFaqItem } from "./IpFaq";

export const metadata: Metadata = {
  title: "Intellectual Property & Copyright Policy | Workvence Legal Portal",
  description:
    "Learn about intellectual property rights, commercial ownership transfer, and DMCA notice-and-takedown procedures on the Workvence marketplace.",
  openGraph: {
    title: "Intellectual Property Policy | Workvence Legal Portal",
    description:
      "Workvence respects creator rights and buyer ownership. Review our IP standards or submit an official DMCA / Trademark infringement claim.",
  },
};

const IP_PILLARS = [
  {
    icon: FileCheck,
    title: "Commercial Rights Transfer",
    desc: "Once an order is approved and funds are released from escrow, the buyer receives all agreed commercial rights, title, and ownership in the custom deliverable.",
  },
  {
    icon: ShieldCheck,
    title: "Originality Warranty",
    desc: "Sellers explicitly warrant that all delivered files, designs, and code are 100% original, appropriately licensed, or authorized for commercial redistribution.",
  },
  {
    icon: ShieldAlert,
    title: "Zero Tolerance for Piracy",
    desc: "Unlicensed stock media, cracked software, unauthorized trademark use, and copied portfolios result in immediate removal and account sanctions.",
  },
  {
    icon: Scale,
    title: "Statutory Counter-Notices",
    desc: "We enforce a transparent counter-notice process compliant with 17 U.S.C. § 512(g) of the DMCA to protect sellers against bad-faith or mistaken claims.",
  },
];

const COUNTER_NOTICE_STEPS = [
  {
    step: "01",
    title: "Notice & Temporary Disabling",
    desc: "Upon receiving a valid DMCA claim, Workvence promptly disables the disputed material and forwards the complete claim to the affected seller.",
  },
  {
    step: "02",
    title: "Counter-Notification Submission",
    desc: "If the seller believes the claim was submitted in error or holds valid commercial licensing, they may submit a formal counter-notice under penalty of perjury.",
  },
  {
    step: "03",
    title: "10-14 Day Statutory Window",
    desc: "Workvence forwards the counter-notice to the original claimant. If no court action is filed within 10 to 14 business days, the disabled material may be restored.",
  },
];

const IP_FAQS: IpFaqItem[] = [
  {
    q: "Do buyers automatically own the intellectual property for completed orders?",
    a: "Yes. Unless explicitly specified otherwise in custom gig terms or a mutually signed written agreement, when an order is accepted and payment is released from escrow, the buyer is granted full commercial ownership and exclusive rights to the bespoke deliverables.",
  },
  {
    q: "Can a freelancer display completed work in their public portfolio?",
    a: "Unless the buyer requested an NDA (Non-Disclosure Agreement) or marked the order as confidential during checkout, freelancers are generally permitted to showcase non-confidential custom deliverables as part of their verified Workvence professional portfolio.",
  },
  {
    q: "What should I do if someone on Workvence is selling my copyrighted work?",
    a: "If you are the copyright or trademark owner (or their authorized representative), you can submit an official Notice of Claimed Infringement using the DMCA Claim Form on this page. Our legal compliance team investigates all properly formatted claims within 24 to 48 hours.",
  },
  {
    q: "How does Workvence handle repeat copyright infringers?",
    a: "Workvence maintains a strict repeat infringer policy in accordance with federal copyright law. Users who repeatedly receive valid infringement takedown notices will face permanent account termination, gig forfeiture, and escrow withholding.",
  },
  {
    q: "Can sellers use third-party stock assets, fonts, or templates in custom orders?",
    a: "Yes, but only if the seller holds a valid commercial license that explicitly allows redistribution or incorporation into a client's final deliverable. Sellers must disclose any third-party stock assets, open-source libraries, or fonts used in the project delivery.",
  },
  {
    q: "What is the penalty for filing a false or bad-faith DMCA claim?",
    a: "Under Section 512(f) of the Digital Millennium Copyright Act (17 U.S.C. § 512(f)), any party that knowingly materially misrepresents that online material is infringing may be held liable for civil damages, including court costs and reasonable attorney fees.",
  },
];

export default function IntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans antialiased">
      {/* 1. TOP HERO BANNER */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="Intellectual Property Policy Banner"
          className="relative w-full rounded-[6px] py-14 sm:py-20 md:py-24 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/WorkwithBG.png')" }}
        >
          {/* Subtle dark overlay for contrast */}
          <div className="absolute inset-0 bg-[#0c1c1b]/55 backdrop-blur-[1px]" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.12]">
              Intellectual Property & <br className="hidden sm:inline" />
              <span className="text-[#6AD724]">Copyright Policy</span>
            </h1>

            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
              Workvence is committed to protecting the original creations, trademarks, and copyright rights of our community, buyers, and rightsholders worldwide.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#submit-claim"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-sm transition shadow-sm"
              >
                Submit Infringement Notice
              </a>
              <a
                href="#ownership-rules"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition backdrop-blur-xs"
              >
                View Ownership Rules
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* 2. CORE POLICY PILLARS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
              Legal Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Our Core Intellectual Property Principles
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Clear rules governing originality, deliverables transfer, and rights enforcement across Workvence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {IP_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 text-left space-y-3 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200"
                >
                  <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#0D6D5F]">
                    <Icon className="w-6 h-6 text-[#0D6D5F]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a]">{pillar.title}</h3>
                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. OWNERSHIP OF DELIVERABLES & ESCROW SYNC */}
      <section id="ownership-rules" className="py-16 sm:py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
              Ownership Transfer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              How Work Ownership Works on Workvence
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Complete clarity on buyer commercial rights and seller portfolio permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer Ownership Box */}
            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 sm:p-8 space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D6D5F]/10 text-[#0D6D5F] text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Buyer Rights</span>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Full Commercial Ownership</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                When you place an order through Workvence, your payment is held securely in escrow. Once you review and approve the final delivery, all intellectual property rights, copyright, and commercial exploitation rights to the custom work transfer exclusively to you.
              </p>
              <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Exclusive right to publish, reproduce, modify, and resell.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Includes all delivered source files, assets, and raw exports.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Protected against third-party resale by the delivering seller.</span>
                </div>
              </div>
            </div>

            {/* Seller Rights & Portfolio Box */}
            <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 sm:p-8 space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-[#0D6D5F]" />
                <span>Seller Rights</span>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Portfolio & Showcase Permissions</h3>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                Sellers retain the right to present completed work in their public Workvence portfolio as proof of craft, unless the buyer specifically designated the project as confidential or executed a non-disclosure agreement (NDA) during checkout.
              </p>
              <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Right to demonstrate professional capability to future clients.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>No retained commercial ownership or secondary licensing rights.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Immediately removed from portfolio if an active NDA applies.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DMCA CLAIM SUBMISSION SECTION */}
      <section id="submit-claim" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
              Legal Notification
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Report an Intellectual Property Infringement
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              If you believe content hosted on Workvence violates your copyright or trademark, submit an official notice below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Guidelines & Legal Notice (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#0f172a]">Statutory DMCA Notice Requirements</h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  To ensure rapid processing and legal validity under 17 U.S.C. § 512(c)(3), your notice must include:
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-gray-700 bg-[#f8fafc] p-6 rounded-[6px] border border-[rgba(0,0,0,0.10)]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Direct URL(s) to the specific gig, package, or attachment on Workvence hosting the disputed content.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Sufficient description and reference URL(s) demonstrating your ownership of the original work.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Accurate contact details including legal name, email address, and physical or electronic signature.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                  <span>Good faith statement and attestation under penalty of perjury asserting the claim is truthful.</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/90 rounded-[6px] p-5 space-y-2 text-xs text-amber-800">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Important Legal Warning</span>
                </div>
                <p className="leading-relaxed">
                  Under 17 U.S.C. § 512(f), any party who knowingly materially misrepresents that material or activity is infringing may be held liable for damages, including court costs and attorney fees.
                </p>
              </div>

              <div className="p-5 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] space-y-2 text-xs text-gray-600">
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#0D6D5F]" />
                  <span>Designated Copyright Agent</span>
                </div>
                <p>Workvence Legal & Compliance Operations</p>
                <p>Email: <span className="font-medium text-[#0D6D5F]">copyright@workvence.com</span></p>
                <p className="text-[11px] text-gray-500">Typical response timeframe: 24 to 48 business hours.</p>
              </div>
            </div>

            {/* Right Column: Claim Submission Form (7 cols) */}
            <IpClaimForm />
          </div>
        </div>
      </section>

      {/* 5. COUNTER-NOTIFICATION PROCESS */}
      <section className="py-16 sm:py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">
              Due Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              The Counter-Notification Process
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Fair, transparent statutory procedure for sellers whose content was removed due to mistake or misidentification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COUNTER_NOTICE_STEPS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 space-y-3 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
              >
                <span className="font-mono text-xs font-bold text-[#0D6D5F] bg-[#0D6D5F]/10 px-2 py-0.5 rounded">
                  STAGE {item.step}
                </span>
                <h3 className="text-base font-bold text-[#0f172a]">{item.title}</h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. POLICY FAQ (Accordion) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">FAQ</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Answers regarding ownership, portfolio display, licensing, and takedown claims.
            </p>
          </div>

          <IpFaq faqs={IP_FAQS} />
        </div>
      </section>

      {/* 7. BOTTOM CTA RESOLUTION BANNER */}
      <div className="w-full container mx-auto px-4 md:px-6 pb-[80px] min-[1400px]:pb-[100px]">
        <section
          aria-label="Resolution and Support"
          className="relative w-full rounded-[6px] py-14 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 text-left flex flex-col items-start justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/AFreelancerBG.png')" }}
        >
          <div className="absolute inset-0 bg-[#0c1c1b]/55 backdrop-blur-[1px]" />
          <div className="relative z-10 max-w-2xl flex flex-col items-start text-left space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white leading-tight">
              Have Questions About Rights or an Active Order?
            </h2>
            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-xl leading-relaxed">
              Our Trust & Safety team is here to assist with escrow protection, licensing questions, and dispute mediation.
            </p>
            <div className="flex flex-wrap items-center justify-start gap-3 pt-2">
              <Link
                href="/support"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-sm transition shadow-sm"
              >
                Contact Legal Support
              </Link>
              <Link
                href="/how-escrow-works"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition backdrop-blur-xs"
              >
                How Escrow Protects You
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
