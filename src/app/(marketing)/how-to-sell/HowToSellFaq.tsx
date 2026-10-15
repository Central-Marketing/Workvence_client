"use client";

import React from "react";
import { FaqAccordion, FaqItem } from "@/components/ui/FaqAccordion";

export type { FaqItem };

interface HowToSellFaqProps {
  faqs: FaqItem[];
}

export default function HowToSellFaq({ faqs }: HowToSellFaqProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 shadow-2xs">
      <FaqAccordion items={faqs} defaultOpenIndex={0} />
    </div>
  );
}
