"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
} from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";

import { axiosFetch } from "@/utils";
import useAdminCategories from "@/hooks/useAdminCategories";
import { useUserStore } from "@/store/userStore";
import { Loader, Button, Breadcrumb } from "@/components";
import { ClientBrief } from "@/types";

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

  const initialSearch = searchParams?.get("search") || "";
  const initialCategory = searchParams?.get("category") || "";
  const initialView = searchParams?.get("view") || "";
  const initialExplore = searchParams?.get("explore") || "";

  // Dual view mode: 'categories' hub view by default, or 'feed' when exploring all / filtering
  const [viewMode, setViewMode] = useState<"categories" | "feed">(() => {
    if (
      initialView === "all" ||
      initialView === "feed" ||
      initialExplore === "true" ||
      Boolean(initialCategory) ||
      Boolean(initialSearch)
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync state if URL query params change externally
  useEffect(() => {
    const qSearch = searchParams?.get("search") || "";
    const qCat = searchParams?.get("category") || "";
    const qView = searchParams?.get("view") || "";
    const qExplore = searchParams?.get("explore") || "";

    if (qSearch) setSearch(qSearch);
    if (qCat) setActivePill(qCat.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"));

    if (
      qView === "all" ||
      qView === "feed" ||
      qExplore === "true" ||
      Boolean(qCat) ||
      Boolean(qSearch)
    ) {
      setViewMode("feed");
    } else if (!qView && !qCat && !qSearch && !qExplore) {
      setViewMode("categories");
    }
  }, [searchParams]);

  // Fetch real categories directly from backend API
  const { categoryList, parentCategories } = useAdminCategories();

  // Dynamically map real categories & subcategories from API
  const apiCategories = useMemo<ProjectCategorySection[]>(() => {
    if (!parentCategories || parentCategories.length === 0) return [];

    return parentCategories.map((cat: any) => {
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
        subcategories,
      };
    });
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
    router.push("/briefs?view=all", { scroll: false });
    setViewMode("feed");
    setActivePill("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSubcategory = (catSlug: string, subcatTitle: string) => {
    router.push(
      `/briefs?category=${catSlug}&search=${encodeURIComponent(subcatTitle)}`,
      { scroll: false }
    );
    setActivePill(catSlug);
    setSearch(subcatTitle);
    setCurrentPage(1);
    setViewMode("feed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (catSlug: string) => {
    router.push(`/briefs?category=${catSlug}`, { scroll: false });
    setActivePill(catSlug);
    setSearch("");
    setCurrentPage(1);
    setViewMode("feed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCategories = () => {
    router.push("/briefs", { scroll: false });
    setViewMode("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch real client briefs from backend
  const { isLoading, data: apiResponse } = useQuery<BriefsApiResponse>({
    queryKey: ["briefs-feed", currentPage],
    queryFn: async () => {
      const { data } = await axiosFetch.get("/briefs", {
        params: { page: currentPage, limit: 10 },
      });
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

  const totalPages = apiResponse?.totalPages || 1;

  // Generate smart pagination range with ellipsis to prevent responsive blowout
  const paginationRange = useMemo(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - 1, 1);
    const rightSibling = Math.min(currentPage + 1, totalPages);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftRange = [1, 2, 3, 4];
      return [...leftRange, "...", totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      const rightRange = [
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
      return [1, "...", ...rightRange];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

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

    const pills = Array.from(map.entries()).map(([id, title]) => ({ id, title }));
    return [{ id: "all", title: "All Projects" }, ...pills];
  }, [categoryList, allBriefs]);

  // Filter backend briefs by search and category
  const filteredBriefs = useMemo(() => {
    return allBriefs.filter((brief) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        brief.title?.toLowerCase().includes(q) ||
        brief.description?.toLowerCase().includes(q) ||
        brief.category?.toLowerCase().includes(q) ||
        brief.user?.username?.toLowerCase().includes(q) ||
        (Array.isArray(brief.requiredSkills) &&
          brief.requiredSkills.some((s: string) => s.toLowerCase().includes(q)));

      const normCat = (brief.category || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const matchesCategory =
        activePill === "all" ||
        normCat === activePill ||
        normCat.includes(activePill) ||
        activePill.includes(normCat);

      return matchesSearch && matchesCategory;
    });
  }, [allBriefs, search, activePill]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-800 pt-5 sm:pt-7 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto">
        {viewMode === "categories" ? (
          /* ============================================================ */
          /* CATEGORY HUB VIEW (Default View)                             */
          /* ============================================================ */
          <div className="animate-fadeIn">
            {/* Project Category Hub Hero Banner */}
            <div
              className="relative w-full h-[180px] sm:h-[220px] md:h-[240px] rounded-[6px] overflow-hidden bg-[#130d2a] bg-cover bg-center bg-no-repeat flex items-center justify-center text-center shadow-xs select-none mb-7"
              style={{ backgroundImage: "url('/media/ProjectBg.png')" }}
            >
              {/* Center Content: Breadcrumb + Italic Projects Title */}
              <div className="relative z-10 flex flex-col items-center justify-center px-4">
                <Breadcrumb
                  variant="inverted"
                  className="mb-2 sm:mb-3 select-none [&>ol]:justify-center text-xs"
                  items={[
                    {
                      name: "Find Projects",
                      isLast: true,
                    },
                  ]}
                />
                <h1 className="italic text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] leading-tight text-white font-normal tracking-tight drop-shadow-2xs font-sf-pro">
                  Projects
                </h1>
              </div>
            </div>

            {/* Category Hub Filter Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-8 pb-3 border-b border-gray-200/80">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 flex-1 min-w-0">
                {/* Filter Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  radius="lg"
                  onClick={() => {
                    setViewMode("feed");
                    setIsFilterOpen(true);
                  }}
                  leftIcon={<FiSliders className="w-3.5 h-3.5 text-gray-600" />}
                  className="text-gray-700 font-medium text-xs sm:text-[13px] hover:text-black transition-colors px-3 py-1.5 hover:bg-gray-200/50 shrink-0 mr-1 border-none shadow-none"
                >
                  Filter
                </Button>

                {/* Dynamic Category Hub Pills */}
                <Button
                  type="button"
                  variant={hubActivePill === "all" ? "dark" : "outline"}
                  size="sm"
                  radius="full"
                  onClick={() => handleHubPillClick("all")}
                  className={`px-4 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 ${hubActivePill === "all"
                      ? "shadow-xs border-gray-900 bg-black text-white"
                      : "hover:border-gray-900 hover:text-black bg-white"
                    }`}
                >
                  All Projects
                </Button>

                {apiCategories.map((cat) => {
                  const isActive = hubActivePill === cat.slug;
                  return (
                    <Button
                      key={cat.id || cat.slug}
                      type="button"
                      variant={isActive ? "dark" : "outline"}
                      size="sm"
                      radius="full"
                      onClick={() => handleHubPillClick(cat.slug)}
                      className={`px-4 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 ${isActive
                          ? "shadow-xs border-gray-900 bg-black text-white"
                          : "hover:border-gray-900 hover:text-black bg-white"
                        }`}
                    >
                      {cat.name}
                    </Button>
                  );
                })}
              </div>

              {/* Right: Explore All Projects */}
              <button
                type="button"
                onClick={handleExploreAll}
                className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-gray-800 hover:text-[#0D6D5F] transition-colors shrink-0 pl-3 group whitespace-nowrap cursor-pointer"
              >
                <span>Explore All Projects</span>
                <FiArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#0D6D5F] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Category Sections & 4-Column Card Grids */}
            <div className="space-y-12 sm:space-y-14">
              {displayedCategories.map((cat) => (
                <section key={cat.id || cat.slug} id={`cat-section-${cat.slug}`} className="scroll-mt-6">
                  {/* Category Title & Subtitle */}
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-[22px] font-bold text-gray-900 font-sf-pro tracking-tight">
                      {cat.name}
                    </h2>
                    {cat.subtitle && (
                      <p className="text-xs sm:text-[13px] text-gray-500 mt-1 max-w-3xl leading-relaxed">
                        {cat.subtitle}
                      </p>
                    )}
                  </div>

                  {/* 4-Column Subcategory Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {cat.subcategories.map((subcat) => (
                      <div
                        key={subcat.id || subcat.slug}
                        onClick={() => handleSelectSubcategory(cat.slug, subcat.title)}
                        className="group bg-white rounded-[6px] border border-gray-200/80 hover:border-gray-400/80 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 min-h-[86px]"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 group-hover:text-[#0D6D5F] transition-colors leading-snug truncate">
                            {subcat.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                            {subcat.description}
                          </p>
                        </div>

                        {/* Clean arrow with NO background, vertically centered without text overlap */}
                        <div
                          className="shrink-0 text-gray-400 group-hover:text-gray-900 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                          aria-hidden="true"
                        >
                          <FiArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* FEED VIEW (Search, Filters, Project Brief Cards, Pagination)  */
          /* ============================================================ */
          <div className="animate-fadeIn">
            {/* Main Title & Subtitle Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
              <div>
                <h1 className="text-xl sm:text-[32px] font-bold text-gray-900 tracking-tight font-sf-pro leading-tight">
                  Find Your Next Briefs
                </h1>
                <p className="text-[12px] sm:text-[15px] text-gray-500 mt-1.5 max-w-2xl font-normal leading-relaxed">
                  Explore briefs from clients looking for the right talent, skills, and expertise to bring their ideas to life.
                </p>
              </div>

              {/* Action Buttons: Browse by Category & Post a Project */}
              <div className="flex items-center gap-2.5 shrink-0">
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
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 flex-1 min-w-0">
                {/* Filter Drawer Toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  radius="lg"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  leftIcon={<FiSliders className="w-3.5 h-3.5 text-gray-600" />}
                  className="text-gray-700 font-medium text-xs sm:text-[13px] hover:text-black transition-colors px-3 py-1.5 hover:bg-gray-200/50 shrink-0 mr-1 border-none shadow-none"
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
              {(activePill !== "all" || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActivePill("all");
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  rightIcon={<FiArrowRight className="w-3.5 h-3.5 text-[#327C73]" />}
                  className="shrink-0 text-[#327C73] hover:text-[#256059] font-semibold text-xs sm:text-[13px] transition-colors pl-3 border-none shadow-none p-0 h-auto hover:bg-transparent"
                >
                  View All
                </Button>
              )}
            </div>

            {/* Collapsible Search Drawer */}
            {isFilterOpen && (
              <div className="bg-white border border-gray-200 rounded-[6px] p-4 sm:p-5 mb-8 shadow-xs animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      placeholder="Search projects by title, client, or keywords..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:border-[#327C73] focus:bg-white transition-colors"
                    />
                    {search && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        radius="full"
                        onClick={() => {
                          setSearch("");
                          setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 !p-1 !h-6 !w-6 !min-h-0 border-none shadow-none"
                        aria-label="Clear search input"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    radius="lg"
                    onClick={() => setIsFilterOpen(false)}
                    className="px-5 py-2 font-medium text-xs sm:text-[13px]"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(activePill !== "all" || search) && (
              <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
                <span className="text-xs text-gray-500 font-medium">Active filters:</span>
                {activePill !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-2xs">
                    Category:{" "}
                    {pillFilters.find((p) => p.id === activePill)?.title || activePill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      radius="full"
                      onClick={() => {
                        setActivePill("all");
                        setCurrentPage(1);
                      }}
                      className="hover:text-red-500 transition-colors p-0.5 !h-auto !w-auto !min-h-0 border-none shadow-none"
                      aria-label="Remove category filter"
                    >
                      <FiX className="w-3 h-3" />
                    </Button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-2xs">
                    Search: &ldquo;{search}&rdquo;
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      radius="full"
                      onClick={() => {
                        setSearch("");
                        setCurrentPage(1);
                      }}
                      className="hover:text-red-500 transition-colors p-0.5 !h-auto !w-auto !min-h-0 border-none shadow-none"
                      aria-label="Clear active search keyword"
                    >
                      <FiX className="w-3 h-3" />
                    </Button>
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActivePill("all");
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 underline ml-2 border-none shadow-none p-0 !h-auto"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results Count Summary */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs sm:text-[13px] text-gray-500 font-medium">
                Showing {filteredBriefs.length}{" "}
                {filteredBriefs.length === 1 ? "project" : "projects"} available
              </span>
            </div>

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
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#327C73] flex items-center justify-center mb-4 border border-emerald-100 shadow-2xs">
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
                <div className="flex items-center gap-3">
                  {(search || activePill !== "all") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      radius="xl"
                      onClick={() => {
                        setSearch("");
                        setActivePill("all");
                        setCurrentPage(1);
                      }}
                      className="px-5 py-2.5 text-xs font-semibold shadow-2xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    radius="xl"
                    onClick={handleBackToCategories}
                    className="px-5 py-2.5 text-xs font-semibold shadow-2xs"
                  >
                    Browse Categories
                  </Button>
                  {user && !user.isSeller && (
                    <Link
                      href="/briefs/create"
                      className="px-5 py-2.5 bg-[#327C73] text-white text-xs font-semibold rounded-[6px] hover:bg-[#256059] transition shadow-xs"
                    >
                      + Post a Project
                    </Link>
                  )}
                </div>
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
                  <div className="w-full flex justify-center mt-10">
                    <nav
                      aria-label="Pagination Navigation"
                      className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-full px-2"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        radius="xl"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="!inline-flex !flex-row !items-center !justify-center !gap-1.5 px-3 sm:px-3.5 !h-9 !min-h-[36px] !text-xs font-semibold shadow-2xs shrink-0 whitespace-nowrap"
                        leftIcon={<FiChevronLeft className="w-3.5 h-3.5 shrink-0" />}
                        aria-label="Previous page"
                      >
                        <span className="whitespace-nowrap">Previous</span>
                      </Button>

                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {paginationRange.map((pageNum, idx) => {
                          if (typeof pageNum === "string") {
                            return (
                              <span
                                key={`ellipsis-${idx}`}
                                className="w-7 sm:w-9 !h-9 !min-h-[36px] flex items-center justify-center text-xs text-slate-400 font-bold select-none shrink-0"
                              >
                                ...
                              </span>
                            );
                          }

                          const isActive = currentPage === pageNum;
                          return (
                            <Button
                              key={`page-${pageNum}`}
                              type="button"
                              variant={isActive ? "brand" : "outline"}
                              size="sm"
                              radius="xl"
                              onClick={() => handlePageChange(pageNum)}
                              className={`!w-9 !h-9 !min-h-[36px] p-0 !text-xs font-semibold shadow-2xs shrink-0 !inline-flex !items-center !justify-center ${isActive ? "pointer-events-none !bg-[#0D6D5F] text-white" : "hover:border-gray-900"
                                }`}
                              aria-label={`Page ${pageNum}`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        radius="xl"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="!inline-flex !flex-row !items-center !justify-center !gap-1.5 px-3 sm:px-3.5 !h-9 !min-h-[36px] !text-xs font-semibold shadow-2xs shrink-0 whitespace-nowrap"
                        rightIcon={<FiChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        aria-label="Next page"
                      >
                        <span className="whitespace-nowrap">Next</span>
                      </Button>
                    </nav>
                  </div>
                )}
              </>
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader size={45} />
        </div>
      }
    >
      <BriefsContent />
    </React.Suspense>
  );
}
