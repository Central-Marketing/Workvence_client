"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const TrustProtection = () => {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Escrow Image Mockup */}
          <div className="w-full flex items-center justify-center">
            <div className="w-full relative overflow-hidden rounded-[20px] sm:rounded-[24px] shadow-sm">
              <Image
                src="/media/escrow.png"
                alt="Your Money Stays Yours Until The Work Is Right."
                width={680}
                height={460}
                priority
                className="w-full h-auto object-cover rounded-[20px] sm:rounded-[24px]"
              />
            </div>
          </div>

          {/* Right Column: Typography & Escrow CTA */}
          <div className="w-full flex flex-col justify-between self-stretch py-2 lg:py-4">
            {/* Main Headline */}
            <div>
              <h2 className="font-sf-pro font-[510] text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] text-[#222427] leading-[1.2] tracking-tight">
                Your Money Stays Yours Until
                <br />
                The Work Is Right.
              </h2>
            </div>

            {/* Description & CTA */}
            <div className="mt-8 sm:mt-10 lg:mt-14 space-y-6 sm:space-y-7">
              <p className="font-sf-pro font-normal text-[14px] sm:text-[15px] md:text-[16px] text-[#667085] leading-[1.65] w-full">
                When you order, your payment goes into secure escrow — the seller can&apos;t
                touch it until you approve the delivery. If the work isn&apos;t delivered or
                doesn&apos;t match what was agreed, you&apos;re protected by our money-back
                guarantee and can open a dispute for a platform officer to resolve. No
                awkward chasing, no lost payments.
              </p>

              <div>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] bg-black text-white font-sf-pro font-medium text-[14px] sm:text-[15px] hover:bg-black/90 hover:shadow-sm active:scale-[0.98] transition-all duration-200 w-fit"
                >
                  <span>How Escrow Works</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustProtection;
