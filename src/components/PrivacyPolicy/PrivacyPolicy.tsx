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

const PrivacyPolicy = () => {
  const [activeCategory, setActiveCategory] = useState("All services");

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
        <div className="w-full bg-gradient-to-r from-[#f2fbf6] via-[#f7fdf9] to-[#e6f8ef] border border-[#ceefe0] rounded-3xl p-8 sm:p-12 mb-10 shadow-2xs relative overflow-hidden flex flex-wrap lg:flex-nowrap items-center justify-between gap-8">
          <div className="max-w-2xl relative z-10">
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight mb-2">
              Privacy & Data Security
            </h1>

            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1dbf73] mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Last Updated: July 2026</span>
            </div>

            <p className="text-[15px] sm:text-[16px] text-gray-600 font-normal leading-relaxed">
              Protecting your data is at the core of how we build products. This policy explains how we collect, use, and protect your personal information within the Workvence ecosystem.
            </p>
          </div>

          {/* Large Shield Check SVG Icon */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 text-[#21c074] opacity-90 relative z-10 mx-auto lg:mr-6">
            <svg viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
              <path d="M60 10L15 28.5V65C15 92.5 34.5 117.5 60 125C85.5 117.5 105 92.5 105 65V28.5L60 10Z" fill="#1dbf73" fillOpacity="0.15" stroke="#1dbf73" strokeWidth="7" strokeLinejoin="round" />
              <path d="M60 21L24 36V65C24 87.5 40 108 60 114C80 108 96 87.5 96 65V36L60 21Z" fill="#1dbf73" fillOpacity="0.2" />
              <path d="M43 65L55 77L79 51" stroke="#1dbf73" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Three Summary Feature Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">

          {/* Card 1: What We Collect */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-11 h-11 rounded-xl bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-[20px] font-semibold text-gray-900 mb-2 tracking-tight">
              What We Collect
            </h3>
            <p className="text-[14.5px] sm:text-[15px] text-gray-600 leading-relaxed font-normal">
              We collect data to provide better services—from your contact details to usage patterns on the platform.
            </p>
          </div>

          {/* Card 2: How We Use Data */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-11 h-11 rounded-xl bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-[20px] font-semibold text-gray-900 mb-2 tracking-tight">
              How We Use Data
            </h3>
            <p className="text-[14.5px] sm:text-[15px] text-gray-600 leading-relaxed font-normal">
              Your information is used to facilitate transactions, ensure security, and improve your user experience.
            </p>
          </div>

          {/* Card 3: How We Protect You */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col justify-start">
            <div className="w-11 h-11 rounded-xl bg-[#eaf8f0] text-[#1dbf73] flex items-center justify-center mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-[20px] font-semibold text-gray-900 mb-2 tracking-tight">
              How We Protect You
            </h3>
            <p className="text-[14.5px] sm:text-[15px] text-gray-600 leading-relaxed font-normal">
              We employ enterprise-grade encryption and secure escrow systems to keep your identity and funds safe.
            </p>
          </div>

        </div>

        {/* Detailed Policy Text & Highlight Boxes */}
        <div className="container space-y-10 text-[15px] sm:text-[15.5px] text-gray-600 leading-relaxed font-normal mb-16">

          <p className="text-gray-600 leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>

          <div>
            <h2 className="text-[19px] sm:text-[21px] font-semibold text-gray-900 mb-3 tracking-tight">
              What personal information do we collect from the people that visit our website or blog?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address, mailing address, phone number or other details to help you with your experience.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] sm:text-[21px] font-semibold text-gray-900 mb-3 tracking-tight">
              When do we collect information?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information from you when you subscribe to a newsletter, respond to a survey, fill out a form or enter information on our site.
            </p>
          </div>

          {/* Our Security Commitment Section */}
          <div>
            <h2 className="text-[19px] sm:text-[21px] font-semibold text-gray-900 mb-5 tracking-tight">
              Our Security Commitment
            </h2>

            {/* Two Green Callout Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">

              {/* Box 1: Escrow Payment Security */}
              <div className="bg-[#f3fbf6] border border-[#ceefe0]/90 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-2xs">
                <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#169c5e] mb-2.5 tracking-tight relative z-10">
                  Escrow Payment Security
                </h3>
                <p className="text-[14px] sm:text-[14.5px] text-gray-600 leading-relaxed relative z-10">
                  We hold funds in a neutral, secure account. Data related to your payments is never stored directly on our servers but handled by PCI-DSS compliant partners.
                </p>

                {/* Background watermark wallet icon */}
                <div className="absolute -bottom-3 -right-3 text-[#d1eedf] opacity-60 w-24 h-24 pointer-events-none select-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                    <path d="M19 7h-3V6a4 4 0 00-4-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2zM5 4h7a2 2 0 012 2v1H5V4z" />
                    <path d="M16 13a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                </div>
              </div>

              {/* Box 2: Buyer Protection */}
              <div className="bg-[#f3fbf6] border border-[#ceefe0]/90 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-2xs">
                <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#169c5e] mb-2.5 tracking-tight relative z-10">
                  Buyer Protection
                </h3>
                <p className="text-[14px] sm:text-[14.5px] text-gray-600 leading-relaxed relative z-10">
                  Your personal contact information remains private. Sellers only see what&apos;s necessary to fulfill the project, protecting you from unwanted external contact.
                </p>

                {/* Background watermark shield icon */}
                <div className="absolute -bottom-3 -right-3 text-[#d1eedf] opacity-60 w-24 h-24 pointer-events-none select-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

          <div>
            <h2 className="text-[19px] sm:text-[21px] font-semibold text-gray-900 mb-3 tracking-tight">
              How do we use your information?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:
            </p>

            <ul className="list-disc pl-6 space-y-2.5 my-4 text-gray-600">
              <li>
                To personalize user&apos;s experience and to allow us to deliver the type of content and product offerings in which you are most interested.
              </li>
              <li>
                To improve our website in order to better serve you.
              </li>
              <li>
                To administer a contest, promotion, survey or other site feature.
              </li>
            </ul>

            <div className="space-y-6 pt-2">
              <p className="text-gray-600 leading-relaxed">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don&apos;t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn&apos;t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.
              </p>
              <p className="text-gray-600 leading-relaxed">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don&apos;t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn&apos;t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.
              </p>
              <p className="text-gray-600 leading-relaxed">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don&apos;t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn&apos;t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.
              </p>
              <p className="text-gray-600 leading-relaxed">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don&apos;t look even slightly believable.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
