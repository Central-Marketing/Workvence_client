"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import useAdminCategories from "@/hooks/useAdminCategories";
import useSearchSuggestions, { SuggestionItem } from "@/hooks/useSearchSuggestions";
import { SearchSuggestionsDropdown } from "@/components/ui";
import {
  Search,
  X,
  Star,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  Palette,
  Code,
  Megaphone,
  Film,
  Briefcase,
  Music,
  FileText,
  BarChart2,
  Database,
  Brain,
  ShoppingCart,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Button, CustomSelect } from "@/components/ui";

const isValidUrl = (url?: unknown): boolean => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === '""' ||
    trimmed === "''" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
};

const resolveRealCoverImage = (data: any): string | null => {
  const candidate =
    data?.cover ||
    data?.image ||
    data?.coverImage ||
    (Array.isArray(data?.images) && data?.images[0]);

  if (isValidUrl(candidate)) {
    return (candidate as string).trim();
  }
  return null;
};

const getCategoryIcon = (iconStr?: string, nameStr?: string) => {
  const iconKey = (iconStr || "").toLowerCase().replace(/[-_\s]/g, "");
  const nameKey = (nameStr || "").toLowerCase();

  // If iconStr is an image URL (e.g. Cloudinary / CDN upload)
  if (iconStr && (iconStr.startsWith("http://") || iconStr.startsWith("https://"))) {
    return <img src={iconStr} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />;
  }

  if (
    iconKey === "brain" ||
    iconKey === "sparkles" ||
    iconKey === "ai" ||
    nameKey.includes("ai") ||
    nameKey.includes("artificial")
  ) {
    return <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "code" ||
    iconKey === "programming" ||
    nameKey.includes("program") ||
    nameKey.includes("tech") ||
    nameKey.includes("code") ||
    nameKey.includes("web") ||
    nameKey.includes("develop")
  ) {
    return <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "palette" ||
    iconKey === "design" ||
    nameKey.includes("design") ||
    nameKey.includes("art") ||
    nameKey.includes("graphic")
  ) {
    return <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "bullhorn" ||
    iconKey === "megaphone" ||
    iconKey === "marketing" ||
    nameKey.includes("market") ||
    nameKey.includes("seo") ||
    nameKey.includes("social")
  ) {
    return <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "video" ||
    iconKey === "film" ||
    nameKey.includes("video") ||
    nameKey.includes("photo") ||
    nameKey.includes("animat")
  ) {
    return <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "briefcase" ||
    iconKey === "business" ||
    nameKey.includes("business") ||
    nameKey.includes("consult")
  ) {
    return <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "music" ||
    iconKey === "audio" ||
    nameKey.includes("music") ||
    nameKey.includes("audio") ||
    nameKey.includes("voice")
  ) {
    return <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "filetext" ||
    iconKey === "writing" ||
    nameKey.includes("writ") ||
    nameKey.includes("translat")
  ) {
    return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "database" ||
    iconKey === "barchart2" ||
    iconKey === "barchart" ||
    nameKey.includes("data") ||
    nameKey.includes("analyt")
  ) {
    return <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (
    iconKey === "shoppingcart" ||
    iconKey === "ecommerce" ||
    nameKey.includes("e-commerce") ||
    nameKey.includes("commerce")
  ) {
    return <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }
  if (iconKey === "star" || nameKey.includes("other") || nameKey.includes("general")) {
    return <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
  }

  // Fallback icon when no match is found
  return <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" strokeWidth={1.8} />;
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = searchParams.get("sort") || "relevance";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Suggestions hook (real recommendations limit 5)
  const {
    items,
    isOpen,
    setIsOpen,
    isLoading: isSuggestionsLoading,
    close: closeSuggestions,
  } = useSearchSuggestions(searchInput, { limit: 5 });

  // Sync internal states when searchParams change externally and ensure dropdown is closed
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search") || "";
    setSearchInput(q);
    setActiveQuery(q);
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedSort(searchParams.get("sort") || "relevance");
    setCurrentPage(parseInt(searchParams.get("page") || "1", 10));
    closeSuggestions();
    setIsFocused(false);
    setSelectedIndex(-1);
  }, [searchParams, closeSuggestions]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        closeSuggestions();
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSuggestions]);

  // Real categories from backend
  const { categoryList: rawCategories } = useAdminCategories();
  const categoryList = useMemo(() => {
    return (rawCategories || []).map((cat: any) => {
      if (typeof cat === "string") {
        const slug = cat
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        return { name: cat, slug, icon: "" };
      }
      return {
        name: cat.name || cat.title || String(cat),
        slug:
          cat.slug ||
          (cat.name || cat.title || "")
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        icon: cat.icon || "",
      };
    });
  }, [rawCategories]);

  // Display top categories in the bottom category item row (matching Featured)
  const displayedCategories = useMemo(() => {
    if (categoryList && categoryList.length >= 4) {
      return categoryList.slice(0, 6);
    }
    return [
      { name: "Ai Engineering", slug: "ai-engineering", icon: "sparkles" },
      { name: "Website Development", slug: "website-development", icon: "code" },
      { name: "Graphics Design", slug: "graphics-design", icon: "palette" },
      { name: "Music Production", slug: "music-production", icon: "music" },
    ];
  }, [categoryList]);

  const sortOptions = useMemo(
    () => [
      { value: "relevance", label: "Most Relevant" },
      { value: "newest", label: "Newest Arrivals" },
      { value: "rating", label: "Top Rated" },
      { value: "price_asc", label: "Price: Low to High" },
      { value: "price_desc", label: "Price: High to Low" },
    ],
    []
  );

  // Sync with URL without triggering window scroll lifting/jumping
  const updateUrl = (overrides: {
    q?: string;
    category?: string;
    sort?: string;
    page?: number;
  }) => {
    const nextQ = overrides.q !== undefined ? overrides.q : activeQuery;
    const nextCat = overrides.category !== undefined ? overrides.category : selectedCategory;
    const nextSort = overrides.sort !== undefined ? overrides.sort : selectedSort;
    const nextPage = overrides.page !== undefined ? overrides.page : 1;

    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextCat) params.set("category", nextCat);
    if (nextSort && nextSort !== "relevance") params.set("sort", nextSort);
    if (nextPage > 1) params.set("page", nextPage.toString());

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const executeSearch = (queryText: string) => {
    closeSuggestions();
    setIsFocused(false);
    setSelectedIndex(-1);
    searchInputRef.current?.blur();
    setActiveQuery(queryText.trim());
    setCurrentPage(1);
    updateUrl({ q: queryText.trim(), page: 1 });
  };

  const handleSelectSuggestion = (item: SuggestionItem | { text: string; type: "query" }) => {
    const text = item.text.trim();
    closeSuggestions();
    setIsFocused(false);
    setSearchInput(text);
    setSelectedIndex(-1);
    searchInputRef.current?.blur();
    if (item.type === "category") {
      const catSlug = (item as SuggestionItem).slug || text;
      setSelectedCategory(catSlug);
      setActiveQuery("");
      setCurrentPage(1);
      updateUrl({ q: "", category: catSlug, page: 1 });
    } else {
      executeSearch(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && items.length > 0) {
        setIsOpen(true);
      }
      const displayCount = Math.min(items.length, 5);
      const maxIndex = searchInput.trim() ? displayCount : Math.max(0, displayCount - 1);
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const displayCount = Math.min(items.length, 5);
      const maxIndex = searchInput.trim() ? displayCount : Math.max(0, displayCount - 1);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      return;
    }

    if (e.key === "Escape") {
      closeSuggestions();
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
      return;
    }

    if (e.key === "Enter") {
      const displayCount = Math.min(items.length, 5);
      if (selectedIndex >= 0 && selectedIndex < displayCount) {
        handleSelectSuggestion(items[selectedIndex]);
        return;
      }
      if (selectedIndex === displayCount && searchInput.trim()) {
        executeSearch(searchInput);
        return;
      }
      if (searchInput.trim()) {
        executeSearch(searchInput);
      }
    }
  };

  const handleCategorySelect = (slug: string) => {
    closeSuggestions();
    setSelectedCategory(slug);
    setCurrentPage(1);
    updateUrl({ category: slug, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveQuery("");
    setCurrentPage(1);
    updateUrl({ q: "", page: 1 });
  };

  const handleResetAll = () => {
    setSearchInput("");
    setActiveQuery("");
    setSelectedCategory("");
    setSelectedSort("relevance");
    setCurrentPage(1);
    router.push("/search", { scroll: false });
  };

  // Fetch real gigs with TanStack Query from backend (keeps previous data to prevent vertical jump)
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["searchResults", activeQuery, selectedCategory, selectedSort, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeQuery.trim()) {
        params.set("search", activeQuery.trim());
      }
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      if (selectedSort && selectedSort !== "relevance") {
        params.set("sort", selectedSort);
      }
      params.set("page", currentPage.toString());
      params.set("limit", "20");

      const res = await axiosFetch.get(`/gigs?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  });

  const isInitialLoading = isLoading && !data;

  // Extract real package items and filter out any draft or invalid entities
  const packagesList = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(data)) rawList = data;
    else if (Array.isArray(data?.gigs)) rawList = data.gigs;
    else if (Array.isArray(data?.packages)) rawList = data.packages;
    else if (Array.isArray(data?.data)) rawList = data.data;

    // Strictly real items: must have a valid ID and not be draft
    return rawList.filter((pkg: any) => pkg && (pkg._id || pkg.id) && !pkg.isDraft);
  }, [data]);

  const totalResults = useMemo(() => {
    if (typeof data?.total === "number") return data.total;
    if (typeof data?.count === "number") return data.count;
    if (typeof data?.totalCount === "number") return data.totalCount;
    return packagesList.length;
  }, [data, packagesList]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* ===================== FEATURED-STYLE SEARCH SECTION ===================== */}
      <section
        id="search-hero-section"
        className="w-full bg-[#080C10] py-10 sm:py-14 md:py-16 px-4 flex flex-col justify-center items-center text-center select-none shadow-md border-b border-black/40"
      >
        <div className="container mx-auto px-4 max-w-[1000px] flex flex-col items-center">
          {/* Headline */}
          <h1 className="font-sf-pro font-[510] text-[26px] sm:text-[36px] md:text-[44px] lg:text-[48px] text-white tracking-[0px] leading-[1.15] text-center mb-3">
            Find the right <span className="text-[#7CE7DA]">freelancer</span> and get to work in minutes.
          </h1>

          {/* Subtitle */}
          <p className="text-[#C7C7C7] text-xs sm:text-sm md:text-[15px] font-normal font-inter max-w-xl mx-auto leading-relaxed text-center mb-7">
            Search thousands of vetted sellers, order in under a minute, and start today.
          </p>

          {/* Search Bar Input (Exact Featured Box + Gradient Border on Hover) */}
          <div ref={searchContainerRef} className="relative group/search w-full md:w-[800px] max-w-[800px] h-[52px] sm:h-[60px] rounded-[6px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all">
            {/* Gradient Border Layer (Pink: #FF5E8E, Violet: #8B5CF6, Green: #10B981) */}
            <div className="absolute -inset-[1.5px] rounded-[7.5px] bg-gradient-to-r from-[#FF5E8E] via-[#8B5CF6] to-[#10B981] opacity-0 group-hover/search:opacity-100 group-focus-within/search:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Inner White Box */}
            <div className="relative z-10 w-full h-full bg-white rounded-[6px] border border-black/10 group-hover/search:border-transparent group-focus-within/search:border-transparent px-4 sm:px-[20px] py-[10px] flex items-center justify-between gap-3 transition-all">
              <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" strokeWidth={2} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    if (items.length > 0) setIsOpen(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 200);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="What services are you looking for..."
                  className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-[15px] placeholder:font-sf-pro text-sm sm:text-base font-normal font-sf-pro"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <SearchSuggestionsDropdown
                items={items}
                query={searchInput}
                isOpen={isOpen && isFocused}
                isLoading={isSuggestionsLoading}
                selectedIndex={selectedIndex}
                onSelect={(item) => {
                  setIsFocused(false);
                  handleSelectSuggestion(item);
                }}
                onSeeMore={(q) => {
                  setIsFocused(false);
                  executeSearch(q);
                }}
              />
            </div>
          </div>

          {/* Row 2: Bottom Category Items (Featured style with real icons) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full mt-6">
            {/* All Services Pill */}
            <button
              type="button"
              onClick={() => handleCategorySelect("")}
              className={`flex items-center gap-[8px] pl-[12px] pr-[14px] py-[6px] rounded-[4px] text-xs sm:text-[13px] font-medium transition-all cursor-pointer active:scale-95 ${
                !selectedCategory
                  ? "bg-[#0D6D5F] text-white shadow-sm ring-1 ring-emerald-400/50"
                  : "bg-white/10 hover:bg-white/20 backdrop-blur-[50px] text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>All</span>
            </button>

            {/* Dynamic Category Pills */}
            {displayedCategories.map((cat: any) => {
              const isActive = selectedCategory === cat.slug || selectedCategory === cat.name;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySelect(isActive ? "" : cat.slug)}
                  className={`flex items-center gap-[10px] pl-[10px] pr-[12px] py-[6px] rounded-[4px] text-xs sm:text-[13px] font-medium transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-[#0D6D5F] text-white shadow-sm ring-1 ring-emerald-400/50"
                      : "bg-white/10 hover:bg-white/20 backdrop-blur-[50px] text-white"
                  }`}
                >
                  {getCategoryIcon(cat.icon, cat.name)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== TABLE VIEW SECTION ===================== */}
      <div className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-4">
          {/* Header Row: Result Counts & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="text-xs sm:text-[13.5px] text-gray-600 font-medium">
              {isLoading ? (
                <span>Loading real search results...</span>
              ) : (
                <span>
                  Showing <strong className="text-gray-950 font-semibold">{totalResults}</strong>{" "}
                  {totalResults === 1 ? "service" : "services"}
                  {activeQuery && (
                    <>
                      {" "}for &ldquo;<span className="text-[#0D6D5F] font-semibold">{activeQuery}</span>&rdquo;
                    </>
                  )}
                  {selectedCategory && (
                    <>
                      {" "}in <span className="text-[#0D6D5F] font-semibold capitalize">{selectedCategory.replace(/-/g, " ")}</span>
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2 sm:gap-3">
              {(activeQuery || selectedCategory || selectedSort !== "relevance") && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  title="Reset all filters"
                  aria-label="Reset all filters"
                  className="w-9 h-9 rounded-[6px] border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:inline-block">
                  Sort by:
                </span>
                <div className="w-[180px] sm:w-[195px]">
                  <CustomSelect
                    options={sortOptions}
                    value={selectedSort}
                    onChange={(val) => {
                      const newSort = String(val);
                      setSelectedSort(newSort);
                      setCurrentPage(1);
                      updateUrl({ sort: newSort, page: 1 });
                    }}
                    placeholder="Sort by"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0D6D5F]" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900 font-sf-pro">
                  Services Table View
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                Click any row to open service
              </span>
            </div>

            {/* Responsive Table Wrapper */}
            <div className="w-full overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-left text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-800 border-b border-gray-100 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Package Name</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Seller</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Delivery</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Rating</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Price</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>

                <tbody className={`divide-y divide-gray-100 font-sf-pro transition-opacity duration-150 ${isFetching && !isInitialLoading ? "opacity-60" : "opacity-100"}`}>
                  {/* 1. Loading State (initial mount only) */}
                  {isInitialLoading && (
                    <>
                      {[...Array(6)].map((_, idx) => (
                        <tr key={`skeleton-${idx}`} className="animate-pulse">
                          <td className="py-4 px-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-24 sm:w-28 h-14 sm:h-16 rounded-[6px] bg-gray-200 shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                              <div className="space-y-1">
                                <div className="h-3.5 bg-gray-200 rounded w-16" />
                                <div className="h-2.5 bg-gray-100 rounded w-10" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="h-3.5 bg-gray-200 rounded w-14" />
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="h-3.5 bg-gray-200 rounded w-12" />
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="h-4 bg-gray-200 rounded w-12" />
                          </td>
                          <td className="py-4 px-4 align-middle text-right">
                            <div className="h-8 bg-gray-200 rounded-[6px] w-20 ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* 2. Error State */}
                  {!isLoading && isError && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-[6px] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xl mb-3 shadow-2xs">
                            <X className="w-6 h-6" />
                          </div>
                          <p className="text-slate-800 font-semibold text-sm sm:text-base mb-1">
                            Failed to load search results
                          </p>
                          <p className="text-slate-400 text-xs sm:text-[13px] mb-4">
                            Unable to retrieve packages at this time. Please try again.
                          </p>
                          <button
                            type="button"
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs px-4 py-2 rounded-[6px] font-medium transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* 3. Empty State */}
                  {!isLoading && !isError && packagesList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                          <div className="w-12 h-12 rounded-[6px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0D6D5F] text-xl mb-3 shadow-2xs">
                            <Search className="w-6 h-6" />
                          </div>
                          <p className="text-slate-900 font-semibold text-sm sm:text-base mb-1">
                            No services found
                          </p>
                          <p className="text-slate-500 text-xs sm:text-[13px] mb-4 text-center leading-relaxed">
                            {activeQuery
                              ? `No packages match your search for "${activeQuery}". Try different keywords or select a different category.`
                              : "No packages available in this selection."}
                          </p>
                          <button
                            type="button"
                            onClick={handleResetAll}
                            className="bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs px-4 py-2 rounded-[6px] font-medium transition-colors cursor-pointer"
                          >
                            Reset Filters & View All
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* 4. Strictly Real Results List */}
                  {!isLoading &&
                    !isError &&
                    packagesList.map((pkg: any) => {
                      const coverImage = resolveRealCoverImage(pkg);
                      const userObj = pkg.user || pkg.userId || pkg.userID || {};
                      const sellerUsername = userObj.username || pkg.username || "";
                      const sellerName = userObj.name || sellerUsername || "--";
                      const sellerAvatar = userObj.image || pkg.pp || "/media/noavatar.png";
                      const sellerLevel = userObj.sellerLevel || "";

                      // Real rating calculation: never default to dummy 5.0
                      const rawRating =
                        typeof pkg.gigRating === "number"
                          ? pkg.gigRating
                          : typeof pkg.starRating === "number"
                          ? pkg.starRating
                          : pkg.starNumber > 0 && typeof pkg.totalStars === "number"
                          ? pkg.totalStars / pkg.starNumber
                          : typeof userObj.starRating === "number"
                          ? userObj.starRating
                          : null;

                      const reviewCount =
                        pkg.starNumber || pkg.reviews || userObj.totalReviews || pkg.sales || 0;
                      const hasRating = rawRating !== null && rawRating > 0;
                      const formattedRating = hasRating ? Number(rawRating).toFixed(1) : null;

                      // Real delivery days
                      const deliveryDays = pkg.deliveryTime || pkg.deliveryDays;

                      // Real price
                      const price = pkg.price;
                      const categoryName = pkg.category || pkg.cat || pkg.categoryName || "";
                      const packageUrl = `/package/${pkg.slug || pkg._id || pkg.id}`;

                      return (
                        <tr
                          key={pkg._id || pkg.id}
                          onClick={() => router.push(packageUrl)}
                          className="hover:bg-slate-50/75 cursor-pointer transition-colors group"
                        >
                          {/* Package Name & Real Thumbnail */}
                          <td className="py-4 px-4 align-middle max-w-[420px]">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-24 sm:w-28 h-14 sm:h-16 rounded-[6px] overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0 flex items-center justify-center">
                                {coverImage ? (
                                  <img
                                    src={coverImage}
                                    alt={pkg.title || "Package Cover"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <Briefcase className="w-6 h-6 text-gray-300" />
                                )}
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <span
                                  className="text-xs sm:text-[13.5px] font-medium text-gray-900 group-hover:text-[#0D6D5F] transition-colors line-clamp-2 leading-relaxed"
                                  title={pkg.title}
                                >
                                  {pkg.title || "--"}
                                </span>
                                {categoryName && (
                                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100/80 w-fit capitalize">
                                    {categoryName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Real Seller */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                <img
                                  src={sellerAvatar}
                                  alt={sellerName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (sellerUsername) {
                                      router.push(`/seller/${sellerUsername}`);
                                    }
                                  }}
                                  className="text-xs sm:text-[13px] font-semibold text-gray-900 hover:text-[#0D6D5F] transition-colors truncate max-w-[130px]"
                                  title={sellerName}
                                >
                                  {sellerName}
                                </span>
                                {sellerLevel && (
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {sellerLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Real Delivery Time */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13px] text-gray-700 whitespace-nowrap">
                            {deliveryDays ? (
                              <div className="inline-flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{deliveryDays} {deliveryDays === 1 ? "day" : "days"}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">--</span>
                            )}
                          </td>

                          {/* Real Rating */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            {hasRating ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                <span className="text-xs sm:text-[13px] font-bold text-gray-900">
                                  {formattedRating}
                                </span>
                                {reviewCount > 0 && (
                                  <span className="text-[11px] text-gray-400">
                                    ({reviewCount})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-normal">
                                No ratings
                              </span>
                            )}
                          </td>

                          {/* Real Price */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[14px] font-bold text-gray-950 whitespace-nowrap">
                            {price !== null && price !== undefined ? (
                              (Number(price) || 0).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })
                            ) : (
                              <span className="text-gray-400 font-normal">--</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap text-right">
                            <Button
                              href={packageUrl}
                              variant="dark"
                              size="sm"
                              radius="md"
                              className="bg-[#0D6D5F] hover:bg-[#0b5c50] text-white text-xs px-3.5 py-1.5 font-medium shadow-2xs group-hover:shadow transition-all inline-flex items-center gap-1.5"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && !isError && packagesList.length > 0 && (
              <div className="flex justify-center items-center gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  radius="md"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    const prevPage = Math.max(1, currentPage - 1);
                    setCurrentPage(prevPage);
                    updateUrl({ page: prevPage });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-xs font-semibold"
                >
                  Previous
                </Button>

                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3.5 py-1.5 rounded-[6px]">
                  Page {currentPage}
                </span>

                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  radius="md"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    updateUrl({ page: nextPage });
                  }}
                  disabled={packagesList.length < 20}
                  className="px-4 py-2 text-xs font-semibold bg-[#0D6D5F] hover:bg-[#0b5c50]"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] py-12 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0D6D5F] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
