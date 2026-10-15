"use client";

import React from "react";
import { FaqItem } from "../utils/packageDetailsNormalizer";
import { FaqCard } from "@/components/ui/FaqAccordion";

interface PackageFaqSectionProps {
  faqs?: FaqItem[];
}

export const PackageFaqSection: React.FC<PackageFaqSectionProps> = ({ faqs = [] }) => {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  const badgeText = `${faqs.length} ${faqs.length === 1 ? "Question" : "Questions"}`;

  return (
    <FaqCard
      id="section-faq"
      title="Frequently Asked Questions"
      badge={badgeText}
      items={faqs}
      defaultOpenIndex={0}
      headerBorder={true}
    />
  );
};

export default PackageFaqSection;