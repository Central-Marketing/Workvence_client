import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Data Security | Workvence",
  description:
    "Protecting your data is at the core of how we build products. This policy explains how we collect, use, and protect your personal information within the Workvence ecosystem.",
};

// =========================================================================
// DUMMY IMAGE URL: Replace this dummy URL with your exported Figma asset
// (You can use a local path like "/images/privacy/hero.png" or a remote URL)
// =========================================================================
const DUMMY_IMAGE =
  "/images/privacy/hero.png";

interface PolicyItem {
  id: string;
  question: string;
  answer: string;
}

const POLICY_ITEMS: PolicyItem[] = [
  {
    id: "info-collected",
    question:
      "What personal information do we collect from the people that visit our website or blog?",
    answer:
      "When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address, mailing address, phone number or other details to help you with your experience.",
  },
  {
    id: "how-we-use",
    question:
      "How do we use the information we collect from visitors?",
    answer:
      "We use the information to personalize your experience, improve our website, process transactions, and send periodic emails for updates and promotions.",
  },
  {
    id: "third-party-sharing",
    question:
      "Do we share your information with third parties?",
    answer:
      "We do not sell, trade, or rent your personal information to others. We may share data with trusted service providers who assist in operating our website and conducting our business.",
  },
  {
    id: "data-protection",
    question:
      "How do we protect your information?",
    answer:
      "We implement a variety of security measures including encryption and secure servers to safeguard your personal data from unauthorized access.",
  },
  {
    id: "cookies-usage",
    question:
      "Do we use cookies?",
    answer:
      "Yes, cookies help us understand visitor behavior, enhance user experience, and remember your preferences for future visits.",
  },
  {
    id: "update-delete-data",
    question:
      "How can you update or delete your personal information?",
    answer:
      "You can contact us directly to request updates or removal of your personal information from our records at any time.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased">
      {/* Page Container */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-12 pb-0">
        {/* 1. Header Section */}
        <header className="flex flex-col items-start">

          {/* Last Updated Badge */}
          <div className="mt-3.5 sm:mt-4 md:mt-5 inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#F4F4F5] border border-[#E4E4E7] text-[11px] sm:text-[12px] font-normal text-[#6E6E6E]">
            Last Updated: July 2026
          </div>

          {/* Title */}
          <h1 className="mt-3 sm:mt-4 font-sf-pro font-normal text-[#292929] text-2xl sm:text-3xl md:text-4xl lg:text-[44px] tracking-tight leading-tight">
            Privacy &amp; Data Security
          </h1>

          {/* Subtitle */}
          <p className="mt-2 sm:mt-2.5 font-inter font-normal text-[#6E6E6E] text-xs sm:text-[13.5px] md:text-[14px] leading-relaxed max-w-4xl">
            Protecting your data is at the core of how we build products. This policy explains how we collect, use, and protect your personal information within the Workvence ecosystem.
          </p>
        </header>

        {/* 2. Hero Banner Image */}
        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 w-full aspect-[16/8] sm:aspect-[2.2/1] md:aspect-[44/15] rounded-[6px] overflow-hidden bg-gray-100 shadow-xs border border-black/[0.04] shrink-0">
          <img
            src={DUMMY_IMAGE}
            alt="Privacy and Data Security Banner"
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        </div>

        {/* 3. Policy Q&A Items */}
        <div className="mt-8 sm:mt-10 md:mt-14 lg:mt-16 divide-y divide-[#E5E7EB] pb-[80px] min-[1400px]:pb-[100px]">
          {POLICY_ITEMS.map((item) => (
            <section
              key={item.id}
              id={item.id}
              className="py-5 sm:py-6 md:py-8 first:pt-0"
            >
              <h2 className="font-sf-pro font-bold text-[#434343] text-[17px] sm:text-[19px] md:text-[22px] lg:text-[24px] leading-snug md:leading-normal">
                {item.question}
              </h2>
              <p className="mt-3 sm:mt-4 font-inter font-normal text-[#4A4A4A] text-sm sm:text-base md:text-[18px] lg:text-[20px] leading-[22px] sm:leading-[26px] md:leading-[30px] max-w-5xl">
                {item.answer}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
