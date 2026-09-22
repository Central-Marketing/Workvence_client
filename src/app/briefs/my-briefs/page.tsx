"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";
import {
  FiMoreVertical,
  FiPlus,
  FiEye,
  FiUsers,
  FiXCircle,
  FiArrowRight,
  FiSearch,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, Button, AiGradientButton } from "@/components";

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
];

const getBriefTags = (brief: any): string[] => {
  if (Array.isArray(brief.skills) && brief.skills.length > 0) {
    return brief.skills.slice(0, 3);
  }
  if (Array.isArray(brief.tags) && brief.tags.length > 0) {
    return brief.tags.slice(0, 3);
  }
  // Contextual smart fallback based on category & title
  const cat = (brief.category || "").toLowerCase();
  const title = (brief.title || "").toLowerCase();

  if (cat.includes("data") || title.includes("data") || title.includes("analys")) {
    return ["Detail-oriented", "Data Scientist", "Data Analyst"];
  }
  if (cat.includes("design") || cat.includes("illustrat") || title.includes("graphic") || title.includes("logo")) {
    return ["Imaginative", "Graphic Artist", "Illustrator"];
  }
  if (cat.includes("mobile") || cat.includes("app") || title.includes("mobile") || title.includes("flutter") || title.includes("react native")) {
    return ["Creative thinker", "Mobile Developer", "App Engineer"];
  }
  if (cat.includes("security") || cat.includes("cyber") || title.includes("security")) {
    return ["Analytical", "Security Analyst", "Network Security Engineer"];
  }
  if (cat.includes("content") || cat.includes("writ") || title.includes("writing") || title.includes("seo")) {
    return ["Communicative", "Content Writer", "Copywriter"];
  }
  if (cat.includes("management") || title.includes("project") || title.includes("manage") || title.includes("lead")) {
    return ["Organized", "Project Manager", "Scrum Master"];
  }
  if (cat.includes("web") || title.includes("web") || title.includes("full stack") || title.includes("developer")) {
    return ["Frontend", "Full Stack", "Web Developer"];
  }
  return [brief.category || "Professional", "Expert", "Reliable"];
};

const getWorkType = (brief: any, index: number): string => {
  if (brief.workType) return brief.workType;
  if (brief.location) return brief.location;
  if (brief.deliveryTime) return `${brief.deliveryTime} Days`;
  const types = ["On-site", "Remote", "Hybrid", "On-site", "Remote", "Hybrid"];
  return types[index % types.length];
};

const getRateBadge = (brief: any): string => {
  if (brief.hoursPerWeek) return `${brief.hoursPerWeek} hrs/week`;
  if (brief.budget) return typeof brief.budget === "number" ? `$${brief.budget}` : String(brief.budget);
  if (brief.deliveryTime) return `${brief.deliveryTime} Days`;
  return "40 hrs/week";
};

type BriefFilter = "all" | "new_proposals" | "new_projects" | "open" | "closed";

const isProjectNew = (brief: any): boolean => {
  if (!brief?.createdAt) return false;
  return moment().diff(moment(brief.createdAt), "days") <= 14;
};

