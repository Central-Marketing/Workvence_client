"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import {
  FiHome,
  FiSliders,
  FiArrowRight,
  FiSearch,
  FiX,
  FiBriefcase,
  FiHeart,
  FiUser,
} from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";

import { axiosFetch } from "@/utils";
import useAdminCategories from "@/hooks/useAdminCategories";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import { ClientBrief } from "@/types";

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
    if (qSearch) setSearch(qSearch);
    if (qCat) setActivePill(qCat.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"));
  }, [searchParams]);

  // Fetch categories dynamically from backend
  const { categoryList } = useAdminCategories();

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
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 pb-28 pt-5 sm:pt-7">
      <div className="container mx-auto">
        {/* Top Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-gray-500 mb-3 select-none">
          <Link
            href="/"
            className="text-[#327C73] hover:text-[#256059] transition-colors flex items-center gap-1"
            title="Home"
          >
            <FiHome className="w-3.5 h-3.5 text-[#327C73]" />
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-normal">Projects</span>
        </nav>

        {/* Main Title & Subtitle Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl sm:text-[38px] font-bold text-gray-900 tracking-tight font-sf-pro leading-tight">
              Find Your Next Briefs
            </h1>
            <p className="text-sm sm:text-[15px] text-gray-500 mt-1.5 max-w-2xl font-normal leading-relaxed">
              Explore briefs from clients looking for the right talent, skills, and expertise to bring their ideas to life.
            </p>
          </div>

          {/* Action Button for Buyers / Clients */}
          {user && !user.isSeller && (
            <Link
              href="/briefs/create"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#256059] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
            >
              + Post a Project
            </Link>
          )}
        </div>

        {/* Category Filter Pills & Search Bar Row */}
        <div className="flex items-center justify-between gap-3 mb-7 pb-2 border-b border-gray-200/60">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 flex-1 min-w-0">
            {/* Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 text-gray-700 font-medium text-xs sm:text-[13px] hover:text-black transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-200/50 cursor-pointer shrink-0 mr-1"
            >
              <FiSliders className="w-3.5 h-3.5 text-gray-600" />
              <span>Filter</span>
            </button>

            {/* Dynamic Category Pills */}
            {pillFilters.map((pill) => {
              const isActive = activePill === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setActivePill(pill.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${isActive
                      ? "bg-gray-900 text-white border border-gray-900 shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-900 hover:text-black"
                    }`}
                >
                  {pill.title}
                </button>
              );
            })}
          </div>

          {/* Reset Action */}
          {(activePill !== "all" || search) && (
            <button
              type="button"
              onClick={() => {
                setActivePill("all");
                setSearch("");
                setCurrentPage(1);
              }}
              className="shrink-0 text-[#327C73] hover:text-[#256059] font-semibold text-xs sm:text-[13px] flex items-center gap-1 transition-colors cursor-pointer pl-3"
            >
              <span>View All</span>
              <FiArrowRight className="w-3.5 h-3.5 text-[#327C73]" />
            </button>
          )}
        </div>

        {/* Collapsible Search Drawer */}
        {isFilterOpen && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs animate-fadeIn">
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#327C73] focus:bg-white transition-colors"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="bg-[#327C73] hover:bg-[#256059] text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CARDS GRID: 2 COLUMNS (100% REAL DATA FROM BACKEND)           */}
        {/* ============================================================ */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 h-[260px] flex flex-col justify-between"
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
          <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200/90 p-8 shadow-2xs">
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
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActivePill("all");
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition shadow-2xs"
                >
                  Clear Filters
                </button>
              )}
              {user && !user.isSeller && (
                <Link
                  href="/briefs/create"
                  className="px-5 py-2.5 bg-[#327C73] text-white text-xs font-semibold rounded-xl hover:bg-[#256059] transition shadow-xs"
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
                    className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group select-none"
                  >
                    {/* Top Content Area */}
                    <div>
                      {/* Header Row: Title, Meta, Badges, Heart */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-lg sm:text-[19px] font-bold text-gray-900 group-hover:text-[#327C73] transition-colors line-clamp-1 tracking-tight">
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
                      <p className="text-sm text-gray-600 line-clamp-2 my-4 leading-relaxed font-normal">
                        {brief.description}
                      </p>

                      {/* Skills / Tags Row: Only rendered if real requiredSkills exist */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                          {skills.slice(0, 4).map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs font-medium text-gray-600 bg-[#F5F5F7] border border-gray-200/80 px-3 py-1 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Divider & Bottom Client / Proposals Bar - 100% Real Backend Data */}
                    <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
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
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 text-xs font-semibold rounded-xl transition shadow-2xs ${currentPage === pageNum
                        ? "bg-[#327C73] text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  Next
                </button>
              </div>
            )}
          </>
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
