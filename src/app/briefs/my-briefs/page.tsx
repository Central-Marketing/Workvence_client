"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";
import {
  FiHome,
  FiMoreVertical,
  FiPlus,
  FiEye,
  FiUsers,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, Button } from "@/components";

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

const MyBriefs = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
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

  const filtered = useMemo(() => {
    if (filter === "all") return briefsArray;
    if (filter === "open") {
      return briefsArray.filter((b) => !b.isClosed && b.status !== "closed");
    }
    return briefsArray.filter((b) => b.isClosed || b.status === "closed");
  }, [briefsArray, filter]);

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
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium mb-3">
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
          >
            <FiHome className="text-sm" />
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Projects</span>
        </div>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight">
              My Projects
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Keep track of your projects, progress, milestones, and updates all in one place.
            </p>
          </div>
          {!user?.isSeller && (
            <Link
              href="/briefs/create"
              className="
    inline-flex items-center justify-center
    gap-2
    px-3 sm:px-4.5
    py-2 sm:py-2.5
    rounded-xl
    bg-[#0B0F19]
    hover:bg-black
    text-white
    text-xs sm:text-sm
    font-semibold
    transition-colors
    shadow-xs
    shrink-0
    self-start sm:self-center
  "
            >
              <FiPlus className="text-sm" />
              <span>Post New Project</span>
            </Link>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2.5 mb-8">
          <Button
            type="button"
            variant={filter === "all" ? "dark" : "outline"}
            size="sm"
            radius="full"
            onClick={() => setFilter("all")}
            className="px-4 font-semibold text-xs sm:text-sm"
          >
            All Projects
          </Button>
          <Button
            type="button"
            variant={filter === "open" ? "dark" : "outline"}
            size="sm"
            radius="full"
            onClick={() => setFilter("open")}
            className="px-4 font-semibold text-xs sm:text-sm"
          >
            Open
          </Button>
          <Button
            type="button"
            variant={filter === "closed" ? "dark" : "outline"}
            size="sm"
            radius="full"
            onClick={() => setFilter("closed")}
            className="px-4 font-semibold text-xs sm:text-sm"
          >
            Closed
          </Button>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-24">
            <Loader size={45} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl mb-4 text-slate-400">
              📁
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              {filter === "all" ? "No projects posted yet" : `No ${filter} projects`}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6">
              {filter === "all"
                ? "Post your project specifications to receive detailed proposals from vetted freelancers."
                : "No projects match the selected filter."}
            </p>
            {filter === "all" && !user?.isSeller ? (
              <Link
                href="/briefs/create"
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#0B0F19] hover:bg-black text-white transition-colors cursor-pointer shadow-xs"
              >
                Post Your First Project
              </Link>
            ) : filter !== "all" ? (
              <Button
                type="button"
                variant="soft"
                size="md"
                radius="xl"
                onClick={() => setFilter("all")}
                className="px-5 py-2.5 font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Show All Projects
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((brief: any, index: number) => {
              const isClosed = brief.isClosed || brief.status === "closed";
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
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-purple-50/20 group cursor-pointer relative"
                >
                  {/* Top Header Row */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-[19px] font-bold text-slate-900 tracking-tight group-hover:text-slate-950 truncate">
                          {brief.title}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <span>Posted {moment(brief.createdAt).fromNow()}</span>
                          <span>•</span>
                          <span>{workType}</span>
                          {isClosed && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 font-semibold">Closed</span>
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
                              className="absolute right-0 top-9 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20"
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
                                leftIcon={<FiEye className="text-slate-400" />}
                                className="justify-start px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border-none shadow-none h-auto min-h-0"
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
                                  leftIcon={<FiUsers className="text-slate-400" />}
                                  className="justify-start px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 border-none shadow-none h-auto min-h-0"
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
                                  className="justify-start px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border-none shadow-none h-auto min-h-0"
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
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
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
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium mb-3">
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
          >
            <FiHome className="text-sm" />
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Proposals</span>
        </div>

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
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0 self-start sm:self-center"
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
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl mb-4 text-slate-400">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">No proposals submitted</h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6">
              You haven&apos;t submitted any proposals yet. Browse open client projects and start pitching!
            </p>
            <Link
              href="/briefs"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#0B0F19] hover:bg-black text-white transition-colors cursor-pointer shadow-xs"
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
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-purple-50/20 group cursor-pointer"
                >
                  <div>
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

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
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

  return user?.isSeller ? <MyProposals /> : <MyBriefs />;
}
