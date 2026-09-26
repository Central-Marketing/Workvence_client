"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

interface HowToSellFaqProps {
  faqs: FaqItem[];
}

export default function HowToSellFaq({ faqs }: HowToSellFaqProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-5 cursor-pointer shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
          onClick={() => setOpenFaq(openFaq === i ? null : i)}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#0f172a]">{faq.q}</h4>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-[#0D6D5F]" : ""
                }`}
            />
          </div>
          {openFaq === i && (
            <p className="text-xs sm:text-[13px] text-gray-600 pt-3 mt-3 border-t border-[rgba(0,0,0,0.06)] leading-relaxed font-normal">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
