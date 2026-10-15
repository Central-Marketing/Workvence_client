"use client";

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export interface FaqItem {
  q?: string;
  question?: string;
  a?: string;
  answer?: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
  defaultOpenIndex?: number | null;
  allowMultiple?: boolean;
  className?: string;
  maxItems?: number;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  items = [],
  defaultOpenIndex = 0,
  allowMultiple = false,
  className = "",
  maxItems,
}) => {
  // Support either single-index or multi-index open states
  const [openIndexes, setOpenIndexes] = useState<number[]>(() => {
    if (defaultOpenIndex === null || defaultOpenIndex === undefined) return [];
    return [defaultOpenIndex];
  });

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const displayedItems = typeof maxItems === "number" ? items.slice(0, maxItems) : items;

  const toggleFaq = (idx: number) => {
    setOpenIndexes((prev) => {
      const isAlreadyOpen = prev.includes(idx);
      if (allowMultiple) {
        return isAlreadyOpen ? prev.filter((i) => i !== idx) : [...prev, idx];
      }
      return isAlreadyOpen ? [] : [idx];
    });
  };

  return (
    <div className={`divide-y divide-gray-100 ${className}`.trim()}>
      {displayedItems.map((faq, idx) => {
        const questionText = faq.question ?? faq.q ?? "";
        const answerText = faq.answer ?? faq.a ?? "";
        const isOpen = openIndexes.includes(idx);

        return (
          <div key={idx} className="py-4 sm:py-5 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between gap-4 text-left group hover:bg-transparent p-0 min-h-0 h-auto cursor-pointer focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-[15px] font-semibold font-sf-pro text-gray-900 group-hover:text-teal-700 transition-colors">
                {questionText}
              </span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-teal-600 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-teal-700" : ""
                  }`}
              >
                <FiChevronDown className="w-4 h-4" />
              </span>
            </button>

            {isOpen && (
              <div className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed font-normal font-sf-pro pr-4 sm:pr-8 animate-fadeIn">
                <p className="whitespace-pre-line">{answerText}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface FaqCardProps extends FaqAccordionProps {
  id?: string;
  title?: string;
  badge?: string;
  headerBorder?: boolean;
  containerClassName?: string;
}

export const FaqCard: React.FC<FaqCardProps> = ({
  id = "section-faq",
  title = "Frequently asked questions",
  badge,
  headerBorder = true,
  containerClassName = "",
  items = [],
  defaultOpenIndex = 0,
  allowMultiple = false,
  className = "",
  maxItems,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div
      id={id}
      className={`scroll-mt-36 bg-[#f5f5f5] border border-gray-100 rounded-[6px] p-6 sm:p-8 shadow-2xs ${containerClassName}`.trim()}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between gap-4 mb-6 ${headerBorder ? "pb-3 sm:pb-4 border-b border-gray-100" : ""
          }`.trim()}
      >
        <h2 className="text-xl sm:text-2xl font-bold font-sf-pro text-gray-900 tracking-tight">
          {title}
        </h2>
        {badge && (
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-[6px]">
            {badge}
          </span>
        )}
      </div>

      {/* Accordion */}
      <FaqAccordion
        items={items}
        defaultOpenIndex={defaultOpenIndex}
        allowMultiple={allowMultiple}
        className={className}
        maxItems={maxItems}
      />
    </div>
  );
};

export default FaqAccordion;
