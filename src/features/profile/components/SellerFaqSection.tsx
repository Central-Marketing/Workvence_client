"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { SellerFaqItem } from "../utils/sellerProfileNormalizer";

interface SellerFaqSectionProps {
  faqs: SellerFaqItem[];
}

export const SellerFaqSection: React.FC<SellerFaqSectionProps> = ({ faqs }) => {
  // First item open by default matching screenshot
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div id="section-faq" className="scroll-mt-36 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-16 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
          Frequently asked questions
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-100/80 border border-gray-200/60 px-3 py-1 rounded-md">
          Blog, Business House
        </span>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-gray-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className="py-4 sm:py-5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-[15px] font-semibold font-sf-pro text-gray-900 group-hover:text-teal-700 transition-colors">
                  {faq.question}
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-teal-600 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-teal-700" : ""
                  }`}
                >
                  <FiChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed font-normal font-sf-pro pr-4 sm:pr-8 animate-fadeIn">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SellerFaqSection;
