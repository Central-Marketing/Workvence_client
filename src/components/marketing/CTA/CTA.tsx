"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components';

const MoneyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M6 12H6.01M18 12H18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CTA = () => {
  return (
    <section className="w-full pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-[80px] min-[1400px]:pb-[100px] bg-white">
      <div className="container mx-auto px-4 md:px-6">

        {/* Main Background Frame */}
        <div
          className="relative w-full max-w-[1760px] mx-auto rounded-[6px] px-6 sm:px-10 md:px-14 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden bg-cover bg-center bg-no-repeat shadow-xs"
          style={{
            backgroundImage: "url('/media/AFreelancerBG.png')",
          }}
        >

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start justify-center">

              {/* Moneyback Guarantee Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#E8F8DE] text-[#244E18] font-sf-pro font-medium text-[12px] sm:text-[13px] mb-5 sm:mb-6 shadow-sm">
                <MoneyIcon className="w-4 h-4 text-[#244E18]" />
                <span>100% moneyback guarantee</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-sf-pro font-[510] text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] text-white  mb-4 sm:mb-5 leading-none">
                Are You A Freelancer?
                <br />
                Earn Globally.
              </h2>

              {/* Description Paragraph */}
              <p className="font-inter font-normal text-base sm:text-[15px] text-[#C7C7C7] mb-3.5">
                Reach international buyers, get paid in full with fast, secure payouts, and grow your
                business on a platform built on trust. Applications are reviewed to keep quality high.
              </p>

              {/* CTA Button */}
              <div>
                <Button
                  href="/register?seller=true"
                  size="md"
                  radius="fiverr"
                  rightIcon={<ArrowRight size={16} strokeWidth={2} />}
                  className="bg-white hover:bg-gray-100 text-[#112131] border-transparent font-semibold h-[40px] text-[16px] px-6 shadow-sm"
                >
                  Become A Seller
                </Button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CTA;