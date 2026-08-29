"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const MoneyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M6 12H6.01M18 12H18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CTA = () => {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">

        {/* Main Background Frame (1760x800 with 10px Radius) */}
        <div
          className="relative w-full max-w-[1760px] mx-auto rounded-[10px] px-6 sm:px-10 md:px-14 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
          style={{
            background: '#052121',
          }}
        >
          {/* Bottom Ellipse Glow (1610x997, 40% top part visible rising from bottom) */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[60%] w-[95%] max-w-[1610px] h-[550px] sm:h-[750px] lg:h-[997px] rounded-[50%] pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse at center, #004443 0%, #004443 45%, rgba(0, 68, 67, 0.7) 70%, transparent 90%)',
              filter: 'blur(50px)',
            }}
          />

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
                <Link
                  href="/register?seller=true"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-[10px] bg-white text-[#112131] font-sf-pro font-medium text-[14px] sm:text-[15px] hover:bg-gray-100 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                >
                  <span>Become A Seller</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
              </div>

            </div>

            {/* Right 3D Graphic Column */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[500px] flex items-center justify-center">
                <Image
                  src="/media/cta.png"
                  alt="Workvence - Are You A Freelancer? Earn Globally."
                  width={560}
                  height={560}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CTA;