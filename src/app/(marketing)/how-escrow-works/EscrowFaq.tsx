"use client";

import React from "react";
import { FaqAccordion, FaqItem } from "@/components/ui/FaqAccordion";

export type { FaqItem };

interface EscrowFaqProps {
  faqs: FaqItem[];
}

export default function EscrowFaq({ faqs }: EscrowFaqProps) {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-[6px] p-4 sm:p-8 shadow-2xs">
      <FaqAccordion items={faqs} defaultOpenIndex={0} />
    </div>
  );
}
