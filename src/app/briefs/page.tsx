"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import {
  FiSliders,
  FiArrowRight,
  FiSearch,
  FiX,
  FiBriefcase,
  FiHeart,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiCheck,
  FiTag,
  FiClock,
} from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";

import { axiosFetch } from "@/utils";
import useAdminCategories, { sortCategoriesWithOtherLast } from "@/hooks/useAdminCategories";
import { useUserStore } from "@/store/userStore";
import { BriefsListSkeleton, Button, Breadcrumb, LeftFilterSidebar, CategoryHubDirectory } from "@/components";
import { Pagination } from "@/components/ui";
import { ClientBrief } from "@/types";
import useDebounce from "@/hooks/useDebounce";
import useDragScroll from "@/hooks/useDragScroll";

type SortOption = "" | "budget_asc" | "budget_desc" | "deadline_asc";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "", label: "Newest" },
  { id: "budget_asc", label: "Budget: Low to High" },
  { id: "budget_desc", label: "Budget: High to Low" },
  { id: "deadline_asc", label: "Shortest Deadline" },
];



interface ProjectSubcategoryCard {
  id: string;
  title: string;
  slug: string;
  description: string;
}

interface ProjectCategorySection {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  subcategories: ProjectSubcategoryCard[];
}

function formatCategoryName(cat?: string): string {
  if (!cat) return "";
  const cleaned = cat.trim();
  if (cleaned.includes("&") || (cleaned.includes(" ") && !cleaned.includes("-"))) {
    return cleaned;
  }
  return cleaned
    .split("-")
    .map((w) => {
      const lower = w.toLowerCase();
      if (lower === "and") return "&";
      if (lower === "ai") return "AI";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

interface BriefsApiResponse {
  briefs?: ClientBrief[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data?: ClientBrief[];
}

function BriefsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.user);
  const isSeller = Boolean(user?.isSeller || user?.role === "seller");

  const initialSearch = searchParams?.get("search") || "";
  const initialCategory = searchParams?.get("category") || "";
  const initialSkills = searchParams?.get("skills")
    ? searchParams.get("skills")!.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const initialMinBudget = searchParams?.get("minBudget") || "";
  const initialMaxBudget = searchParams?.get("maxBudget") || "";
  const initialMaxDeliveryTime = searchParams?.get("maxDeliveryTime") || "";
  const initialSort = (searchParams?.get("sort") as SortOption) || "";
  const initialPage = Math.max(1, Number(searchParams?.get("page")) || 1);
  const initialView = searchParams?.get("view") || "";
  const initialExplore = searchParams?.get("explore") || "";

  // Dual view mode: 'categories' hub view by default, or 'feed' when exploring all / filtering / seller logged in
  const [viewMode, setViewMode] = useState<"categories" | "feed">(() => {
    if (
      isSeller ||
      initialView === "all" ||
      initialView === "feed" ||
      initialExplore === "true" ||
      Boolean(initialCategory) ||
      Boolean(initialSearch) ||
      initialSkills.length > 0 ||
      Boolean(initialMinBudget) ||
      Boolean(initialMaxBudget) ||
      Boolean(initialMaxDeliveryTime) ||
      Boolean(initialSort) ||
      initialPage > 1
    ) {
      return "feed";
    }
    return "categories";
  });

  const [hubActivePill, setHubActivePill] = useState<string>("all");

  const [activePill, setActivePill] = useState<string>(
    initialCategory
      ? initialCategory.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-")
      : "all"
  );
  const [search, setSearch] = useState<string>(initialSearch);
  const debouncedSearch = useDebounce(search, 350);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [minBudget, setMinBudget] = useState<string>(initialMinBudget);
  const [maxBudget, setMaxBudget] = useState<string>(initialMaxBudget);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState<string>(initialMaxDeliveryTime);
  const [sortOption, setSortOption] = useState<SortOption>(initialSort);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Drag-to-scroll for category toolbars
  const {
    ref: hubScrollRef,
    isDragging: isHubDragging,
    events: hubDragEvents,
  } = useDragScroll<HTMLDivElement>();

  const {
    ref: feedScrollRef,
    isDragging: isFeedDragging,
    events: feedDragEvents,
  } = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    window.scrollTo(0, 0);
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Redirect logged-in sellers from /briefs to /briefs?view=feed
  useEffect(() => {
    if (isSeller) {
      const currentView = searchParams?.get("view");
      if (currentView !== "feed") {
        const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
        params.set("view", "feed");
        router.replace(`/briefs?${params.toString()}`, { scroll: false });
      }
      if (viewMode !== "feed") {
        setViewMode("feed");
      }
    }
  }, [isSeller, searchParams, router, viewMode]);

  const syncToUrl = (overrides?: {
    search?: string;
    category?: string;
    skills?: string[];
    minBudget?: string;
    maxBudget?: string;
    maxDeliveryTime?: string;
    sort?: SortOption;
    page?: number;
    view?: "categories" | "feed";
  }) => {
    const params = new URLSearchParams();

    const qSearch = overrides?.search !== undefined ? overrides.search : search;
    const qCat = overrides?.category !== undefined ? overrides.category : activePill;
    const qSkills = overrides?.skills !== undefined ? overrides.skills : selectedSkills;
    const qMinB = overrides?.minBudget !== undefined ? overrides.minBudget : minBudget;
    const qMaxB = overrides?.maxBudget !== undefined ? overrides.maxBudget : maxBudget;
    const qDeliv = overrides?.maxDeliveryTime !== undefined ? overrides.maxDeliveryTime : maxDeliveryTime;
    const qSort = overrides?.sort !== undefined ? overrides.sort : sortOption;
    const qPage = overrides?.page !== undefined ? overrides.page : currentPage;
    const qView = overrides?.view !== undefined ? overrides.view : viewMode;

    if (qSearch.trim()) params.set("search", qSearch.trim());
    if (qCat && qCat !== "all") params.set("category", qCat);
    if (qSkills.length > 0) params.set("skills", qSkills.join(","));
    if (qMinB) params.set("minBudget", qMinB);
    if (qMaxB) params.set("maxBudget", qMaxB);
    if (qDeliv) params.set("maxDeliveryTime", qDeliv);
    // Sort is omitted when search keyword is present (backend auto-sorts by relevance)
    if (qSort && !qSearch.trim()) params.set("sort", qSort);
    if (qPage > 1) params.set("page", String(qPage));
    if (isSeller || qView === "feed") params.set("view", "feed");

    const qs = params.toString();
    const targetUrl = qs ? `/briefs?${qs}` : (isSeller ? "/briefs?view=feed" : "/briefs");
    router.push(targetUrl, { scroll: false });
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    syncToUrl({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  // Sync state if URL query params change externally
  useEffect(() => {
    const qSearch = searchParams?.get("search") || "";
    const qCat = searchParams?.get("category") || "";
    const qSkills = searchParams?.get("skills")
      ? searchParams.get("skills")!.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const qMinB = searchParams?.get("minBudget") || "";
    const qMaxB = searchParams?.get("maxBudget") || "";
    const qDeliv = searchParams?.get("maxDeliveryTime") || "";
    const qSort = (searchParams?.get("sort") as SortOption) || "";
    const qPage = Math.max(1, Number(searchParams?.get("page")) || 1);
    const qView = searchParams?.get("view") || "";
    const qExplore = searchParams?.get("explore") || "";

    if (qSearch !== search) setSearch(qSearch);
    if (qCat) setActivePill(qCat.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"));
    else if (!qCat && activePill !== "all") setActivePill("all");

    setSelectedSkills(qSkills);
    setMinBudget(qMinB);
    setMaxBudget(qMaxB);
    setMaxDeliveryTime(qDeliv);
    setSortOption(qSort);
    setCurrentPage(qPage);

    if (
      isSeller ||
      qView === "all" ||
      qView === "feed" ||
      qExplore === "true" ||
      Boolean(qCat) ||
      Boolean(qSearch) ||
      qSkills.length > 0 ||
      Boolean(qMinB) ||
      Boolean(qMaxB) ||
      Boolean(qDeliv) ||
      Boolean(qSort) ||
      qPage > 1
    ) {
      setViewMode("feed");
    } else if (
      !isSeller &&
      !qView &&
      !qCat &&
      !qSearch &&
      !qExplore &&
      qSkills.length === 0 &&
      !qMinB &&
      !qMaxB &&
      !qDeliv &&
      !qSort &&
      qPage === 1
    ) {
      setViewMode("categories");
    }
  }, [searchParams, isSeller]);

  // Fetch real categories directly from backend API
  const { categoryList, parentCategories } = useAdminCategories();

  // Dynamically map real categories & subcategories from API
  const apiCategories = useMemo<ProjectCategorySection[]>(() => {
    if (!parentCategories || parentCategories.length === 0) return [];

    const mapped: ProjectCategorySection[] = parentCategories.map((cat: any) => {
      const rawName = cat.name || cat.title || "";
      const slug = (cat.slug || rawName)
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Get real subcategories from children
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

      let subcategories: ProjectSubcategoryCard[] = [];

      if (children.length > 0) {
        children.forEach((ch: any) => {
          const chTitle = ch.name || ch.title || String(ch);
          const chSlug = (ch.slug || chTitle)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

          subcategories.push({
            id: ch.id || ch._id || chSlug,
            title: chTitle,
            slug: chSlug,
            description:
              ch.description && ch.description !== "No description provided."
                ? ch.description
                : `Explore ${chTitle} projects and opportunities`,
          });

          // Check if child has deeper nested children (e.g. N8N -> Automation)
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
                      : `Explore ${nTitle} projects and opportunities`,
                });
              }
            });
          }
        });
      } else {
        // If no subcategories exist yet in backend, provide a single card for the category
        subcategories = [
          {
            id: cat.id || cat._id || slug,
            title: rawName,
            slug: slug,
            description:
              cat.description && cat.description !== "No description provided."
                ? cat.description
                : `Explore open briefs, tasks, and requests in ${rawName}.`,
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
            : `Browse ${rawName} projects and start earning by bidding on work that matches your skills.`,
        subcategories: sortCategoriesWithOtherLast(subcategories),
      };
    });

    return sortCategoriesWithOtherLast(mapped);
  }, [parentCategories, categoryList]);

  // Categories displayed in hub view (filterable by hubActivePill)
  const displayedCategories = useMemo(() => {
    if (hubActivePill === "all") return apiCategories;
    const filtered = apiCategories.filter((c) => c.slug === hubActivePill);
    return filtered.length > 0 ? filtered : apiCategories;
  }, [apiCategories, hubActivePill]);

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

  const handleExploreAll = () => {
    setViewMode("feed");
    setActivePill("all");
    setCurrentPage(1);
    syncToUrl({ view: "feed", category: "all", page: 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSubcategory = (catSlug: string, subcatSlug?: string) => {
    const targetCategory = subcatSlug || catSlug;
    setActivePill(targetCategory);
    setSearch("");
    setCurrentPage(1);
    setViewMode("feed");
    syncToUrl({ category: targetCategory, search: "", page: 1, view: "feed" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (catSlug: string) => {
    setActivePill(catSlug);
    setSearch("");
    setCurrentPage(1);
    setViewMode("feed");
    syncToUrl({ category: catSlug, search: "", page: 1, view: "feed" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCategories = () => {
    if (isSeller) {
      router.push("/briefs?view=feed", { scroll: false });
      setViewMode("feed");
      return;
    }
    router.push("/briefs", { scroll: false });
    setViewMode("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch real client briefs from backend with all active search & filter parameters
  const { isLoading, data: apiResponse } = useQuery<BriefsApiResponse>({
    queryKey: [
      "briefs-feed",
      currentPage,
      debouncedSearch,
      activePill,
      selectedSkills.join(","),
      minBudget,
      maxBudget,
      maxDeliveryTime,
      sortOption,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: 10,
      };

      const trimmedSearch = debouncedSearch.trim();
      if (trimmedSearch) {
        params.search = trimmedSearch;
      }
      if (activePill && activePill !== "all") {
        params.category = activePill;
      }
      if (selectedSkills.length > 0) {
        params.skills = selectedSkills.join(",");
      }
      if (minBudget && !isNaN(Number(minBudget))) {
        params.minBudget = Number(minBudget);
      }
      if (maxBudget && !isNaN(Number(maxBudget))) {
        params.maxBudget = Number(maxBudget);
      }
      if (maxDeliveryTime && !isNaN(Number(maxDeliveryTime))) {
        params.maxDeliveryTime = Number(maxDeliveryTime);
      }
      // When search keyword is present, backend automatically ranks by relevance; omit sort
      if (sortOption && !trimmedSearch) {
        params.sort = sortOption;
      }

      const { data } = await axiosFetch.get("/briefs", { params });
      if (Array.isArray(data)) {
        return { briefs: data, total: data.length, totalPages: 1 };
      }
      return data;
    },
  });

  const allBriefs: ClientBrief[] = useMemo(() => {
    if (Array.isArray(apiResponse)) return apiResponse;
    if (Array.isArray(apiResponse?.briefs)) return apiResponse.briefs;
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    return [];
  }, [apiResponse]);

  const totalBriefsCount = apiResponse?.total ?? allBriefs.length;
  const totalPages = Math.max(1, apiResponse?.totalPages ?? Math.ceil(totalBriefsCount / 10));

  // Dynamic pill filters from real backend categories & briefs
  const pillFilters = useMemo(() => {
    const map = new Map<string, string>();

    // Add from admin categories
    categoryList.forEach((cat: any) => {
      const name = typeof cat === "string" ? cat : cat.name || cat.title || "";
      if (!name) return;
      const slug = (typeof cat === "string" ? cat : cat.slug || name)
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      map.set(slug, name);
    });

    // Also populate any unique categories from actual briefs
    allBriefs.forEach((b) => {
      if (b.category) {
        const slug = b.category
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        if (!map.has(slug)) {
          map.set(slug, formatCategoryName(b.category));
        }
      }
    });

    const pills = Array.from(map.entries()).map(([id, title]) => ({ id, title, name: title, slug: id }));
    return [{ id: "all", title: "All Projects" }, ...sortCategoriesWithOtherLast(pills)];
  }, [categoryList, allBriefs]);

  // Categories formatted for LeftFilterSidebar
  const sidebarCategories = useMemo(() => {
    return sortCategoriesWithOtherLast(
      pillFilters
        .filter((p) => p.id !== "all")
        .map((p) => ({ name: p.title, slug: p.id }))
    );
  }, [pillFilters]);

  // Server-side filtering is executed directly by GET /api/briefs.
  const filteredBriefs = allBriefs;

  const hasActiveFilters =
    (activePill && activePill !== "all") ||
    Boolean(search.trim()) ||
    selectedSkills.length > 0 ||
    Boolean(minBudget) ||
    Boolean(maxBudget) ||
    Boolean(maxDeliveryTime) ||
    Boolean(sortOption);

  const clearAllFilters = () => {
    setActivePill("all");
    setSearch("");
    setSelectedSkills([]);
    setMinBudget("");
    setMaxBudget("");
    setMaxDeliveryTime("");
    setSortOption("");
    setCurrentPage(1);
    syncToUrl({
      category: "all",
      search: "",
      skills: [],
      minBudget: "",
      maxBudget: "",
      maxDeliveryTime: "",
      sort: "",
      page: 1,
    });
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncToUrl({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-800 pt-5 sm:pt-7 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {viewMode === "categories" && !isSeller ? (
          /* ============================================================ */
          /* CATEGORY HUB VIEW (Default View)                             */
          <CategoryHubDirectory
            mode="projects"
            categories={apiCategories}
            onExploreAll={handleExploreAll}
            onSelectSubcategory={handleSelectSubcategory}
            onFilterClick={() => {
              setViewMode("feed");
              setIsFilterOpen(true);
            }}
            syncUrlParam={false}
          />
        ) : (
          /* ============================================================ */
          /* FEED VIEW (Search, Filters, Project Brief Cards, Pagination)  */
          /* ============================================================ */
          <div className="animate-fadeIn">
            {/* Main Title & Subtitle Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
              <div>
                <h1 className="text-xl sm:text-[32px] font-bold text-gray-900 tracking-tight font-sf-pro leading-tight">
                  Find Your Next Projects
                </h1>
                <p className="text-[12px] sm:text-[15px] text-gray-500 mt-1.5 max-w-2xl font-normal leading-relaxed">
                  Explore projects from clients looking for the right talent, skills, and expertise to bring their ideas to life.
                </p>
              </div>

              {/* Action Buttons: Browse by Category & Post a Project */}
              <div className="flex items-center gap-2.5 shrink-0">
                {!isSeller && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    radius="lg"
                    onClick={handleBackToCategories}
                    leftIcon={<FiChevronLeft className="w-3.5 h-3.5" />}
                    className="text-xs sm:text-sm font-semibold bg-white border-gray-300 hover:bg-gray-50 text-gray-700 shadow-2xs"
                  >
                    Browse by Category
                  </Button>
                )}

                {user && !user.isSeller && (
                  <Link
                    href="/briefs/create"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[6px] bg-[#327C73] hover:bg-[#256059] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
                  >
                    + Post a Project
                  </Link>
                )}
              </div>
            </div>

            {/* Category Filter Pills & Search Bar Row */}
            <div className="flex items-center justify-between gap-3 mb-7 pb-2 border-b border-gray-200/60">
              <div
                ref={feedScrollRef}
                {...feedDragEvents}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 flex-1 min-w-0 select-none"
              >
                {/* Filter Drawer Toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  radius="lg"
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setShowFilterDrawer(true);
                    } else {
                      setIsFilterOpen((prev) => !prev);
                    }
                  }}
                  leftIcon={<FiSliders className="w-3.5 h-3.5 text-gray-600" />}
                  className={`font-medium text-xs sm:text-[13px] transition-colors px-3 py-1.5 shrink-0 mr-1 border-none shadow-none ${(isMobileViewport ? showFilterDrawer : isFilterOpen)
                    ? "bg-gray-200/80 text-black font-semibold"
                    : "text-gray-700 hover:text-black hover:bg-gray-200/50"
                    }`}
                >
                  Filter
                </Button>

                {/* Dynamic Category Pills */}
                {pillFilters.map((pill) => {
                  const isActive = activePill === pill.id;
                  return (
                    <Button
                      key={pill.id}
                      type="button"
                      variant={isActive ? "dark" : "outline"}
                      size="sm"
                      radius="full"
                      onClick={() => {
                        setActivePill(pill.id);
                        setCurrentPage(1);
                        syncToUrl({ category: pill.id, page: 1 });
                      }}
                      className={`px-4 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 ${isActive
                        ? "shadow-xs border-gray-900"
                        : "hover:border-gray-900 hover:text-black"
                        }`}
                    >
                      {pill.title}
                    </Button>
                  );
                })}
              </div>

              {/* Reset Action */}
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  rightIcon={<FiArrowRight className="w-3.5 h-3.5 text-[#327C73]" />}
                  className="shrink-0 text-[#327C73] hover:text-[#256059] font-semibold text-xs sm:text-[13px] transition-colors pl-3 border-none shadow-none p-0 h-auto hover:bg-transparent"
                >
                  View All
                </Button>
              )}
            </div>

            {/* Results Count Summary & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <span className="text-xs sm:text-[13px] text-gray-500 font-medium">
                Showing {filteredBriefs.length} of {totalBriefsCount}{" "}
                {totalBriefsCount === 1 ? "project" : "projects"} available
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-[6px] text-xs sm:text-[13px] font-medium text-gray-700 hover:text-black hover:border-gray-300 shadow-2xs transition-all cursor-pointer"
                    aria-label="Sort options"
                  >
                    <span className="text-gray-400 font-normal">Sort:</span>
                    <span className="font-semibold text-gray-800">
                      {debouncedSearch.trim()
                        ? "Relevance"
                        : SORT_OPTIONS.find((s) => s.id === sortOption)?.label || "Newest"}
                    </span>
                    <FiChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {isSortDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsSortDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-[6px] border border-gray-200 shadow-lg py-1 z-30 animate-fadeIn">
                        {debouncedSearch.trim() && (
                          <div className="px-3 py-2 text-[11px] text-amber-700 bg-amber-50 border-b border-amber-100 leading-snug">
                            Search active: Results are ranked automatically by relevance.
                          </div>
                        )}
                        {SORT_OPTIONS.map((opt) => {
                          const isSelected = sortOption === opt.id;
                          return (
                            <button
                              key={opt.id || "default"}
                              type="button"
                              disabled={Boolean(debouncedSearch.trim())}
                              onClick={() => {
                                setSortOption(opt.id);
                                setCurrentPage(1);
                                setIsSortDropdownOpen(false);
                                syncToUrl({ sort: opt.id, page: 1 });
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${isSelected
                                ? "bg-gray-50 font-semibold text-[#0D6D5F]"
                                : "text-gray-700 hover:bg-gray-50"
                                } ${debouncedSearch.trim()
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                                }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <FiCheck className="w-3.5 h-3.5 text-[#0D6D5F]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Layout: Left Filter Sidebar (Desktop) + Briefs Grid */}
            <div className="flex flex-col lg:flex-row items-start gap-7">
              {/* Desktop Left Filter Sidebar */}
              {isFilterOpen && (
                <div className="hidden lg:block lg:w-[270px] xl:w-[280px] shrink-0 lg:sticky lg:top-24">
                  <LeftFilterSidebar
                    searchVal={search}
                    onSearchChange={(val) => {
                      setSearch(val);
                    }}
                    onSearchSubmit={() => {
                      setCurrentPage(1);
                      syncToUrl({ search, page: 1 });
                    }}
                    categories={sidebarCategories}
                    selectedCategory={activePill === "all" ? "" : activePill}
                    onCategoryChange={(slug) => {
                      const cat = slug || "all";
                      setActivePill(cat);
                      setCurrentPage(1);
                      syncToUrl({ category: cat, page: 1 });
                    }}
                    deliveryDays={maxDeliveryTime}
                    onDeliveryDaysChange={(val) => {
                      setMaxDeliveryTime(val);
                      setCurrentPage(1);
                      syncToUrl({ maxDeliveryTime: val, page: 1 });
                    }}
                    minPrice={minBudget}
                    maxPrice={maxBudget}
                    onMinPriceChange={(val) => {
                      setMinBudget(val);
                      syncToUrl({ minBudget: val, page: 1 });
                    }}
                    onMaxPriceChange={(val) => {
                      setMaxBudget(val);
                      syncToUrl({ maxBudget: val, page: 1 });
                    }}
                    onReset={clearAllFilters}
                  />
                </div>
              )}

              {/* Right Side: Brief Cards Grid & Pagination */}
              <div className="flex-1 min-w-0 w-full">

                {/* ============================================================ */}
                {/* Project Brief Cards Grid                                    */}
                {/* ============================================================ */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-[6px] border border-gray-200/90 p-6 sm:p-7 h-[260px] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                              <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                            </div>
                          </div>
                          <div className="h-3 bg-gray-100 rounded w-1/3 mb-5"></div>
                          <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-100 rounded w-4/5 mb-5"></div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredBriefs.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-[6px] border border-gray-200/90 p-8 shadow-2xs">
                    <div className="w-14 h-14 rounded-[6px] border border-[rgba(0,0,0,0.1)] bg-white text-[#327C73] flex items-center justify-center mb-4 border border-emerald-100 shadow-2xs">
                      <FiBriefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      No briefs currently found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                      {search
                        ? `No open briefs match "${search}". Try another keyword or clear your filters.`
                        : "There are currently no open projects in this category. Check back soon or post your own project!"}
                    </p>
                    
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {filteredBriefs.map((brief) => {
                        const briefId = brief.id || brief._id;
                        const proposalsCount =
                          brief.proposalCount ?? brief._count?.proposals ?? brief.proposalsCount ?? (brief.proposals?.length || 0);

                        const country = brief.user?.country;
                        const location = country || "Remote";

                        const budgetDisplay =
                          brief.budget !== undefined && brief.budget !== null
                            ? typeof brief.budget === "number"
                              ? `$${brief.budget.toLocaleString()}`
                              : String(brief.budget).startsWith("$")
                                ? brief.budget
                                : `$${brief.budget}`
                            : null;

                        const categoryFormatted = formatCategoryName(brief.category);

                        const skills =
                          Array.isArray(brief.requiredSkills) && brief.requiredSkills.length > 0
                            ? brief.requiredSkills
                            : Array.isArray(brief.skills) && brief.skills.length > 0
                              ? brief.skills
                              : [];

                        const isFav = favoritedIds.has(briefId);

                        return (
                          <div
                            key={briefId}
                            onClick={() => router.push(`/briefs/${briefId}`)}
                            className="relative overflow-hidden bg-white rounded-[6px] border border-gray-200/90 hover:border-[var(--purple-200,#B78AF7)] hover:rounded-[6px] p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none"
                          >
                            {/* Ambient Purple Glow (appears on card hover) */}
                            <div
                              className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0"
                              style={{
                                position: "absolute",
                                right: "-210px",
                                top: "-407px",
                                width: "555px",
                                height: "513px",
                                borderRadius: "555px",
                                transform: "rotate(-180deg)",
                                background: "var(--purple-100, #CEB0FA)",
                                filter: "blur(150px)",
                              }}
                              aria-hidden="true"
                            />

                            {/* Top Content Area */}
                            <div className="relative z-10">
                              {/* Header Row: Title, Meta, Badges, Heart */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0 pr-2">
                                  <h3 className="text-base sm:text-[18px] font-bold text-gray-900 group-hover:text-[#327C73] transition-colors line-clamp-1 tracking-tight">
                                    {brief.title}
                                  </h3>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                                    <span>Posted {moment(brief.createdAt).fromNow()}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{location}</span>
                                  </div>
                                </div>

                                {/* Right Badges & Heart Icon */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Purple Budget Badge */}
                                  {budgetDisplay && (
                                    <span className="bg-[#ECEBFE] text-[#6B5AED] text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-tight">
                                      {budgetDisplay}
                                    </span>
                                  )}

                                  {/* Category Pill Badge */}
                                  {categoryFormatted && (
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap hidden sm:inline-block tracking-tight">
                                      {categoryFormatted}
                                    </span>
                                  )}

                                  {/* Favorite Button */}
                                  {/* <button
                            type="button"
                            onClick={(e) => toggleFavorite(e, briefId)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                            title="Save project"
                          >
                            <FiHeart
                              className={`w-4.5 h-4.5 transition-colors ${
                                isFav ? "text-red-500 fill-red-500" : "text-gray-400"
                              }`}
                            />
                          </button> */}
                                </div>
                              </div>

                              {/* Brief Description */}
                              <p className="text-[13px] text-gray-600 line-clamp-2 my-4 leading-relaxed font-normal">
                                {brief.description}
                              </p>

                              {/* Skills / Tags Row: Only rendered if real requiredSkills exist */}
                              {skills.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                  {skills.slice(0, 4).map((skill: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-xs font-medium text-gray-600 bg-[#F5F5F7] border border-gray-200/80 px-3 py-1 rounded-[6px]"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Divider & Bottom Client / Proposals Bar - 100% Real Backend Data */}
                            <div className="relative z-10 border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
                              {/* Project Owner (Anonymous like Fiverr/Upwork) */}
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200/80 shadow-2xs shrink-0">
                                  <FiUser className="w-3.5 h-3.5 text-slate-500" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs sm:text-[13px] font-semibold text-gray-900 leading-tight truncate">
                                    Project Owner
                                  </p>
                                  <p className="text-[11px] leading-tight mt-0.5">
                                    {brief.status === "closed" ? (
                                      <span className="text-red-500 font-medium">Closed</span>
                                    ) : (
                                      <span className="text-emerald-600 font-medium">Open Project</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Real Proposal Count & Delivery Time */}
                              <div className="text-right shrink-0">
                                <p className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                                  {proposalsCount} {proposalsCount === 1 ? "proposal" : "proposals"}
                                </p>
                                {brief.deliveryTime ? (
                                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                    {brief.deliveryTime} {brief.deliveryTime === 1 ? "day" : "days"} delivery
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls from Real Backend totalPages */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        scrollToTop
                        className="mt-10"
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile Filter Slide-out Drawer */}
            {showFilterDrawer && (
              <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-fadeIn"
                  onClick={() => setShowFilterDrawer(false)}
                />
                <div className="relative w-full max-w-[380px] bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-2">
                      <FiSliders className="w-5 h-5 text-gray-800" />
                      <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      onClick={() => setShowFilterDrawer(false)}
                      className="w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      aria-label="Close filters"
                    >
                      <FiX className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-5 text-left">
                    <LeftFilterSidebar
                      searchVal={search}
                      onSearchChange={(val) => setSearch(val)}
                      onSearchSubmit={() => {
                        setCurrentPage(1);
                        syncToUrl({ search, page: 1 });
                        setShowFilterDrawer(false);
                      }}
                      categories={sidebarCategories}
                      selectedCategory={activePill === "all" ? "" : activePill}
                      onCategoryChange={(slug) => {
                        const cat = slug || "all";
                        setActivePill(cat);
                        setCurrentPage(1);
                        syncToUrl({ category: cat, page: 1 });
                      }}
                      deliveryDays={maxDeliveryTime}
                      onDeliveryDaysChange={(val) => {
                        setMaxDeliveryTime(val);
                        setCurrentPage(1);
                        syncToUrl({ maxDeliveryTime: val, page: 1 });
                      }}
                      minPrice={minBudget}
                      maxPrice={maxBudget}
                      onMinPriceChange={(val) => {
                        setMinBudget(val);
                        syncToUrl({ minBudget: val, page: 1 });
                      }}
                      onMaxPriceChange={(val) => {
                        setMaxBudget(val);
                        syncToUrl({ maxBudget: val, page: 1 });
                      }}
                      onReset={clearAllFilters}
                      hideHeader={true}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs text-gray-500 hover:text-gray-900"
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="sm"
                      radius="xl"
                      onClick={() => setShowFilterDrawer(false)}
                      className="px-5 py-2 font-semibold text-xs bg-[#0D6D5F] hover:bg-[#0B5C50] text-white"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BriefsPage() {
  return (
    <React.Suspense
      fallback={
        <div role="status" className="min-h-screen bg-[#F5F5F5] text-gray-800 pt-5 sm:pt-7 pb-[80px] min-[1400px]:pb-[100px]">
          <span className="sr-only">Loading briefs</span>
          <div aria-hidden="true" className="container mx-auto px-4 sm:px-6 md:px-8">
            <BriefsListSkeleton />
          </div>
        </div>
      }
    >
      <BriefsContent />
    </React.Suspense>
  );
}
