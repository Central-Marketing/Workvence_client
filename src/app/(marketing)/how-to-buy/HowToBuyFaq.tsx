"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

interface HowToBuyFaqProps {
  faqs: FaqItem[];
}

export default function HowToBuyFaq({ faqs }: HowToBuyFaqProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-5 cursor-pointer"
          onClick={() => setOpenFaq(openFaq === i ? null : i)}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#0f172a]">{faq.q}</h4>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                openFaq === i ? "rotate-180 text-[#327C73]" : ""
              }`}
            />
          </div>
          {openFaq === i && (
            <p className="text-xs text-gray-600 pt-3 mt-3 border-t border-gray-200 leading-relaxed font-normal">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
