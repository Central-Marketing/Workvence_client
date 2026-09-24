import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  MessageSquare,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Scale,
  Sparkles,
  Check,
  Clock,
  Layers,
  HelpCircle,
} from "lucide-react";
import EscrowFaq, { FaqItem } from "./EscrowFaq";

export const metadata: Metadata = {
  title: "How Escrow Works | Workvence Payment Protection",
  description:
    "Your payment is protected until the work is delivered. Learn how Workvence escrow keeps your money secure from order placement to final delivery approval.",
  openGraph: {
    title: "How Escrow Works | Workvence Payment Protection",
    description:
      "Escrow keeps your money secure while work is completed. Paid upfront, released only upon your approval.",
  },
};

const ESCROW_STEPS = [
  {
    number: "01",
    label: "Place Your Order",
    headline: "Agree on the work before money moves.",
    description:
      "Choose a freelancer, review the scope, milestones, delivery date, and price. Once everything looks right, place your order and make the payment.",
    highlightBadge: "Your payment is securely held in escrow.",
    icon: CreditCard,
    accentColor: "from-[#0D6D5F]/10 to-[#0D6D5F]/5",
  },
  {
    number: "02",
    label: "Your Money Is Held Securely",
    headline: "The freelancer can't access your payment yet.",
    description:
      "Your payment stays protected while the freelancer works on your project. This creates a clear separation between payment and delivery—so both sides know exactly what happens next.",
    specialCallout: {
      tag: "Paid ≠ Released",
      text: "Your money remains protected until you approve the work.",
    },
    icon: Lock,
    accentColor: "from-emerald-500/10 to-teal-500/5",
  },
  {
    number: "03",
    label: "The Work Gets Done",
    headline: "Stay connected while your project is in progress.",
    description:
      "The freelancer works according to the agreed scope and delivery requirements. You can communicate, share files, provide feedback, and track progress through the platform.",
    milestoneNote:
      "For milestone-based projects, each milestone can be reviewed before moving forward.",
    icon: MessageSquare,
    accentColor: "from-blue-500/10 to-indigo-500/5",
  },
  {
    number: "04",
    label: "Review the Delivery",
    headline: "Make sure the work matches what you agreed to.",
    description:
      "When the freelancer submits the work, review it against the original requirements.",
    dualChoices: [
      {
        title: "Approve the work",
        desc: "Everything looks good? Approve the delivery and release the payment.",
        badge: "Release Payment",
        isPositive: true,
      },
      {
        title: "Request changes",
        desc: "Something needs adjustment? Send feedback and allow the freelancer to make the agreed revisions.",
        badge: "Request Revisions",
        isPositive: false,
      },
    ],
    icon: FileCheck2,
    accentColor: "from-amber-500/10 to-orange-500/5",
  },
  {
    number: "05",
    label: "Payment Is Released",
    headline: "Once you approve, the freelancer gets paid.",
    description:
      "After you approve the completed work, the escrowed funds are released to the freelancer.",
    takeaway: {
      headline: "You get the work. They get paid.",
      sub: "Simple, transparent, and tied to delivery.",
    },
    icon: CheckCircle2,
    accentColor: "from-[#0D6D5F]/15 to-[#6AD724]/10",
  },
];

const PROTECTION_TABLE = [
  { stage: "Order", whatHappens: "You agree on scope, price & delivery", icon: Clock },
  { stage: "Payment", whatHappens: "Your money enters escrow", icon: Lock },
  { stage: "Work", whatHappens: "Freelancer completes the project", icon: Layers },
  { stage: "Delivery", whatHappens: "You receive and review the work", icon: FileCheck2 },
  { stage: "Approval", whatHappens: "You approve or request changes", icon: CheckCircle2 },
  { stage: "Release", whatHappens: "Payment is released to freelancer", icon: Sparkles },
  { stage: "Dispute", whatHappens: "Support is available if there's a disagreement", icon: Scale },
];

const TRUST_PILLARS = [
  {
    icon: Layers,
    title: "Clear expectations",
    description:
      "The project scope, price, milestones, and delivery requirements are established before work begins.",
  },
  {
    icon: Lock,
    title: "Protected payments",
    description:
      "Your payment is held rather than immediately transferred to the freelancer.",
  },
  {
    icon: FileCheck2,
    title: "Review before release",
    description:
      "You have an opportunity to review the delivered work before payment is released.",
  },
  {
    icon: Scale,
    title: "Dispute support",
    description:
      "If an agreement can't be reached, you can use the platform's dispute process.",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "When is my payment released?",
    a: "Payment is released after you approve the delivered work, subject to the specific order or milestone terms.",
  },
  {
    q: "Can I request changes?",
    a: "Yes. If the submitted work doesn't meet the agreed requirements, you can request revisions according to the project's terms.",
  },
  {
    q: "What happens if the freelancer doesn't deliver?",
    a: "You can raise the issue through the platform's dispute process. The case can then be reviewed based on the agreed scope, project activity, communication, and submitted work.",
  },
  {
    q: "Can I cancel an order?",
    a: "Cancellation and refund eligibility depend on the order status and the applicable terms of the platform.",
  },
  {
    q: "Does escrow guarantee that I'll get exactly what I want?",
    a: "Escrow protects the payment process; it does not replace a clear project scope or guarantee subjective outcomes. Clearly defining requirements, deliverables, milestones, and acceptance criteria helps prevent disputes.",
  },
];

