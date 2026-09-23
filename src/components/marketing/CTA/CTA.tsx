"use client";

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components';

const CTA = () => {
  return (
    <section className="w-full pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-[80px] min-[1400px]:pb-[100px] bg-white">
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20">

        {/* Main Background Frame - 1760px x 800px on 1920px screen */}
        <div
          className="relative isolate w-full max-w-[1760px] mx-auto rounded-[6px] overflow-hidden shadow-xs flex items-center min-h-[460px] sm:min-h-[500px] md:min-h-[540px] lg:aspect-[1760/800] 2xl:h-[800px] 2xl:min-h-[800px] px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-12 sm:py-16 md:py-20 lg:py-0"
        >
          {/* High-Resolution Full-Fidelity Background Image */}
          <Image
            src="/media/AFreelancerBG.png"
            alt="Are You A Freelancer? Earn Globally."
            fill
            priority
            quality={100}
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 100vw, 1760px"
            className="object-cover object-right md:object-center select-none pointer-events-none z-0"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full relative z-10">

            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start justify-center">

              {/* Moneyback Guarantee Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#EAFDC6] text-[#244E18] font-sf-pro font-medium text-[12px] sm:text-[13px] mb-5 sm:mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 11C3 8.23571 5.23571 6 8 6L7 8.5" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 13C21 15.7643 18.7643 18 16 18L17 15.5" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.3333 10H14.6667C12.9382 10 12.0739 10 11.537 9.48744C11 8.97487 11 8.14992 11 6.5C11 4.85008 11 4.02513 11.537 3.51256C12.0739 3 12.9382 3 14.6667 3H18.3333C20.0618 3 20.9261 3 21.463 3.51256C22 4.02513 22 4.85008 22 6.5C22 8.14992 22 8.97487 21.463 9.48744C20.9261 10 20.0618 10 18.3333 10Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.33333 21H5.66667C3.93818 21 3.07394 21 2.53697 20.4874C2 19.9749 2 19.1499 2 17.5C2 15.8501 2 15.0251 2.53697 14.5126C3.07394 14 3.93818 14 5.66667 14H9.33333C11.0618 14 11.9261 14 12.463 14.5126C13 15.0251 13 15.8501 13 17.5C13 19.1499 13 19.9749 12.463 20.4874C11.9261 21 11.0618 21 9.33333 21Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.75 17.5H7.5M8 17.5C8 17.7761 7.77614 18 7.5 18C7.22386 18 7 17.7761 7 17.5C7 17.2239 7.22386 17 7.5 17C7.77614 17 8 17.2239 8 17.5Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.75 6.5H16.5M17 6.5C17 6.77614 16.7761 7 16.5 7C16.2239 7 16 6.77614 16 6.5C16 6.22386 16.2239 6 16.5 6C16.7761 6 17 6.22386 17 6.5Z" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>100% moneyback guarantee</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-sf-pro font-[510] text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] text-white mb-4 sm:mb-5 leading-none">
                Are You A Freelancer?
                <br />
                Earn Globally.
              </h2>

              {/* Description Paragraph */}
              <p className="font-inter font-normal text-base sm:text-[15px] text-[#C7C7C7] mb-5 sm:mb-6 max-w-xl leading-relaxed">
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