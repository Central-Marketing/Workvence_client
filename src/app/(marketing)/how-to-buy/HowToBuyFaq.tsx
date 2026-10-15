"use client";

import React from "react";
import { FaqAccordion, FaqItem } from "@/components/ui/FaqAccordion";

export type { FaqItem };

interface HowToBuyFaqProps {
  faqs: FaqItem[];
}

export default function HowToBuyFaq({ faqs }: HowToBuyFaqProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 shadow-2xs">
      <FaqAccordion items={faqs} defaultOpenIndex={0} />
    </div>
  );
}
