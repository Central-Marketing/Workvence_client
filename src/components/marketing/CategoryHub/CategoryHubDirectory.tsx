"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSliders, FiArrowRight, FiSearch, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import useAdminCategories, { sortCategoriesWithOtherLast } from "@/hooks/useAdminCategories";
import useDebounce from "@/hooks/useDebounce";
import useDragScroll from "@/hooks/useDragScroll";
import { Button, Breadcrumb } from "@/components";

export interface CategorySubcategoryCard {
  id: string;
  title: string;
  slug: string;
  description: string;
}

export interface CategorySectionItem {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  subcategories: CategorySubcategoryCard[];
}

export interface CategoryHubDirectoryProps {
  /** Mode affects default copy (e.g. 'categories' vs 'projects') */
  mode?: "categories" | "projects";
  /** Optional custom category sections. If omitted, dynamically fetched from backend */
  categories?: CategorySectionItem[];
  /** Banner image URL or path */
  bannerImage?: string;
  /** Inverted breadcrumb label */
  breadcrumbName?: string;
  /** Main banner heading (SF Pro italic) */
  title?: string;
  /** Main banner subtitle */
  subtitle?: string;
  /** Explore all action label */
  exploreAllLabel?: string;
  /** Explore all link href */
  exploreAllHref?: string;
  /** Explore all click handler (alternative to href) */
  onExploreAll?: () => void;
  /** Subcategory card click handler (e.g. in /briefs for switching feed view) */
  onSelectSubcategory?: (catSlug: string, subcatSlug: string) => void;
  /** Custom href generator for subcategory cards */
  getSubcategoryHref?: (catSlug: string, subcatSlug: string) => string;
  /** Filter button click handler (if omitted, toggles in-page search bar) */
  onFilterClick?: () => void;
  /** Sync active category pill to URL query parameter */
  syncUrlParam?: boolean;
}

