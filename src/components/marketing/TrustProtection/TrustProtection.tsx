"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

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
              <h2 className="font-sf-pro font-[510] text-[26px] min-[400px]:text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] macbook:text-[46px] 2xl:text-[48px] text-[#292929] leading-tight sm:leading-[1.18] tracking-tight sm:tracking-normal">
                Your Money Stays Yours Until
                <br />
                The Work Is Right.
              </h2>
            </div>

            {/* Description & CTA */}
            <div className="mt-8 sm:mt-10 lg:mt-14 space-y-6 sm:space-y-7">
              <p className="font-inter font-normal text-base text-[#6E6E6E] mt-2.5">
                When you order, your payment goes into secure escrow — the seller can&apos;t
                touch it until you approve the delivery. If the work isn&apos;t delivered or
                doesn&apos;t match what was agreed, you&apos;re protected by our money-back
                guarantee and can open a dispute for a platform officer to resolve. No
                awkward chasing, no lost payments.
              </p>

              <div>
                <Button
                  href="/faq"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                  rightIcon={<ArrowRight size={16} strokeWidth={2} />}
                  className="w-fit h-[40px] text-[16px] font-semibold px-5"
                >
                  How Escrow Works
                </Button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustProtection;
