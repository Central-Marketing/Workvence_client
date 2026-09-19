import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Trust & Safety | Workvence",
  description:
    "Work with confidence. Learn how Workvence protects clients and freelancers with account protection, secure payments, marketplace safety, and dispute support.",
};

// =========================================================================
// DUMMY IMAGE URLS: Replace these dummy URLs with your exported Figma assets
// (You can use local paths like "/trust&safety/my-image.png" or remote URLs)
// =========================================================================
const DUMMY_IMAGES = {
  saferWay:
    "/images/trust&safety/img4.png",
  accountProtection:
    "/images/trust&safety/img1.png",
  securePayments:
    "/images/trust&safety/img3.png",
  marketplaceSafety:
    "/images/trust&safety/img2.png",
  disputeSupport:
    "/images/trust&safety/img5.png",
};

interface TrustSectionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
}

const TRUST_SECTIONS: TrustSectionItem[] = [
  {
    id: "safer-way",
    title: "A Safer Way to Work Together",
    description:
      "Whether you're hiring talent or finding your next opportunity, Workvence is designed to help you make informed decisions and work with confidence.",
    imageUrl: DUMMY_IMAGES.saferWay,
    alt: "A Safer Way to Work Together",
  },
  {
    id: "account-protection",
    title: "Account Protection",
    description:
      "We use security measures to help protect your account and personal information.",
    imageUrl: DUMMY_IMAGES.accountProtection,
    alt: "Account Protection",
  },
  {
    id: "secure-payments",
    title: "Secure Payments",
    description:
      "Payments are handled through secure payment infrastructure, helping protect both clients and talent throughout a project.",
    imageUrl: DUMMY_IMAGES.securePayments,
    alt: "Secure Payments",
  },
  {
    id: "marketplace-safety",
    title: "Marketplace Safety",
    description:
      "We monitor activity and take action against suspicious, fraudulent, or abusive behavior.",
    imageUrl: DUMMY_IMAGES.marketplaceSafety,
    alt: "Marketplace Safety",
  },
  {
    id: "dispute-support",
    title: "Dispute Support",
    description:
      "When something doesn't go as expected, our support process helps both sides resolve issues fairly.",
    imageUrl: DUMMY_IMAGES.disputeSupport,
    alt: "Dispute Support",
  },
];

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased">
      {/* Page Container */}
      <div className="w-full container mx-auto px-4 md:px-6 py-6 sm:py-8 md:py-10">
        {/* 1. Hero Banner Card */}
        <section
          aria-label="Trust and Safety Banner"
          className="w-full bg-[#22172A] rounded-[10px] py-16 sm:py-20 md:py-24 lg:py-28 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs"
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2.5 text-xs sm:text-[13px] text-[#C2A9D6]/80 tracking-wide mb-6 sm:mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5 stroke-[1.8]" />
            </Link>
            <span className="text-[#C2A9D6]/40 text-xs select-none">/</span>
            <span className="font-normal text-[#C2A9D6]">Trust &amp; Safety</span>
          </nav>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal italic tracking-tight text-[#D8B4E2] leading-[1.12] sm:leading-[1.08] select-none">
            Work with
            <br />
            Confidence
          </h1>
        </section>

        {/* 2. Feature Rows */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-28 pb-20 sm:pb-28 md:pb-36">
          {TRUST_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-center"
            >
              {/* Left Column: Text */}
              <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-center">
                <h2 className="font-sf-pro font-normal text-[#292929] text-2xl sm:text-3xl md:text-[38px] lg:text-[48px] leading-[1.2] lg:leading-normal tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-5 font-inter font-normal text-[#6E6E6E] text-sm sm:text-[15px] md:text-[16px] leading-[22px] max-w-[460px]">
                  {section.description}
                </p>
              </div>

              {/* Right Column: Image Card */}
              <div className="md:col-span-7 lg:col-span-7">
                <div className="relative w-full aspect-[16/9] sm:aspect-[1.85/1] rounded-[10px] overflow-hidden bg-gray-100 shadow-xs border border-black/[0.04]">
                  <img
                    src={section.imageUrl}
                    alt={section.alt}
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
