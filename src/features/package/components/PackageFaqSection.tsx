"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaqItem } from "../utils/packageDetailsNormalizer";

interface PackageFaqSectionProps {
  faqs: FaqItem[];
}

export const PackageFaqSection: React.FC<PackageFaqSectionProps> = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div id="section-faq" className="scroll-mt-36 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Frequently asked questions
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
          Blog, Business House
        </span>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-gray-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group py-1"
              >
                <span className={`text-[14.5px] sm:text-[15px] font-semibold transition-colors ${
                  isOpen ? "text-teal-800" : "text-gray-900 group-hover:text-teal-700"
                }`}>
                  {faq.question}
                </span>
                <FiChevronDown
                  className={`w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-teal-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2.5 text-[14px] text-gray-600 leading-relaxed animate-fadeIn pr-6">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