const MyBriefs = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<BriefFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "proposals" | "budget">("newest");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Real backend query
  const { isLoading, data: briefs = [] } = useQuery({
    queryKey: ["my-briefs"],
    queryFn: () =>
      axiosFetch
        .get("/briefs/my-briefs")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.briefs)) return data.briefs;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  const closeMutation = useMutation({
    mutationFn: (briefId: string) =>
      axiosFetch.patch(`/briefs/${briefId}/close`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-briefs"] });
      toast.success("Project closed successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to close project");
    },
  });

  const briefsArray = Array.isArray(briefs) ? briefs : [];

  // Count stats for filter pills
  const counts = useMemo(() => {
    let newProposalsCount = 0;
    let newProjectsCount = 0;
    let openCount = 0;
    let closedCount = 0;

    briefsArray.forEach((b: any) => {
      const isClosed = b.isClosed || b.status === "closed";
      const pCount =
        b.proposalCount ??
        b.proposalsCount ??
        (Array.isArray(b.proposals) ? b.proposals.length : 0);

      if (pCount > 0 && !isClosed) newProposalsCount++;
      if (isProjectNew(b) && !isClosed) newProjectsCount++;
      if (!isClosed) openCount++;
      if (isClosed) closedCount++;
    });

    return {
      all: briefsArray.length,
      new_proposals: newProposalsCount,
      new_projects: newProjectsCount,
      open: openCount,
      closed: closedCount,
    };
  }, [briefsArray]);

  const filtered = useMemo(() => {
    let list = [...briefsArray];

    // 1. Status / Pill Filter
    if (filter === "open") {
      list = list.filter((b) => !b.isClosed && b.status !== "closed");
    } else if (filter === "closed") {
      list = list.filter((b) => b.isClosed || b.status === "closed");
    } else if (filter === "new_proposals") {
      list = list.filter((b) => {
        const isClosed = b.isClosed || b.status === "closed";
        const pCount =
          b.proposalCount ??
          b.proposalsCount ??
          (Array.isArray(b.proposals) ? b.proposals.length : 0);
        return pCount > 0 && !isClosed;
      });
    } else if (filter === "new_projects") {
      list = list.filter((b) => isProjectNew(b) && !b.isClosed && b.status !== "closed");
    }

    // 2. Keyword Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const title = (b.title || "").toLowerCase();
        const description = (b.description || "").toLowerCase();
        const category = (b.category || "").toLowerCase();
        const skills = Array.isArray(b.skills)
          ? b.skills.join(" ").toLowerCase()
          : Array.isArray(b.requiredSkills)
            ? b.requiredSkills.join(" ").toLowerCase()
            : "";
        return (
          title.includes(q) ||
          description.includes(q) ||
          category.includes(q) ||
          skills.includes(q)
        );
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === "proposals") {
        const pA = a.proposalCount ?? a.proposalsCount ?? (Array.isArray(a.proposals) ? a.proposals.length : 0);
        const pB = b.proposalCount ?? b.proposalsCount ?? (Array.isArray(b.proposals) ? b.proposals.length : 0);
        return pB - pA;
      }
      if (sortBy === "budget") {
        const bA = typeof a.budget === "number" ? a.budget : parseFloat(a.budget) || 0;
        const bB = typeof b.budget === "number" ? b.budget : parseFloat(b.budget) || 0;
        return bB - bA;
      }
      // Default: newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [briefsArray, filter, searchQuery, sortBy]);

  const emptyState = useMemo(() => {
    if (searchQuery) {
      return {
        title: "No matching projects found",
        description: `We couldn't find any projects matching "${searchQuery}". Try adjusting your keywords.`,
      };
    }
    switch (filter) {
      case "new_proposals":
        return {
          title: "No projects with new proposals",
          description: "None of your active projects have received candidate proposals yet.",
        };
      case "new_projects":
        return {
          title: "No new projects",
          description: "Projects posted within the last 14 days will appear here.",
        };
      case "open":
        return {
          title: "No open projects",
          description: "You don't have any open projects at the moment.",
        };
      case "closed":
        return {
          title: "No closed projects",
          description: "Completed or archived projects will appear here.",
        };
      default:
        return {
          title: "No projects posted yet",
          description: "Post your project specifications to receive detailed proposals from vetted freelancers.",
        };
    }
  }, [filter, searchQuery]);

  if (!user) {
    return (
      <div className="flex justify-center bg-[#F8FAFC] py-12 min-h-[80vh] px-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-center items-center py-20">
          <Loader size={45} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-6 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6">

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-[34px] font-bold text-slate-900 tracking-tight">
              My Projects
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Keep track of your projects, progress, milestones, and updates all in one place.
            </p>
          </div>
          {!user?.isSeller && (
            <AiGradientButton
              href="/briefs/create"
              text="Post a Project with AI"
              px="px-3.5 sm:px-4.5"
              py="py-2 sm:py-2.5"
              className="h-[40px] rounded-[6px] text-xs sm:text-sm md:text-[15px] font-semibold text-[#112131] shadow-none shrink-0 whitespace-nowrap self-start sm:self-center"
            />
          )}
        </div>

        {/* Filter Pills & Search / Sort Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 sm:gap-4 mb-6 sm:mb-8 w-full min-w-0 max-w-full">
          {/* Filter Pills (Scrollable with edge bleed on mobile, smooth track on larger screens) */}
          <div className="w-full xl:w-auto min-w-0 max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
              <Button
                type="button"
                variant={filter === "all" ? "dark" : "outline"}
                size="sm"
                radius="full"
                onClick={() => setFilter("all")}
                className="px-3 sm:px-3.5 py-1.5 font-semibold text-xs sm:text-[13px] !inline-flex !items-center !flex-nowrap !whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap shrink-0">All Projects</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap ${filter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                  {counts.all}
                </span>
              </Button>

              <Button
                type="button"
                variant={filter === "new_proposals" ? "dark" : "outline"}
                size="sm"
                radius="full"
                onClick={() => setFilter("new_proposals")}
                className={`px-3 sm:px-3.5 py-1.5 font-semibold text-xs sm:text-[13px] !inline-flex !items-center !flex-nowrap !whitespace-nowrap shrink-0 ${filter === "new_proposals" ? "!bg-[#0D6D5F] hover:!bg-[#0B403F] text-white border-transparent" : ""
                  }`}
              >
                <span className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap">

                  <span>New Proposals</span>
                </span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap ${filter === "new_proposals" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                  }`}>
                  {counts.new_proposals}
                </span>
              </Button>

              <Button
                type="button"
                variant={filter === "new_projects" ? "dark" : "outline"}
                size="sm"
                radius="full"
                onClick={() => setFilter("new_projects")}
                className={`px-3 sm:px-3.5 py-1.5 font-semibold text-xs sm:text-[13px] !inline-flex !items-center !flex-nowrap !whitespace-nowrap shrink-0 ${filter === "new_projects" ? "!bg-[#0D6D5F] hover:!bg-[#0B403F] text-white border-transparent" : ""
                  }`}
              >
                <span className="whitespace-nowrap shrink-0">New Projects</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap ${filter === "new_projects" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                  }`}>
                  {counts.new_projects}
                </span>
              </Button>

              <Button
                type="button"
                variant={filter === "open" ? "dark" : "outline"}
                size="sm"
                radius="full"
                onClick={() => setFilter("open")}
                className="px-3 sm:px-3.5 py-1.5 font-semibold text-xs sm:text-[13px] !inline-flex !items-center !flex-nowrap !whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap shrink-0">Open</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap ${filter === "open" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                  {counts.open}
                </span>
              </Button>

              <Button
                type="button"
                variant={filter === "closed" ? "dark" : "outline"}
                size="sm"
                radius="full"
                onClick={() => setFilter("closed")}
                className="px-3 sm:px-3.5 py-1.5 font-semibold text-xs sm:text-[13px] !inline-flex !items-center !flex-nowrap !whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap shrink-0">Closed</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap ${filter === "closed" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                  {counts.closed}
                </span>
              </Button>
            </div>
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto shrink-0">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 sm:w-64 min-w-0">
              <FiSearch className="absolute left-3 text-slate-400 text-xs sm:text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-7 py-2 bg-white border border-slate-200 focus:border-[#0D6D5F] focus:ring-1 focus:ring-[#0D6D5F] rounded-[6px] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-2xs h-[38px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Clear search"
                >
                  <FiX className="text-xs" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative flex items-center w-full sm:w-auto shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#0D6D5F] rounded-[6px] text-xs sm:text-[13px] text-slate-700 font-medium outline-none cursor-pointer shadow-2xs h-[38px]"
              >
                <option value="newest">Sort: Newest</option>
                <option value="proposals">Sort: Most Proposals</option>
                <option value="budget">Sort: Budget</option>
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-24">
            <Loader size={45} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-[6px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-14 h-14 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl mb-4 text-slate-400">
              📁
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              {emptyState.title}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6">
              {emptyState.description}
            </p>
            {filter === "all" && !searchQuery && !user?.isSeller ? (
              <Link
                href="/briefs/create"
                className="px-5 py-2.5 rounded-[6px] font-semibold text-xs sm:text-sm bg-[#0B0F19] hover:bg-black text-white transition-colors cursor-pointer shadow-xs"
              >
                Post Your First Project
              </Link>
            ) : (
              <Button
                type="button"
                variant="soft"
                size="md"
                radius="xl"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Show All Projects
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((brief: any, index: number) => {
              const isClosed = brief.isClosed || brief.status === "closed";
              const isNew = isProjectNew(brief);
              const proposalCount =
                brief.proposalCount ??
                brief.proposalsCount ??
                (Array.isArray(brief.proposals) ? brief.proposals.length : 0);
              const tags = getBriefTags(brief);
              const workType = getWorkType(brief, index);
              const rateBadge = getRateBadge(brief);
              const isMenuOpen = openMenuId === brief._id;

              return (
                <div
                  key={brief._id}
                  onClick={() => router.push(`/briefs/${brief._id}`)}
                  className="relative overflow-hidden bg-white rounded-[6px] border border-slate-200/90 hover:border-[var(--purple-200,#B78AF7)] hover:rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md p-5 sm:p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group cursor-pointer"
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

                  {/* Top Header Row */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-[19px] font-bold text-slate-900 tracking-tight group-hover:text-slate-950 truncate">
                          {brief.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <span>Posted {moment(brief.createdAt).fromNow()}</span>
                          <span>{workType}</span>


                          {isClosed && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 font-semibold bg-rose-50 border border-rose-200/80 text-[11px] px-2 py-0.5 rounded-full">
                                Closed
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Badges & Menu */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Purple Rate Pill */}
                        <span className="bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {rateBadge}
                        </span>

                        {/* Category Pill */}
                        <span className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full max-w-[150px] truncate hidden sm:inline-block">
                          {brief.category || "General"}
                        </span>

                        {/* More Action Menu Button */}
                        <div
                          className="relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : brief._id);
                          }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            radius="full"
                            className="w-8 h-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none shadow-none"
                            title="Options"
                          >
                            <FiMoreVertical className="text-base" />
                          </Button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 w-44 bg-white border border-gray-100 rounded-[6px] shadow-xl py-1.5 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                radius="none"
                                fullWidth
                                onClick={() => {
                                  setOpenMenuId(null);
                                  router.push(`/briefs/${brief._id}`);
                                }}
                                leftIcon={<FiEye className="text-slate-400 group-hover:text-teal-700" />}
                                className="group justify-start px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-teal-50/70 hover:text-teal-800 border-none shadow-none h-auto min-h-0 transition-colors"
                              >
                                View Details
                              </Button>

                              {!isClosed && proposalCount > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  radius="none"
                                  fullWidth
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    router.push(`/briefs/${brief._id}/proposals`);
                                  }}
                                  leftIcon={<FiUsers className="text-slate-400 group-hover:text-teal-700" />}
                                  className="group justify-start px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-teal-50/70 hover:text-teal-800 border-none shadow-none h-auto min-h-0 transition-colors"
                                >
                                  View Proposals
                                </Button>
                              )}

                              {!isClosed && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  radius="none"
                                  fullWidth
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    closeMutation.mutate(brief._id);
                                  }}
                                  leftIcon={<FiXCircle className="text-rose-500" />}
                                  className="justify-start px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border-none shadow-none h-auto min-h-0 transition-colors"
                                >
                                  Close Project
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 line-clamp-2 my-4 leading-relaxed font-normal">
                      {brief.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-[#F1F3F5] text-slate-700 text-xs font-medium px-3 py-1 rounded-md border border-slate-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Divider & Footer */}
                  <div className="relative z-10 border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                    {/* Left: Avatar Stack and Proposal Count */}
                    <div className="flex items-center">
                      {proposalCount > 0 ? (
                        <>
                          <div className="flex items-center -space-x-2 mr-2.5">
                            {DEFAULT_AVATARS.slice(0, Math.min(3, proposalCount)).map((imgSrc, aIdx) => (
                              <img
                                key={aIdx}
                                src={imgSrc}
                                alt="Applicant"
                                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs"
                              />
                            ))}
                            <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white text-[10px] font-bold text-slate-700 flex items-center justify-center shadow-2xs">
                              {proposalCount > 3 ? `${proposalCount - 2}+` : `${proposalCount}+`}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {proposalCount} {proposalCount === 1 ? "proposal" : "proposals"}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          0 proposals
                        </span>
                      )}
                    </div>

                    {/* Right: View Details Link */}
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0D9488] group-hover:underline">
                      <span>View Details</span>
                      <FiArrowRight className="text-sm group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const MyProposals = () => {
  const router = useRouter();
  const { isLoading, data: proposals = [] } = useQuery({
    queryKey: ["my-proposals"],
    queryFn: () =>
      axiosFetch
        .get("/briefs/my-proposals")
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.proposals)) return data.proposals;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
  });

  const proposalsArray = Array.isArray(proposals) ? proposals : [];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-6 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6">

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight">
              My Proposals
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Track your submitted proposals, client responses, and bidding status.
            </p>
          </div>
          <Link
            href="/briefs"
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[6px] bg-[#0B0F19] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0 self-start sm:self-center"
          >
            <span>Browse Open Projects</span>
          </Link>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-24">
            <Loader size={45} />
          </div>
        ) : proposalsArray.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-[6px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-14 h-14 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl mb-4 text-slate-400">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">No proposals submitted</h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6">
              You haven&apos;t submitted any proposals yet. Browse open client projects and start pitching!
            </p>
            <Link
              href="/briefs"
              className="px-5 py-2.5 rounded-[6px] font-semibold text-xs sm:text-sm bg-[#0B0F19] hover:bg-black text-white transition-colors cursor-pointer shadow-xs"
            >
              Browse Open Projects
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proposalsArray.map((proposal: any) => {
              const brief = proposal.briefID || {};
              const briefId = brief._id || proposal.briefID;

              return (
                <div
                  key={proposal._id}
                  onClick={() => router.push(`/briefs/${briefId}`)}
                  className="relative overflow-hidden bg-white rounded-[6px] border border-slate-200/90 hover:border-[var(--purple-200,#B78AF7)] hover:rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group cursor-pointer"
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

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-[19px] font-bold text-slate-900 tracking-tight group-hover:text-slate-950 truncate">
                          {brief.title || "Project Proposal"}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <span>Submitted {moment(proposal.createdAt).fromNow()}</span>
                          {proposal.status && (
                            <>
                              <span>•</span>
                              <span
                                className={`font-semibold capitalize ${proposal.status === "accepted"
                                  ? "text-emerald-600"
                                  : proposal.status === "rejected"
                                    ? "text-rose-600"
                                    : "text-amber-600"
                                  }`}
                              >
                                {proposal.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {proposal.price && (
                          <span className="bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            ${proposal.price}
                          </span>
                        )}
                        {proposal.deliveryTime && (
                          <span className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                            {proposal.deliveryTime} Days
                          </span>
                        )}
                      </div>
                    </div>

                    {proposal.coverLetter && (
                      <p className="text-sm text-slate-600 line-clamp-3 my-4 leading-relaxed font-normal">
                        {proposal.coverLetter}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400 font-medium">
                      Status:{" "}
                      <strong className="text-slate-700 capitalize">
                        {proposal.status || "Pending"}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0D9488] group-hover:underline">
                      <span>View Project</span>
                      <FiArrowRight className="text-sm group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyBriefsPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.isSeller) {
      router.replace("/briefs/my-proposals");
    }
  }, [user?.isSeller, router]);

  return user?.isSeller ? <MyProposals /> : <MyBriefs />;
}

