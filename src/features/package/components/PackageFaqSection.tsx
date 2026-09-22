"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "@/components/ui";
import { FaqItem } from "../utils/packageDetailsNormalizer";

interface PackageFaqSectionProps {
  faqs?: FaqItem[];
}

export const PackageFaqSection: React.FC<PackageFaqSectionProps> = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div id="section-faq" className="scroll-mt-36 bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 mb-10 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-[20px] font-bold font-sf-pro text-gray-900">
          Frequently Asked Questions
        </h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
          {faqs.length} {faqs.length === 1 ? 'Question' : 'Questions'}
        </span>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-gray-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => toggleFaq(idx)}
                className="w-full !p-0 !min-h-0 !h-auto flex items-center justify-between gap-4 text-left cursor-pointer group py-1"
                rightIcon={
                  <FiChevronDown
                    className={`w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-brand-green" : ""
                      }`}
                  />
                }
              >
                <span className={`text-[14px] font-semibold transition-colors ${isOpen ? "text-brand-green" : "text-gray-900 group-hover:text-brand-green"
                  }`}>
                  {faq.question}
                </span>
              </Button>

              {isOpen && (
                <div className="mt-4 text-[14px] text-gray-600 leading-relaxed animate-fadeIn pr-6 whitespace-pre-line">
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
