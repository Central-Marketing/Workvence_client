"use client";

import React from "react";
import { FaqAccordion, FaqItem } from "@/components/ui/FaqAccordion";

export type IpFaqItem = FaqItem;

interface IpFaqProps {
  faqs: IpFaqItem[];
}

export default function IpFaq({ faqs }: IpFaqProps) {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[6px] p-6 sm:p-8 shadow-2xs">
      <FaqAccordion items={faqs} defaultOpenIndex={0} />
    </div>
  );
}
