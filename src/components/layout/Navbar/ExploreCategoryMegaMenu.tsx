"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { AdminCategory } from "@/hooks/useAdminCategories";

interface ExploreCategoryMegaMenuProps {
  categories: AdminCategory[];
  isOpen: boolean;
  isLoading?: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const ExploreCategoryMegaMenu: React.FC<ExploreCategoryMegaMenuProps> = ({
  categories,
  isOpen,
  isLoading = false,
  onOpen,
  onClose,
  triggerRef,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle pointer enter/leave with 200ms grace period and instant re-entry cancellation
  const handlePointerEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    onOpen();
  };

  const handlePointerLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      // Check if keyboard focus is currently inside the panel or trigger before closing
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (panelRef.current?.contains(activeEl) || triggerRef.current?.contains(activeEl))
      ) {
        return;
      }
      onClose();
    }, 200);
  };

  // Keyboard navigation and escape handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, triggerRef]);

  // Dismiss if viewport resized below desktop width (1024px)
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  // Loading skeleton state when categories are being fetched from backend
  if (isLoading && categories.length === 0) {
    return (
      <div
        ref={panelRef}
        role="region"
        aria-label="Loading Categories"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-[calc(100vw-32px)] max-w-[1240px] bg-white border border-gray-200/90 rounded-[6px] shadow-2xl z-[60] p-7 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(4)].map((_, colIdx) => (
            <div key={colIdx} className="space-y-6">
              {[...Array(2)].map((_, catIdx) => (
                <div key={catIdx} className="space-y-2.5">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-1.5 pt-1 pl-1">
                    <div className="h-3.5 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3.5 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state if backend returns no categories
  if (categories.length === 0) {
    return (
      <div
        ref={panelRef}
        role="region"
        aria-label="No Categories"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-[calc(100vw-32px)] max-w-[500px] bg-white border border-gray-200/90 rounded-[6px] shadow-2xl z-[60] p-8 text-center text-sm text-gray-500 animate-in fade-in duration-150"
      >
        No categories found from server.
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Explore Categories Mega Menu"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-[calc(100vw-32px)] max-w-[1240px] bg-white border border-gray-200/90 rounded-[6px] shadow-2xl z-[60] overflow-hidden p-6 lg:p-7 max-h-[580px] overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:transition-none motion-reduce:animate-none"
    >
      {/* COLUMN-WISE PARENT CATEGORIES WITH SUBCATEGORIES UNDERNEATH */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 [column-fill:_balance]">
        {categories.map((parentCat) => {
          const subcategories = Array.isArray(parentCat.children)
            ? parentCat.children
            : [];

          return (
            <div
              key={parentCat.id || parentCat.slug}
              className="break-inside-avoid mb-7"
            >
              {/* Parent Category Heading */}
              <div className="pb-1.5 mb-2.5 flex items-center justify-between group/parent">
                <Link
                  href={`/packages?category=${encodeURIComponent(parentCat.slug)}`}
                  onClick={onClose}
                  className="text-[14px] font-semibold font-inter text-gray-900 group-hover/parent:text-[#0D6D5F] transition-colors flex items-center gap-1.5 leading-snug"
                >
                  <span>{parentCat.name}</span>
                  <FiArrowRight className="text-xs opacity-0 -translate-x-1 group-hover/parent:opacity-100 group-hover/parent:translate-x-0 transition-all text-[#0D6D5F]" />
                </Link>
              </div>

              {/* Subcategories under the Parent Category */}
              {subcategories.length > 0 ? (
                <div className="space-y-2.5">
                  {subcategories.map((sub: any) => {
                    const niches = Array.isArray(sub.children) ? sub.children : [];

                    return (
                      <div key={sub.id || sub.slug} className="space-y-1">
                        {/* Subcategory Name */}
                        <Link
                          href={`/packages?category=${encodeURIComponent(sub.slug)}&view=gigs`}
                          onClick={onClose}
                          className={`text-[13px] leading-tight block transition-colors ${niches.length > 0
                            ? "font-semibold text-gray-800 font-inter hover:text-[#0D6D5F]"
                            : "font-normal text-gray-600 font-inter hover:text-[#0D6D5F] hover:underline"
                            }`}
                        >
                          {sub.name}
                        </Link>

                        {/* Nested Niches / Services if present */}
                        {niches.length > 0 && (
                          <ul className="space-y-1 pl-2 border-l border-gray-100 my-1">
                            {niches.map((niche: any) => (
                              <li key={niche.id || niche.slug}>
                                <Link
                                  href={`/packages?category=${encodeURIComponent(niche.slug)}&view=gigs`}
                                  onClick={onClose}
                                  className="text-[12px] text-gray-600 font-inter hover:text-[#0D6D5F] hover:underline transition-colors block truncate leading-snug"
                                >
                                  {niche.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Leaf parent category without subcategories */
                <div>


                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreCategoryMegaMenu;
