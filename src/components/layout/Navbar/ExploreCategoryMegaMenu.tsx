"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiChevronRight, FiArrowRight } from "react-icons/fi";
import { AdminCategory } from "@/hooks/useAdminCategories";
import { getFallbackSubcategoryBanner } from "@/data/categoryTaxonomy";

interface ExploreCategoryMegaMenuProps {
  categories: AdminCategory[];
  isOpen: boolean;
  isLoading?: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const isValidImageUrl = (url: unknown): boolean => {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
};

export const ExploreCategoryMegaMenu: React.FC<ExploreCategoryMegaMenuProps> = ({
  categories,
  isOpen,
  isLoading = false,
  onOpen,
  onClose,
  triggerRef,
}) => {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Category & Subcategory selection state for cascading drill-down
  const [activeCatId, setActiveCatId] = useState<string>("");
  const [activeSubId, setActiveSubId] = useState<string>("");

  // Sync initial selection when categories are loaded or changed
  useEffect(() => {
    if (categories && categories.length > 0) {
      const currentCatValid = categories.some(
        (c) => (c.id || c.slug) === activeCatId
      );
      if (!currentCatValid || !activeCatId) {
        const firstCat = categories[0];
        const catKey = firstCat.id || firstCat.slug;
        setActiveCatId(catKey);

        const subList = Array.isArray(firstCat.children) ? firstCat.children : [];
        if (subList.length > 0) {
          setActiveSubId(subList[0].id || subList[0].slug);
        } else {
          setActiveSubId("");
        }
      }
    }
  }, [categories, activeCatId]);

  // Derive currently active Category, Subcategories, Active Subcategory, and Niches
  const activeCategory = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return categories.find((c) => (c.id || c.slug) === activeCatId) || categories[0];
  }, [categories, activeCatId]);

  const subcategories = useMemo(() => {
    if (!activeCategory || !Array.isArray(activeCategory.children)) return [];
    return activeCategory.children;
  }, [activeCategory]);

  const activeSubcategory = useMemo(() => {
    if (subcategories.length === 0) return null;
    return subcategories.find((s: any) => (s.id || s.slug) === activeSubId) || subcategories[0];
  }, [subcategories, activeSubId]);

  const niches = useMemo(() => {
    if (!activeSubcategory || !Array.isArray(activeSubcategory.children)) return [];
    return activeSubcategory.children;
  }, [activeSubcategory]);

  // Resolve best available banner image with fallback
  const resolvedBannerImage = useMemo(() => {
    const subBanner = activeSubcategory?.banner;
    if (isValidImageUrl(subBanner)) {
      return (subBanner as string).trim();
    }
    const catBanner = activeCategory?.banner;
    if (isValidImageUrl(catBanner)) {
      return (catBanner as string).trim();
    }
    return getFallbackSubcategoryBanner(
      activeSubcategory?.slug || activeSubcategory?.name || activeCategory?.slug || activeCategory?.name || ""
    );
  }, [activeSubcategory, activeCategory]);

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
        className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[calc(100vw-32px)] max-w-[1240px] bg-white border border-gray-200 rounded-[10px] shadow-2xl z-[60] p-7 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
      >
        <div className="flex gap-6 h-[440px]">
          <div className="w-[240px] space-y-3 border-r border-gray-100 pr-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="w-[240px] space-y-3 border-r border-gray-100 pr-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="flex-1 space-y-3 pr-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-7 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="w-[300px] h-full bg-gray-100 rounded-[10px] animate-pulse" />
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
        className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[calc(100vw-32px)] max-w-[500px] bg-white border border-gray-200 rounded-[10px] shadow-2xl z-[60] p-8 text-center text-sm text-gray-500 animate-in fade-in duration-150"
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
      className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-[calc(100vw-32px)] max-w-[1240px] bg-white border border-gray-200 rounded-[10px] shadow-2xl z-[60] overflow-hidden p-6 animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:transition-none motion-reduce:animate-none"
    >
      <div className="flex gap-6 h-[440px]">
        {/* COLUMN 1: CATEGORIES LIST (LEFT) */}
        <div className="w-[240px] shrink-0 border-r border-gray-100 pr-3 flex flex-col">
          <div className="px-3 pb-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Categories
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {categories.map((cat) => {
              const catKey = cat.id || cat.slug;
              const isCatActive = (activeCategory?.id || activeCategory?.slug) === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onMouseEnter={() => {
                    setActiveCatId(catKey);
                    const firstSub = Array.isArray(cat.children) ? cat.children[0] : null;
                    if (firstSub) {
                      setActiveSubId(firstSub.id || firstSub.slug);
                    } else {
                      setActiveSubId("");
                    }
                  }}
                  onClick={() => {
                    onClose();
                    router.push(`/packages?category=${encodeURIComponent(cat.slug)}`);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[13.5px] text-left transition-all cursor-pointer ${
                    isCatActive
                      ? "bg-[#F3F4F6] text-gray-900 font-semibold shadow-2xs"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal"
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <FiChevronRight
                    className={`text-sm shrink-0 transition-transform ${
                      isCatActive ? "text-gray-900 translate-x-0.5" : "text-gray-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: SUBCATEGORIES (MIDDLE-LEFT) */}
        <div className="w-[240px] shrink-0 border-r border-gray-100 pr-3 flex flex-col">
          <div className="px-3 pb-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Subcategories
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {subcategories.length > 0 ? (
              subcategories.map((sub: any) => {
                const subKey = sub.id || sub.slug;
                const isSubActive = (activeSubcategory?.id || activeSubcategory?.slug) === subKey;
                const hasNiches = Array.isArray(sub.children) && sub.children.length > 0;

                return (
                  <button
                    key={subKey}
                    type="button"
                    onMouseEnter={() => setActiveSubId(subKey)}
                    onClick={() => {
                      onClose();
                      router.push(`/packages?category=${encodeURIComponent(sub.slug)}&view=gigs`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[13px] text-left transition-all cursor-pointer ${
                      isSubActive
                        ? "bg-[#F3F4F6] text-[#0D6D5F] font-semibold shadow-2xs"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-normal"
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    {hasNiches && (
                      <FiChevronRight
                        className={`text-xs shrink-0 ${
                          isSubActive ? "text-[#0D6D5F]" : "text-gray-300"
                        }`}
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-xs text-gray-400">
                No subcategories available.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: NICHES & SERVICES (MIDDLE-RIGHT) */}
        <div className="flex-1 min-w-[240px] pr-3 flex flex-col border-r border-gray-100">
          <div className="px-3 pb-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Niches & Services
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {niches.length > 0 ? (
              niches.map((niche: any) => {
                const nicheKey = niche.id || niche.slug;
                return (
                  <Link
                    key={nicheKey}
                    href={`/packages?category=${encodeURIComponent(niche.slug)}&view=gigs`}
                    onClick={onClose}
                    className="flex items-center px-3 py-1.5 rounded-[6px] text-[13px] text-gray-600 hover:text-[#0D6D5F] hover:bg-gray-50 transition-colors font-inter group/niche"
                  >
                    <span className="truncate group-hover/niche:translate-x-0.5 transition-transform">
                      {niche.name}
                    </span>
                  </Link>
                );
              })
            ) : activeSubcategory ? (
              <div className="px-3 py-10 text-center text-xs text-gray-400 space-y-3">
                <p>All services in {activeSubcategory.name}</p>
                <Link
                  href={`/packages?category=${encodeURIComponent(activeSubcategory.slug)}&view=gigs`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0D6D5F] hover:underline"
                >
                  <span>Browse all gigs</span>
                  <FiArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-xs text-gray-400">
                Select a subcategory to view services.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 4: FEATURED BANNER CARD (RIGHT) */}
        <div className="w-[290px] shrink-0 flex flex-col">
          <div className="h-full flex flex-col justify-between p-4 rounded-[12px] bg-[#F2FBF8] border border-[#CCE8E0] relative overflow-hidden group/card shadow-xs">
            {/* Top Text Content */}
            <div className="relative z-10 space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#126D6B] text-white">
                Featured Category
              </span>
              <h4 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
                {activeSubcategory?.name || activeCategory?.name || "Services"}
              </h4>
              <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">
                {activeCategory?.description ||
                  "Connect with top-rated verified professionals for specialized services."}
              </p>
            </div>

            {/* Image Container with scale to ensure clean edges */}
            <div className="relative z-10 my-2.5 w-full aspect-[4/3] rounded-[8px] overflow-hidden bg-white shadow-xs border border-gray-200">
              <Image
                src={resolvedBannerImage}
                alt={activeSubcategory?.name || activeCategory?.name || "Category Banner"}
                fill
                unoptimized
                sizes="290px"
                className="object-cover object-center scale-[1.08] group-hover/card:scale-110 transition-transform duration-500"
              />
            </div>

            {/* CTA Button */}
            <Link
              href={`/packages?category=${encodeURIComponent(
                activeSubcategory?.slug || activeCategory?.slug || ""
              )}&view=gigs`}
              onClick={onClose}
              className="relative z-10 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] bg-[#126D6B] hover:bg-[#0D5755] text-white text-[13px] font-medium shadow-xs transition-colors group/btn cursor-pointer"
            >
              <span>Explore Services</span>
              <FiArrowRight className="text-xs group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreCategoryMegaMenu;
