"use client";

import React, { useEffect, useRef } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export interface CustomDesignOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller?: {
    name?: string;
    username?: string;
    image?: string;
    avatar?: string;
    isOnline?: boolean;
  };
  categoryName?: string;
  onCtaClick?: () => void;
}

export const CustomDesignOfferModal: React.FC<CustomDesignOfferModalProps> = ({
  isOpen,
  onClose,
  seller,
  categoryName = "Design",
  onCtaClick,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus first interactive element inside modal
      setTimeout(() => {
        const focusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sellerAvatar =
    seller?.image || seller?.avatar || "/media/noavatar.png";

  const isDesignCategory =
    !categoryName ||
    categoryName.toLowerCase().includes("design") ||
    categoryName.toLowerCase().includes("graphics") ||
    categoryName.toLowerCase().includes("ui") ||
    categoryName.toLowerCase().includes("logo");

  const subtitleText = isDesignCategory
    ? "Have a custom design in mind?"
    : `Have a custom ${categoryName.toLowerCase()} project in mind?`;

  const headingText = isDesignCategory
    ? "Bring your design idea to life"
    : `Bring your ${categoryName.toLowerCase()} project to life`;

  const descText = isDesignCategory
    ? "Share your style, format, and deadline once. Compare tailored proposals from design professionals."
    : `Share your scope, format, and deadline once. Compare tailored proposals from verified ${categoryName.toLowerCase()} specialists.`;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-modal-title"
        aria-describedby="custom-modal-desc"
        className="bg-white rounded-[20px] max-w-[480px] w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col items-center text-center relative transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Split Visual Banner */}
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-pink-500 via-rose-400 to-lime-200 overflow-hidden shrink-0">
          <img
            src="/media/custom-design-banner.jpg"
            alt="Custom Design"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient if local image fails
              (e.currentTarget as HTMLElement).style.opacity = "0";
            }}
          />

          {/* Close Button (X) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Floating Seller Avatar Overlapping Banner */}
        <div className="relative -mt-10 sm:-mt-11 w-20 h-20 sm:w-[86px] sm:h-[86px] rounded-full border-4 border-white bg-white shadow-md shrink-0">
          <img
            src={sellerAvatar}
            alt={seller?.name || seller?.username || "Seller"}
            className="w-full h-full rounded-full object-cover"
          />
          {seller?.isOnline !== false && (
            <span
              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
              title="Online"
            />
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 pt-3 sm:pt-4 flex flex-col items-center gap-2.5 w-full">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-500 tracking-wide">
            {subtitleText}
          </span>

          <h2
            id="custom-modal-title"
            className="text-2xl  font-semibold text-[#0f172a] tracking-tight leading-snug"
          >
            {headingText}
          </h2>

          <p
            id="custom-modal-desc"
            className="text-xs sm:text-[14px] text-slate-600 leading-relaxed max-w-[360px] font-normal"
          >
            {descText}
          </p>

          <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
            Free to post. Your draft stays private until you publish it.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col items-center gap-3 mt-3 sm:mt-4">
            <Button
              type="button"
              variant="dark"
              size="lg"
              radius="fiverr"
              className="w-full text-white font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition duration-200 cursor-pointer"
              onClick={() => {
                if (onCtaClick) {
                  onCtaClick();
                }
              }}
            >
              Get tailored proposals <ArrowRight size={16} />
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="text-[16px] font-semibold text-slate-700 hover:text-slate-800 transition py-1 cursor-pointer"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDesignOfferModal;
