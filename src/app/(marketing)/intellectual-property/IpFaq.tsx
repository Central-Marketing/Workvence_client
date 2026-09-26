"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface IpFaqItem {
  q: string;
  a: string;
}

interface IpFaqProps {
  faqs: IpFaqItem[];
}

export default function IpFaq({ faqs }: IpFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="space-y-3.5 max-w-3xl mx-auto">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`border rounded-[6px] transition-colors duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-[#0D6D5F]/40 shadow-xs"
                : "bg-white hover:bg-white border-[rgba(0,0,0,0.10)]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-sm sm:text-base text-[#0f172a]">
                {faq.q}
              </span>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen
                    ? "bg-[#0D6D5F]/10 text-[#0D6D5F] rotate-180"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/80">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
