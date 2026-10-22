"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";

export interface CookieCategories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategories: CookieCategories;
  onSave: (categories: CookieCategories) => void;
  onAcceptAll: () => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({
  isOpen,
  onClose,
  initialCategories,
  onSave,
  onAcceptAll,
}) => {
  const [categories, setCategories] = useState<CookieCategories>(initialCategories);

  if (!isOpen) return null;

  const handleToggle = (key: keyof Omit<CookieCategories, "essential">) => {
    setCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-[12px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 id="cookie-preferences-title" className="text-lg sm:text-xl font-bold text-slate-900">
              Cookie Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize which cookies you want to allow on Workvence.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Category Accordions / Toggles */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* 1. Essential Cookies */}
          <div className="p-4 rounded-[8px] bg-slate-50/80 border border-slate-200/70 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-sm sm:text-[15px] text-slate-900">
                Strictly Necessary Cookies
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider shrink-0">
                Always Active
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Required for core functionality including user authentication, security, Stripe escrow sessions, and live chat socket connections. These cannot be disabled.
            </p>
          </div>

          {/* 2. Analytics Cookies */}
          <div className="p-4 rounded-[8px] bg-white border border-slate-200 flex flex-col gap-1.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="toggle-analytics" className="font-semibold text-sm sm:text-[15px] text-slate-900 cursor-pointer">
                Analytics & Performance
              </label>
              <button
                id="toggle-analytics"
                type="button"
                role="switch"
                aria-checked={categories.analytics}
                onClick={() => handleToggle("analytics")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  categories.analytics ? "bg-[#0B403F]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    categories.analytics ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Help us understand how users navigate Workvence by measuring gig impressions, search effectiveness, and site performance anonymously.
            </p>
          </div>

          {/* 3. Marketing Cookies */}
          <div className="p-4 rounded-[8px] bg-white border border-slate-200 flex flex-col gap-1.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="toggle-marketing" className="font-semibold text-sm sm:text-[15px] text-slate-900 cursor-pointer">
                Marketing & Retargeting
              </label>
              <button
                id="toggle-marketing"
                type="button"
                role="switch"
                aria-checked={categories.marketing}
                onClick={() => handleToggle("marketing")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  categories.marketing ? "bg-[#0B403F]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    categories.marketing ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Used to track affiliate commissions, deliver personalized service recommendations, and measure promotional campaign conversion rates.
            </p>
          </div>

          {/* 4. Functional Cookies */}
          <div className="p-4 rounded-[8px] bg-white border border-slate-200 flex flex-col gap-1.5 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="toggle-functional" className="font-semibold text-sm sm:text-[15px] text-slate-900 cursor-pointer">
                Functional & Experience
              </label>
              <button
                id="toggle-functional"
                type="button"
                role="switch"
                aria-checked={categories.functional}
                onClick={() => handleToggle("functional")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  categories.functional ? "bg-[#0B403F]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    categories.functional ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enable advanced marketplace features like remembering your filter preferences, preferred currency, and recently saved package drafts.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="fiverr"
            onClick={onClose}
            className="w-full sm:w-auto h-[40px] px-5 font-semibold text-slate-700 border-slate-300"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="brand"
            size="md"
            radius="fiverr"
            onClick={() => onSave(categories)}
            className="w-full sm:w-auto h-[40px] px-6 font-semibold !bg-[#0B403F] hover:!bg-[#082E2D] text-white"
          >
            Save Preferences
          </Button>

          <Button
            type="button"
            variant="brand"
            size="md"
            radius="fiverr"
            onClick={onAcceptAll}
            className="w-full sm:w-auto h-[40px] px-6 font-semibold !bg-[#0B403F] hover:!bg-[#082E2D] text-white shadow-xs"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferencesModal;