export const CategoryHubDirectory: React.FC<CategoryHubDirectoryProps> = ({
  mode = "categories",
  categories: externalCategories,
  bannerImage = mode === "projects" ? "/media/ProjectBg.png" : "/media/categoryBannerBg.png",
  breadcrumbName = mode === "projects" ? "Find Projects" : "Explore Categories",
  title = mode === "projects" ? "Projects" : "Categories",
  subtitle = mode === "projects"
    ? ""
    : "Popular picks, proven results. Find talent across all services and creative disciplines.",
  exploreAllLabel = mode === "projects" ? "Explore All Projects" : "Explore All Packages",
  exploreAllHref = mode === "projects" ? "/briefs?view=feed" : "/packages?view=gigs",
  onExploreAll,
  onSelectSubcategory,
  getSubcategoryHref,
  onFilterClick,
  syncUrlParam = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCat = syncUrlParam ? searchParams?.get("category") || "all" : "all";
  const initialSearch = syncUrlParam ? searchParams?.get("search") || "" : "";

  const [hubActivePill, setHubActivePill] = useState<string>(initialCat);
  const [search, setSearch] = useState<string>(initialSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(Boolean(initialSearch));

  // Draggable horizontal scroll for category toolbar
  const {
    ref: hubScrollRef,
    isDragging: isHubDragging,
    events: hubDragEvents,
  } = useDragScroll<HTMLDivElement>();

  // Track scroll overflow to show arrows for seeing rest of categories
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (hubScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = hubScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!hubScrollRef.current) return;
    const distance = 360;
    hubScrollRef.current.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
  };

  // Fetch real categories directly from backend API
  const { categoryList, parentCategories, isLoading } = useAdminCategories();

  // Dynamically map real categories & subcategories from backend API if not passed externally
  const dynamicCategories = useMemo<CategorySectionItem[]>(() => {
    if (externalCategories && externalCategories.length > 0) {
      return sortCategoriesWithOtherLast(
        externalCategories.map((cat: CategorySectionItem) => ({
          ...cat,
          subcategories: sortCategoriesWithOtherLast(cat.subcategories),
        }))
      );
    }

    if (!parentCategories || parentCategories.length === 0) {
      return [];
    }

    const mapped: CategorySectionItem[] = parentCategories.map((cat: any) => {
      const rawName = cat.name || cat.title || "";
      const slug = (cat.slug || rawName)
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Collect real subcategories from children
      let children: any[] = [];
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        children = cat.children;
      } else if (Array.isArray(cat.subCategories) && cat.subCategories.length > 0) {
        children = cat.subCategories;
      } else if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
        children = cat.subcategories;
      } else if (Array.isArray(categoryList)) {
        children = categoryList.filter(
          (c: any) =>
            c.parentId &&
            (c.parentId === cat.id ||
              c.parentId === cat._id ||
              c.parentName?.toLowerCase() === rawName.toLowerCase())
        );
      }

      let subcategories: CategorySubcategoryCard[] = [];

      if (children.length > 0) {
        children.forEach((ch: any) => {
          const chTitle = ch.name || ch.title || String(ch);
          const chSlug = (ch.slug || chTitle)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

          const defaultDesc =
            mode === "projects"
              ? `Explore ${chTitle} projects and opportunities.`
              : `Explore top-rated ${chTitle} services and verified packages.`;

          subcategories.push({
            id: ch.id || ch._id || chSlug,
            title: chTitle,
            slug: chSlug,
            description:
              ch.description && ch.description !== "No description provided."
                ? ch.description
                : defaultDesc,
          });

          // Check if child has deeper nested children
          const nested = ch.children || ch.subCategories || ch.subcategories;
          if (Array.isArray(nested) && nested.length > 0) {
            nested.forEach((n: any) => {
              const nTitle = n.name || n.title || String(n);
              const nSlug = (n.slug || nTitle)
                .toLowerCase()
                .trim()
                .replace(/&/g, "and")
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

              if (!subcategories.some((s) => s.slug === nSlug)) {
                subcategories.push({
                  id: n.id || n._id || nSlug,
                  title: nTitle,
                  slug: nSlug,
                  description:
                    n.description && n.description !== "No description provided."
                      ? n.description
                      : defaultDesc,
                });
              }
            });
          }
        });
      } else {
        // If parent category has no subcategories yet in backend, provide card for category itself
        subcategories = [
          {
            id: cat.id || cat._id || slug,
            title: rawName,
            slug: slug,
            description:
              cat.description && cat.description !== "No description provided."
                ? cat.description
                : mode === "projects"
                ? `Explore open briefs, tasks, and requests in ${rawName}.`
                : `Browse all available packages, services, and experts in ${rawName}.`,
          },
        ];
      }

      return {
        id: cat.id || cat._id || slug,
        name: rawName,
        slug,
        subtitle:
          cat.description && cat.description !== "No description provided."
            ? cat.description
            : mode === "projects"
            ? `Browse ${rawName} projects and start earning by bidding on work that matches your skills.`
            : `Browse verified ${rawName} packages and discover top talent for your projects.`,
        subcategories: sortCategoriesWithOtherLast(subcategories),
      };
    });

    return sortCategoriesWithOtherLast(mapped);
  }, [externalCategories, parentCategories, categoryList, mode]);

  // Sync to URL if enabled
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!syncUrlParam) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }
    if (hubActivePill && hubActivePill !== "all") {
      params.set("category", hubActivePill);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, hubActivePill, syncUrlParam]);

  // Sync external search params to local state
  useEffect(() => {
    if (!syncUrlParam) return;
    const qCat = searchParams?.get("category") || "all";
    const qSearch = searchParams?.get("search") || "";
    if (qCat !== hubActivePill) setHubActivePill(qCat);
    if (qSearch !== search) {
      setSearch(qSearch);
      if (qSearch) setIsSearchFilterOpen(true);
    }
  }, [searchParams, syncUrlParam]);

  // Monitor horizontal scroll position to show/hide navigation arrows
  useEffect(() => {
    const el = hubScrollRef.current;
    if (!el) return;
    checkScroll();
    const timer = setTimeout(checkScroll, 150);
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [dynamicCategories]);

  // Filter categories by pill and search
  const displayedCategories = useMemo(() => {
    let list = dynamicCategories;

    if (hubActivePill !== "all") {
      const pillFiltered = list.filter((c) => c.slug === hubActivePill);
      if (pillFiltered.length > 0) list = pillFiltered;
    }

    const trimmed = debouncedSearch.trim().toLowerCase();
    if (!trimmed) return list;

    return list
      .map((cat) => {
        const matchesCategory =
          cat.name.toLowerCase().includes(trimmed) ||
          (cat.subtitle && cat.subtitle.toLowerCase().includes(trimmed));

        const matchingSubcats = cat.subcategories.filter(
          (sub) =>
            sub.title.toLowerCase().includes(trimmed) ||
            sub.description.toLowerCase().includes(trimmed)
        );

        if (matchesCategory) return cat;
        if (matchingSubcats.length > 0) {
          return {
            ...cat,
            subcategories: matchingSubcats,
          };
        }
        return null;
      })
      .filter(Boolean) as CategorySectionItem[];
  }, [dynamicCategories, hubActivePill, debouncedSearch]);

  const handleHubPillClick = (slug: string) => {
    setHubActivePill(slug);
    if (slug === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(`cat-section-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleFilterToggle = () => {
    if (onFilterClick) {
      onFilterClick();
    } else {
      setIsSearchFilterOpen((prev) => !prev);
    }
  };

  const handleSubcategoryClick = (catSlug: string, subcatSlug: string) => {
    if (onSelectSubcategory) {
      onSelectSubcategory(catSlug, subcatSlug);
    }
  };

  const resolveCardHref = (catSlug: string, subcatSlug: string) => {
    if (getSubcategoryHref) {
      return getSubcategoryHref(catSlug, subcatSlug);
    }
    return `/packages?category=${encodeURIComponent(subcatSlug || catSlug)}&view=gigs`;
  };

  return (
    <div className="animate-fadeIn">
      {/* ============================================================ */}
      {/* HERO BANNER                                                  */}
      {/* ============================================================ */}
      <div className="relative w-full max-w-[1760px] mx-auto aspect-[1760/500] max-h-[500px] min-h-[200px] sm:min-h-[220px] md:min-h-[240px] rounded-[6px] overflow-hidden bg-[#130d2a] flex items-center justify-center text-center shadow-xs select-none mb-7">
        <Image
          src={bannerImage}
          alt={title}
          fill
          priority
          quality={100}
          className="object-cover object-center pointer-events-none"
          sizes="(max-width: 1760px) 100vw, 1760px"
        />
        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          <Breadcrumb
            variant="inverted"
            className="mb-2 sm:mb-3 select-none [&>ol]:justify-center text-xs"
            items={[
              {
                name: breadcrumbName,
                isLast: true,
              },
            ]}
          />
          <h1 className="italic text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] leading-tight text-white font-normal tracking-tight drop-shadow-2xs font-sf-pro">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-xs sm:text-sm md:text-[15px] font-light mt-1.5 max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE DRAG-TO-SCROLL TOOLBAR                           */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-200/80">
        <div
          ref={hubScrollRef}
          {...hubDragEvents}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 flex-1 min-w-0 select-none"
        >
          {/* Filter Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            radius="lg"
            onClick={handleFilterToggle}
            leftIcon={<FiSliders className="w-3.5 h-3.5 text-gray-600" />}
            className={`text-gray-700 font-medium text-xs sm:text-[13px] hover:text-black transition-colors px-3 py-1.5 hover:bg-gray-200/50 shrink-0 mr-1 border-none shadow-none ${
              isSearchFilterOpen ? "bg-gray-200/60 text-black font-semibold" : ""
            }`}
          >
            Filter
          </Button>

          {/* All Categories / All Projects Pill */}
          <Button
            type="button"
            variant={hubActivePill === "all" ? "dark" : "outline"}
            size="sm"
            radius="full"
            onClick={() => handleHubPillClick("all")}
            className={`px-4 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 ${
              hubActivePill === "all"
                ? "shadow-xs border-gray-900 bg-black text-white"
                : "hover:border-gray-900 hover:text-black bg-white border-gray-200/80"
            }`}
          >
            {mode === "projects" ? "All Projects" : "All Categories"}
          </Button>

          {/* Dynamic Category Hub Pills */}
          {dynamicCategories.map((cat) => {
            const isActive = hubActivePill === cat.slug;
            return (
              <Button
                key={cat.id || cat.slug}
                type="button"
                variant={isActive ? "dark" : "outline"}
                size="sm"
                radius="full"
                onClick={() => handleHubPillClick(cat.slug)}
                className={`px-4 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? "shadow-xs border-gray-900 bg-black text-white"
                    : "hover:border-gray-900 hover:text-black bg-white border-gray-200/80"
                }`}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Navigation Arrows to see rest of categories without redirecting */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="w-8 h-8 rounded-full border border-gray-200/90 bg-white hover:bg-gray-100 hover:border-gray-300 flex items-center justify-center text-gray-700 hover:text-black transition-all shadow-xs shrink-0 cursor-pointer"
              title="Previous categories"
              aria-label="Previous categories"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="w-8 h-8 rounded-full border border-gray-200/90 bg-white hover:bg-gray-100 hover:border-gray-300 flex items-center justify-center text-gray-700 hover:text-black transition-all shadow-xs shrink-0 cursor-pointer"
              title="See rest of categories"
              aria-label="See rest of categories"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* INLINE SEARCH BAR                                            */}
      {/* ============================================================ */}
      {isSearchFilterOpen && !onFilterClick && (
        <div className="mb-8 p-3 sm:p-3.5 bg-white rounded-[6px] border border-gray-200/80 shadow-xs flex items-center gap-3 animate-fadeIn">
          <FiSearch className="text-gray-400 w-4 h-4 ml-1 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${mode === "projects" ? "projects" : "categories"}, subcategories, or services...`}
            className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-700 p-1 transition-colors"
              aria-label="Clear search"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LOADING SKELETON (When backend categories are loading)        */}
      {/* ============================================================ */}
      {isLoading && dynamicCategories.length === 0 ? (
        <div className="space-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-96 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                  <div
                    key={j}
                    className="h-[86px] bg-gray-200/80 rounded-[6px] animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : displayedCategories.length > 0 ? (
        /* ============================================================ */
        /* CATEGORY SECTIONS & 4-COLUMN CARD GRIDS                      */
        /* ============================================================ */
        <div className="space-y-12 sm:space-y-14">
          {displayedCategories.map((cat) => (
            <section
              key={cat.id || cat.slug}
              id={`cat-section-${cat.slug}`}
              className="scroll-mt-6"
            >
              {/* Category Header */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h2 className="text-xl sm:text-[22px] font-bold text-gray-900 font-sf-pro tracking-tight">
                    {cat.name}
                  </h2>
                  {cat.subtitle && (
                    <p className="text-xs sm:text-[13px] text-gray-500 mt-1 max-w-3xl leading-relaxed">
                      {cat.subtitle}
                    </p>
                  )}
                </div>

                {mode !== "projects" && (
                  <Link
                    href={`/packages?category=${encodeURIComponent(cat.slug)}&view=gigs`}
                    className="text-xs font-semibold text-gray-500 hover:text-[#0D6D5F] transition-colors inline-flex items-center gap-1 group whitespace-nowrap mt-2 sm:mt-0"
                  >
                    <span>View all {cat.name}</span>
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              {/* 4-Column Subcategory Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {cat.subcategories.map((subcat) => {
                  const cardContent = (
                    <>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 group-hover:text-[#0D6D5F] transition-colors leading-snug truncate">
                          {subcat.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {subcat.description}
                        </p>
                      </div>

                      {/* Clean hover arrow */}
                      <div
                        className="shrink-0 text-gray-400 group-hover:text-gray-900 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                        aria-hidden="true"
                      >
                        <FiArrowRight className="w-4 h-4" />
                      </div>
                    </>
                  );

                  const cardClass =
                    "group bg-white rounded-[6px] border border-gray-200/80 hover:border-gray-400/80 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 min-h-[86px]";

                  if (onSelectSubcategory) {
                    return (
                      <div
                        key={subcat.id || subcat.slug}
                        onClick={() => handleSubcategoryClick(cat.slug, subcat.slug)}
                        className={cardClass}
                        role="button"
                        tabIndex={0}
                      >
                        {cardContent}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={subcat.id || subcat.slug}
                      href={resolveCardHref(cat.slug, subcat.slug)}
                      className={cardClass}
                    >
                      {cardContent}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Empty Search Results State */
        <div className="text-center py-16 px-4 bg-white rounded-[6px] border border-gray-200/80 shadow-xs max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FiSearch className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            No matching {mode === "projects" ? "projects" : "categories"} found
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            We couldn&apos;t find any matches for &quot;{search}&quot;. Try exploring all or clearing your search.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              radius="md"
              onClick={() => {
                setHubActivePill("all");
                setSearch("");
              }}
              className="text-xs"
            >
              Clear Search
            </Button>
            {mode !== "projects" && (
              <Link
                href={`/packages?search=${encodeURIComponent(search)}&view=gigs`}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-xs font-medium rounded-[6px] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Search in Packages</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryHubDirectory;
