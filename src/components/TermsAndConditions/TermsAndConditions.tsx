// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const categories = [
  "All services",
  "Technology & Programming",
  "Writing & Translation",
  "Design",
  "Digital Marketing",
  "Video, Photo & Image",
  "Business",
  "Music & Audio",
  "Social Media",
];

const termsData = [
  {
    title: "1. Introduction",
    content: "This agreement represents the entire understanding between the user and Workvence. By using the platform, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, please cease use immediately.",
    bullets: [
      "Includes all subdomains and mobile applications.",
      "Subject to periodic updates with 30-day notice."
    ]
  },
  {
    title: "2. Eligibility",
    content: "To access or use Workvence services, you must be at least 18 years old and capable of forming legally binding contracts under applicable law. By creating an account, you represent and warrant that you meet these eligibility criteria and will comply with all regional regulations.",
    bullets: []
  },
  {
    title: "3. User Accounts",
    content: "You agree to provide accurate, current, and complete information during registration and to keep your account credentials strictly confidential and secure. You are fully responsible for all actions, communications, and financial activities occurring under your account.",
    bullets: []
  },
  {
    title: "4. Marketplace Services",
    content: "Workvence provides an online digital marketplace connecting client buyers and independent freelance sellers. Workvence does not perform the project deliverables directly and is not a formal party to the service contract between buyer and seller.",
    bullets: []
  },
  {
    title: "5. Orders & Payments",
    content: "All order proposals, milestone negotiations, transactions, pricing, and deliveries must be executed entirely through the official Workvence platform. Attempting to conduct payments or communicate outside the platform to circumvent service protection fees violates these Terms and will result in permanent account restriction.",
    bullets: []
  },
  {
    title: "6. Escrow System",
    content: "When an order is formally initiated, payment funds are deposited into a neutral, secure escrow account managed by Workvence. Funds remain protected in escrow until the buyer reviews and approves the final deliverable or automatic delivery completion thresholds are met.",
    bullets: []
  },
  {
    title: "7. Buyer Protection",
    content: "Our Buyer Protection program guarantees that your funds remain secured in escrow during order execution. If a seller fails to meet project requirements, specifications, or agreed deadlines, buyers are eligible for mediation through our resolution system or a full cancellation refund.",
    bullets: []
  },
  {
    title: "8. Seller Responsibilities",
    content: "Sellers agree to provide high-quality professional services strictly adhering to agreed gig descriptions, custom offers, delivery timelines, and courteous platform communication standards. Original work and complete copyright ownership must be guaranteed upon project transfer.",
    bullets: []
  },
  {
    title: "9. Buyer Responsibilities",
    content: "Buyers agree to provide constructive, clear project instructions, timely feedback, and respectful communication during order execution. Approving an order delivery releases escrow funds permanently to the seller.",
    bullets: []
  },
  {
    title: "10. Cancellation & Refund Policy",
    content: "Orders can be cancelled by mutual agreement between buyer and seller, or by our Customer Resolution team in verified cases of non-delivery or platform Terms violations. Approved refunds are credited directly to your Workvence account balance or initial payment source.",
    bullets: []
  },
  {
    title: "11. Dispute Resolution",
    content: "If an impasse occurs regarding deliverable quality or order fulfillment, either party may submit a request for formal mediation from Workvence Support. Our resolution experts thoroughly evaluate communication transcripts and specifications to establish a fair and binding settlement.",
    bullets: []
  },
  {
    title: "12. Intellectual Property & Privacy",
    content: "Upon successful order completion and escrow payment release, full intellectual property rights, copyrights, and commercial licensing for all custom deliverables transfer entirely from seller to buyer, unless explicitly modified in the specific gig contract terms.",
    bullets: []
  }
];

const TermsAndConditions = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24">
      {/* Top Category Tabs Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/gigs?category=${cat === 'All services' ? '' : encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-4 py-4 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-gray-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-10">
        
        {/* Hero Banner */}
        <div className="w-full bg-gradient-to-r from-[#f2fbf6] via-[#f7fdf9] to-[#e6f8ef] border border-[#ceefe0] rounded-3xl p-8 sm:p-12 mb-10 shadow-2xs relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight mb-2">
              Terms & Conditions
            </h1>
            
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1dbf73] mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Last Updated: July 2026</span>
            </div>

            <p className="text-[15px] sm:text-[16px] text-gray-600 font-normal leading-relaxed">
              Welcome to Workvence. These Terms & Conditions govern your use of our platform. By accessing or using our services, you agree to be bound by these legally binding terms between you and Workvence Marketplace Inc.
            </p>
          </div>
        </div>

        {/* Four Summary Feature Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 mb-14">
          
          {/* Card 1: Secure Payments */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-9 h-9 rounded-lg bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 mb-1.5 tracking-tight">
              Secure Payments
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              PCI-DSS compliant encrypted transactions.
            </p>
          </div>

          {/* Card 2: Buyer Protection */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-9 h-9 rounded-lg bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 mb-1.5 tracking-tight">
              Buyer Protection
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              Money-back guarantee for unmet milestones.
            </p>
          </div>

          {/* Card 3: Escrow Protection */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-9 h-9 rounded-lg bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 mb-1.5 tracking-tight">
              Escrow Protection
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              Funds are held safely until work is approved.
            </p>
          </div>

          {/* Card 4: 24/7 Support */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-9 h-9 rounded-lg bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 mb-1.5 tracking-tight">
              24/7 Support
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              Dedicated assistance for all legal queries.
            </p>
          </div>

        </div>

        {/* Interactive Numbered Terms Sections (12 Accordion Cards) */}
        <div className="container space-y-4 mb-16">
          {termsData.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Green circular badge icon */}
                    <div className="w-8 h-8 rounded-full bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center flex-shrink-0 font-semibold text-xs shadow-2xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <span className="text-[15.5px] sm:text-[17px] font-semibold text-gray-900 leading-snug">
                      {item.title}
                    </span>
                  </div>

                  <div className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-gray-700" : ""}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-[14.5px] text-gray-600 leading-relaxed font-normal animate-fadeIn pl-2 sm:pl-12">
                    <p className="mb-3">{item.content}</p>

                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="space-y-2 pt-2">
                        {item.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-center gap-2.5 text-[14px] text-gray-600">
                            <svg className="w-4 h-4 text-[#1dbf73] flex-shrink-0 fill-current" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Green Acknowledgment Capsule */}
        <div className="w-full bg-[#f3fbf6] border border-[#ceefe0]/90 rounded-2xl py-6 px-6 sm:px-10 text-center shadow-2xs mb-10">
          <p className="text-sm sm:text-[15px] font-semibold italic text-gray-700 leading-relaxed">
            By continuing to use this platform, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
