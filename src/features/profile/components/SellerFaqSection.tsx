"use client";

import React from "react";
import { SellerFaqItem } from "../utils/sellerProfileNormalizer";
import { FaqCard } from "@/components/ui/FaqAccordion";

interface SellerFaqSectionProps {
  faqs?: SellerFaqItem[];
}

export const SellerFaqSection: React.FC<SellerFaqSectionProps> = ({ faqs = [] }) => {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  return (
    <FaqCard
      id="section-faq"
      title="Frequently asked questions"
      items={faqs}
      maxItems={5}
      defaultOpenIndex={0}
      headerBorder={true}
    />
  );
};

export default SellerFaqSection;
