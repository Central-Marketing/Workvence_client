"use client";

import { useState } from 'react';
import { Search, Star, PenTool, Zap, CircleDollarSign, Trophy } from 'lucide-react';

// Custom pixel-accurate SVG icons matching Figma
const SearchIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20 20L16.2 16.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IdBadgeIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="8.5" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 16C5.8 14.5 7 13.8 8.5 13.8C10 13.8 11.2 14.5 12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14.5 9.5H17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14.5 13.5H17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const AngledPaymentIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" transform="rotate(-30 12 12)" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5.5 10L18.5 2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 18L13 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const StarIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');

  const buyerSteps = [
    {
      title: "Search Services",
      desc: "Browse manually vetted services and top-tier expertise across categories.",
      icon: <SearchIcon className="w-7 h-7 text-[#222427]" />
    },
    {
      title: "Choose Your Expert",
      desc: "Review portfolios, verified reviews, and case studies to find your match.",
      icon: <IdBadgeIcon className="w-7 h-7 text-[#222427]" />
    },
    {
      title: "Pay Securely",
      desc: "Funds are held in secure escrow and only released when you're 100% happy.",
      icon: <AngledPaymentIcon className="w-7 h-7 text-[#222427]" />
    },
    {
      title: "Receive & Review",
      desc: "Get your high-quality delivery and share your experience with the community.",
      icon: <StarIcon className="w-7 h-7 text-[#222427]" />
    }
  ];

  const sellerSteps = [
    {
      title: "Create a Package",
      desc: "Sign up, setup your package, and offer your work to our global audience.",
      icon: <PenTool className="w-7 h-7 text-[#222427]" strokeWidth={1.8} />
    },
    {
      title: "Deliver Great Work",
      desc: "Get notified when you get an order and use our system to discuss details.",
      icon: <Zap className="w-7 h-7 text-[#222427]" strokeWidth={1.8} />
    },
    {
      title: "Get Paid",
      desc: "Get paid on time, every time. Payment is transferred to you upon completion.",
      icon: <CircleDollarSign className="w-7 h-7 text-[#222427]" strokeWidth={1.8} />
    },
    {
      title: "Build Reputation",
      desc: "Collect reviews from clients to build trust and attract even more orders.",
      icon: <Trophy className="w-7 h-7 text-[#222427]" strokeWidth={1.8} />
    }
  ];

  const steps = activeTab === 'buyer' ? buyerSteps : sellerSteps;

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 bg-white overflow-hidden">
      {/* Top 40% Ellipse Background dipping into the component */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[130%] max-w-[1700px] h-[550px] sm:h-[650px] md:h-[750px] rounded-[50%] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, #E4FEFF 0%, #E4FEFF 30%, rgba(228, 254, 255, 0.6) 55%, rgba(228, 254, 255, 0.15) 75%, transparent 88%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 md:mb-20">
          <div>
            <h2 className="font-sf-pro font-[510] text-[32px] sm:text-[38px] md:text-[48px] text-[#292929] leading-normal tracking-normal">
              From Search to Done,
              <br />
              in Four Simple Steps
            </h2>
            <p className="font-inter font-normal text-base sm:text-[15px] text-[#6E6E6E] mt-2.5">
              Every step is kept safe and transparent.
            </p>
          </div>

          {/* Toggle Tabs (Buyer / Seller) */}
          <div className="flex items-center w-[214px] h-[46px] bg-[#F4F4F6] p-[4px] rounded-[10px] border border-gray-200/50">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 h-full flex items-center justify-center px-[20px] py-[10px] rounded-[8px] font-sf-pro font-medium text-[14px] sm:text-[15px] transition-all duration-200 ${activeTab === 'buyer'
                ? 'bg-[#0B403F] text-white shadow-sm'
                : 'text-[#6E6E6E] hover:text-[#222427]'
                }`}
            >
              Buyer
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 h-full flex items-center justify-center px-[20px] py-[10px] rounded-[8px] font-sf-pro font-medium text-[14px] sm:text-[15px] transition-all duration-200 ${activeTab === 'seller'
                ? 'bg-[#0B403F] text-white shadow-sm'
                : 'text-[#6E6E6E] hover:text-[#222427]'
                }`}
            >
              Seller
            </button>
          </div>
        </div>

        {/* Steps Grid with Clean Dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EEEEEE]">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col py-6 sm:py-4 ${index === 0 ? 'sm:pr-6 lg:pr-8 sm:pl-0' : 'sm:px-6 lg:px-8'
                }`}
            >
              <div className="mb-5 sm:mb-6">
                {step.icon}
              </div>
              <h3 className="font-sf-pro font-bold text-[16px] sm:text-[17px] md:text-[24px] text-[#434343] mb-2 sm:mb-2.5">
                {step.title}
              </h3>
              <p className="font-inter font-normal text-[13px] sm:text-[14px] md:text-[20px] text-[#868686] leading-6 tracking-wide">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