export default function HowEscrowWorksPage() {
  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans antialiased">
      {/* 1. TOP HERO BANNER */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="How Escrow Works Banner"
          className="relative w-full rounded-[6px] py-14 sm:py-20 md:py-24 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/WorkwithBG.png')" }}
        >
          {/* Subtle dark overlay for perfect contrast */}
          <div className="absolute inset-0 bg-[#0c1c1b]/50 backdrop-blur-[1px]" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#fff] text-xs font-semibold uppercase tracking-wider mb-5">
              <ShieldCheck className="w-4 h-4 text-[#fff]" />
              <span>Workvence Escrow Protection</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.12]">
              How Escrow Works
            </h1>



            {/* Intro paragraph */}
            <p className="mt-4 font-inter text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
              Escrow keeps your money secure while the work is being completed. You pay upfront,
              but the freelancer only receives the funds after you review and approve the work.
            </p>

            {/* Trust highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-medium text-emerald-100">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-[#6AD724]" />
                <span>Upfront Escrow Deposit</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#6AD724]" />
                <span>Paid ≠ Released Separation</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Scale className="w-3.5 h-3.5 text-[#6AD724]" />
                <span>Dispute Resolution Support</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2. FIVE VISUAL STEPS */}
      <section className="w-full py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0D6D5F]">
              Step-by-Step Payment Journey
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              From Deposit to Delivery in 5 Clear Steps
            </h2>
            <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-600">
              Understand the entire payment lifecycle in under a minute. Simple, safe, and transparent.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {ESCROW_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200/90 rounded-[6px] p-6 sm:p-8 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Step Number + Icon Badge */}
                    <div className="flex items-center gap-4 md:flex-col md:items-center shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[6px] bg-[#fff] border border-[rgba(0, 0, 0, 0.10)] text-[#0D6D5F] flex items-center justify-center">
                        <StepIcon className="w-6 h-6 text-[#0D6D5F]" />
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-400 tracking-wider">
                        STEP {step.number}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-3">


                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0f172a]">
                        {step.headline}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                        {step.description}
                      </p>

                      {/* Step 01 Highlight */}
                      {step.highlightBadge && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-[#0D6D5F] bg-white px-3 py-1.5 rounded-[6px] border border-[rgba(0, 0, 0, 0.10)]">
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            {step.highlightBadge}
                          </span>
                        </div>
                      )}

                      {/* Step 02 Special Callout: Paid ≠ Released */}
                      {step.specialCallout && (
                        <div className="pt-2">
                          <div className="bg-[#fff] border border-[rgba(0, 0, 0, 0.10)]/20 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-[#0D6D5F] text-white">
                                {step.specialCallout.tag}
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-[#0f172a]">
                                {step.specialCallout.text}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 font-normal">
                              Funds protected 100%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Step 03 Milestone Note */}
                      {step.milestoneNote && (
                        <div className="pt-2">
                          <div className="flex items-start gap-2.5 text-xs text-slate-700 bg-[#fff] p-3 rounded-[6px] border border-[rgba(0, 0, 0, 0.10)]">
                            <Layers className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                            <span>{step.milestoneNote}</span>
                          </div>
                        </div>
                      )}

                      {/* Step 04 Dual Choices: Approve or Request Changes */}
                      {step.dualChoices && (
                        <div className="pt-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                            You can choose:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {step.dualChoices.map((choice, cIdx) => (
                              <div
                                key={cIdx}
                                className={`p-4 rounded-[6px] border ${choice.isPositive
                                  ? "bg-white border-[rgba(0, 0, 0, 0.10)]"
                                  : "bg-amber-50/50 border-amber-200/90"
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span
                                    className={`font-bold text-xs sm:text-sm ${choice.isPositive ? "text-emerald-900" : "text-amber-900"
                                      }`}
                                  >
                                    {choice.title}
                                  </span>
                                  {choice.isPositive ? (
                                    <Check className="w-4 h-4 text-[#0D6D5F]" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4 text-amber-700" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                                  {choice.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 05 Takeaway */}
                      {step.takeaway && (
                        <div className="pt-2">
                          <div className="p-4 rounded-[6px] bg-[#fff] border border-[rgba(0, 0, 0, 0.10)]">
                            <div className="text-sm sm:text-base font-bold text-[#0D6D5F]">
                              {step.takeaway.headline}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {step.takeaway.sub}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. WHAT IF SOMETHING GOES WRONG? */}
      <section className="w-full py-16 bg-[#F8F9FA] border-y border-gray-200/80">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-[6px] p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-[6px] border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Safety Net & Mediation</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                  What If Something Goes Wrong?
                </h2>
                <p className="text-sm sm:text-base font-medium text-emerald-800">
                  You don&apos;t have to chase anyone for your money.
                </p>
              </div>

              <div>
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs whitespace-nowrap cursor-pointer"
                >
                  <span>Open a Dispute</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="pt-6 space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              <p>
                If the work isn&apos;t delivered, doesn&apos;t match the agreed requirements, or a
                disagreement can&apos;t be resolved between both parties, you can open a dispute.
              </p>
              <p>
                Our platform team can review the relevant project information, communication,
                agreed scope, and submitted work to help resolve the issue according to the
                platform&apos;s dispute process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. YOUR PROTECTION, FROM START TO FINISH (TABLE / MATRIX) */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0D6D5F]">
              Comprehensive Coverage
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
              Your Protection, From Start to Finish
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Clear accountability at every phase of the project.
            </p>
          </div>

          <div className="overflow-hidden border border-gray-200 rounded-[6px] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs sm:text-sm font-bold text-[#0f172a]">
                  <th className="py-3.5 px-4 sm:px-6 w-1/3">Stage</th>
                  <th className="py-3.5 px-4 sm:px-6">What Happens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {PROTECTION_TABLE.map((row, rIdx) => {
                  const RowIcon = row.icon;
                  return (
                    <tr
                      key={rIdx}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="py-4 px-4 sm:px-6 font-semibold text-[#0f172a]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[6px] bg-[#fff] border border-[rgba(0, 0, 0, 0.10)] text-[#0D6D5F] flex items-center justify-center shrink-0">
                            <RowIcon className="w-3.5 h-3.5" />
                          </span>
                          <span>{row.stage}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-600 font-normal">
                        {row.whatHappens}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. BUILT AROUND TRUST */}
      <section className="w-full py-16 sm:py-20 bg-[#F8F9FA] border-t border-gray-200/80">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0D6D5F]">
              Platform Pillars
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
              Built Around Trust
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Designed from the ground up to protect both clients and freelancers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TRUST_PILLARS.map((pillar, pIdx) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={pIdx}
                  className="bg-white border border-gray-200/90 rounded-[6px] p-6 sm:p-7 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
                >
                  <div className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0, 0, 0, 0.10)] text-[#0D6D5F] flex items-center justify-center mb-4">
                    <PillarIcon className="w-5 h-5 text-[#0D6D5F]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0D6D5F]">
              Got Questions?
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Everything you need to know about Workvence Escrow.
            </p>
          </div>

          <EscrowFaq faqs={FAQS} />
        </div>
      </section>

      {/* 7. READY TO GET STARTED? (BOTTOM CTA BANNER) */}
      <section className="w-full py-20 bg-[#F8F9FA] border-t border-gray-200/80 pb-[80px] min-[1400px]:pb-[100px]">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div
            className="bg-[#0c1c1b] text-white rounded-[6px] py-16 sm:py-24 md:py-28 px-6 sm:px-12 min-h-[460px] sm:min-h-[480px] flex flex-col items-start justify-center text-left relative overflow-hidden shadow-md bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/media/AFreelancerBG.png')" }}
          >
            {/* Subtle dark overlay for contrast */}
            <div className="absolute inset-0 bg-[#0c1c1b]/20 backdrop-blur-[1px]" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                <span>Zero Risk Hiring</span>
              </span>
              <h2 className="font-sf-pro font-[510] text-3xl leading-[normal] sm:text-4xl sm:leading-[normal] lg:text-[44px] lg:leading-[normal] xl:text-[48px] xl:leading-[normal] text-white mb-4 sm:mb-5 my-4">
                Ready to Get Started?
              </h2>
              <p className="font-inter font-normal text-base sm:text-[15px] text-[#C7C7C7] mb-5 sm:mb-10 max-w-xl leading-relaxed">
                Work with confidence.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-start gap-3.5">
                <Link
                  href="/packages"
                  className="px-6 h-10 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Find a Freelancer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/briefs/create"
                  className="px-6 h-10 rounded-[6px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Post a Project</span>
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
