"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import {
  FiArrowRight,
  FiSearch,
  FiX,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPaperclip,
  FiExternalLink,
  FiFileText,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, Button } from "@/components";

type StatusFilter = "all" | "open" | "closed";

export default function MyProposalsPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper to determine if proposal is active/open (pending review, project not closed)
  const isProposalOpen = (p: any) => {
    const s = (p.status || "pending").toLowerCase();
    const brief = typeof p.briefID === "object" && p.briefID !== null ? p.briefID : {};
    const isBriefClosed = brief.isClosed || brief.status === "closed";
    if (isBriefClosed || s === "closed" || s === "rejected" || s === "accepted") {
      return false;
    }
    return s === "pending" || s === "open";
  };

  const isProposalClosed = (p: any) => {
    return !isProposalOpen(p);
  };

  // Fetch submitted proposals from backend endpoint
  const { isLoading, data: rawData = [] } = useQuery({
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

  const proposals: any[] = useMemo(() => {
    return Array.isArray(rawData) ? rawData : [];
  }, [rawData]);

  // Dynamic counts for 3 status filters: All, Open (pending), Closed
  const counts = useMemo(() => {
    let open = 0;
    let closed = 0;
    proposals.forEach((p) => {
      if (isProposalOpen(p)) open += 1;
      else closed += 1;
    });
    return { all: proposals.length, open, closed };
  }, [proposals]);

  // Filtered & searched proposals list
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (statusFilter === "open" && !isProposalOpen(p)) return false;
      if (statusFilter === "closed" && !isProposalClosed(p)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const brief = typeof p.briefID === "object" && p.briefID !== null ? p.briefID : {};
        const title = (brief.title || p.title || "").toLowerCase();
        const letter = (p.coverLetter || "").toLowerCase();
        const category = (brief.category || "").toLowerCase();
        if (!title.includes(query) && !letter.includes(query) && !category.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [proposals, statusFilter, searchQuery]);

  const getStatusBadge = (status: string, brief?: any) => {
    const s = (status || "pending").toLowerCase();
    const isBriefClosed = brief?.isClosed || brief?.status === "closed";

    if (s === "accepted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>Accepted</span>
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <FiXCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      );
    }
    if (isBriefClosed || s === "closed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <FiXCircle className="w-3.5 h-3.5" />
          <span>Closed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <FiClock className="w-3.5 h-3.5" />
        <span>Open</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-6 sm:pt-10 pb-20 font-sans">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0D6D5F] bg-teal-50 px-2 py-0.5 rounded">
                Seller Hub
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-xs font-medium text-gray-500">Proposals</span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-medium text-gray-950 tracking-tight font-sf-pro">
              My Submitted Proposals
            </h1>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Keep track of your bids, client responses, and proposal status for open client projects.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <Button
              href="/briefs"
              variant="brand"
              size="sm"
              radius="fiverr"
              rightIcon={<FiArrowRight className="w-4 h-4" />}
            >
              Explore Projects
            </Button>
          </div>
        </div>

        {/* Controls: Status Filters & Search Bar */}
        <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-4 sm:p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs: 3 tabs (All Proposals, Open, Closed) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {(
              [
                { id: "all", label: "All Proposals", count: counts.all },
                { id: "open", label: "Open", count: counts.open },
                { id: "closed", label: "Closed", count: counts.closed },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  type="button"
                  variant={active ? "brand" : "ghost"}
                  size="sm"
                  radius="fiverr"
                  className={`px-3.5 py-2 font-semibold text-xs sm:text-[13px] whitespace-nowrap shrink-0 ${active
                    ? "!bg-[#0D6D5F] text-white shadow-2xs"
                    : "!bg-gray-50 !text-gray-600 hover:!bg-gray-100 hover:!text-gray-900 border border-transparent"
                    }`}
                >
                  <span className="whitespace-nowrap shrink-0">{tab.label}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none shrink-0 ${active
                      ? "bg-white/20 text-white"
                      : "bg-gray-200/80 text-gray-700"
                      }`}
                  >
                    {tab.count}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by project or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs sm:text-[13px] bg-[#F4F5F7] border border-transparent focus:border-gray-300 focus:bg-white rounded-[6px] transition-colors outline-hidden text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="w-full flex flex-col justify-center items-center py-24 bg-white rounded-[6px] border border-gray-200/80 shadow-2xs">
            <Loader size={40} />
            <p className="text-xs text-gray-400 mt-3 font-medium">Loading your submitted proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
              <FiFileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-950 mb-1.5 font-sf-pro">
              {searchQuery || statusFilter !== "all"
                ? "No matching proposals found"
                : "No proposals submitted yet"}
            </h3>
            <p className="text-gray-500 text-xs sm:text-[13px] max-w-md mb-6 leading-relaxed">
              {searchQuery || statusFilter !== "all"
                ? "Try clearing your search query or selecting a different status filter."
                : "You haven't submitted any proposals yet. Browse open client projects to find work that matches your skills and pitch to clients!"}
            </p>
            {searchQuery || statusFilter !== "all" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                radius="fiverr"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Link
                href="/briefs"
                className="px-5 py-2.5 rounded-[6px] font-semibold text-xs sm:text-[13px] bg-[#0D6D5F] hover:bg-[#0B5C50] text-white transition-colors cursor-pointer shadow-2xs"
              >
                Browse Open Projects
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredProposals.map((proposal) => {
              const brief =
                typeof proposal.briefID === "object" && proposal.briefID !== null
                  ? proposal.briefID
                  : typeof proposal.brief === "object" && proposal.brief !== null
                    ? proposal.brief
                    : {};
              const briefId =
                brief._id ||
                brief.id ||
                (typeof proposal.briefID === "string" ? proposal.briefID : proposal.briefId);

              const projectTitle = brief.title || proposal.title || "Project Proposal";
              const briefBudget = brief.budget;
              const hasAttachments =
                Array.isArray(proposal.attachments) && proposal.attachments.length > 0;

              return (
                <div
                  key={proposal._id || proposal.id}
                  onClick={() => setSelectedProposal(proposal)}
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

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      {/* Top Row: Title, Date, and Status Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {brief.category && (
                              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {brief.category}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              <span>Submitted {moment(proposal.createdAt).fromNow()}</span>
                            </span>
                          </div>
                          <h2 className="text-base sm:text-[19px] font-bold text-slate-900 tracking-tight line-clamp-2 group-hover:text-slate-950 transition-colors font-sf-pro">
                            {projectTitle}
                          </h2>
                        </div>
                        <div className="shrink-0">{getStatusBadge(proposal.status, brief)}</div>
                      </div>

                      {/* Price & Delivery duration tags */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-3.5 pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 text-xs font-bold">
                          <FiDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Your Bid: ${proposal.price}</span>
                        </div>
                        {proposal.deliveryTime && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-gray-100 text-gray-700 border border-gray-200/60 text-xs font-semibold">
                            <FiClock className="w-3.5 h-3.5 text-gray-500" />
                            <span>{proposal.deliveryTime} Days Delivery</span>
                          </div>
                        )}
                        {briefBudget && (
                          <div className="text-[11px] text-gray-400 font-medium ml-auto">
                            Client Budget:{" "}
                            <strong className="text-gray-600">
                              {typeof briefBudget === "number" ? `$${briefBudget}` : briefBudget}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Excerpt */}
                      {proposal.coverLetter && (
                        <p className="text-xs sm:text-[13px] text-gray-600 line-clamp-3 leading-relaxed mb-4 bg-gray-50/60 p-3 rounded-[6px] border border-gray-100 font-normal">
                          {proposal.coverLetter}
                        </p>
                      )}

                      {/* Attachment preview indicator */}
                      {hasAttachments && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3 font-medium">
                          <FiPaperclip className="w-3.5 h-3.5 text-gray-400" />
                          <span>{proposal.attachments.length} attachment(s) included</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-3 mt-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        radius="fiverr"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProposal(proposal);
                        }}
                        className="text-xs sm:text-[13px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0 h-auto"
                      >
                        View Full Proposal
                      </Button>

                      {briefId && (
                        <Link
                          href={`/briefs/${briefId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#0D6D5F] hover:text-[#0B5C50] group-hover:underline transition-colors"
                        >
                          <span>View Project</span>
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out Drawer for Full Proposal Details */}
      <div
        className={`fixed inset-0 z-[1000] transition-all duration-300 ${selectedProposal ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
          }`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${selectedProposal ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setSelectedProposal(null)}
          aria-hidden="true"
        />

        {/* Drawer Panel from Right */}
        <aside
          className={`fixed inset-y-0 right-0 z-[1001] w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden transform transition-transform duration-300 ease-out ${selectedProposal ? "translate-x-0" : "translate-x-full"
            }`}
          role="dialog"
          aria-modal="true"
          aria-label="Proposal Details"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex justify-between items-center px-6 py-4.5 border-b border-gray-100 bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Proposal Details
                </span>
                {selectedProposal && getStatusBadge(selectedProposal.status, selectedProposal.briefID)}
              </div>
              <h2 className="text-lg font-bold text-gray-950 font-sf-pro truncate max-w-md">
                {(() => {
                  const brief =
                    typeof selectedProposal?.briefID === "object" && selectedProposal?.briefID !== null
                      ? selectedProposal.briefID
                      : {};
                  return brief.title || selectedProposal?.title || "Submitted Proposal";
                })()}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              onClick={() => setSelectedProposal(null)}
              className="w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 border-none shadow-none"
              title="Close"
            >
              <FiX className="w-4 h-4" />
            </Button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1 text-xs sm:text-[13px]">
            {/* Price & Delivery Highlights */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-[6px] border border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Offered Price
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 font-sf-pro">
                  ${selectedProposal?.price}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Delivery Time
                </span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 font-sf-pro">
                  {selectedProposal?.deliveryTime} Days
                </span>
              </div>
            </div>

            {/* Submission Timing */}
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Submitted on{" "}
                <strong className="text-gray-700">
                  {moment(selectedProposal?.createdAt).format("MMMM D, YYYY [at] h:mm A")}
                </strong>{" "}
                ({moment(selectedProposal?.createdAt).fromNow()})
              </span>
            </div>

            {/* Full Cover Letter */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Cover Letter
              </h3>
              <div className="text-xs sm:text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-[6px] border border-gray-200">
                {selectedProposal?.coverLetter || "No cover letter provided."}
              </div>
            </div>

            {/* Attachments if available */}
            {Array.isArray(selectedProposal?.attachments) &&
              selectedProposal.attachments.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Attachments ({selectedProposal.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedProposal.attachments.map((fileUrl: string, idx: number) => (
                      <a
                        key={idx}
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-[6px] border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FiPaperclip className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="truncate text-xs font-medium">
                            Attachment {idx + 1}
                          </span>
                        </div>
                        <FiExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Brief/Project Details Overview */}
            {(() => {
              const brief =
                typeof selectedProposal?.briefID === "object" && selectedProposal?.briefID !== null
                  ? selectedProposal.briefID
                  : {};
              const briefId =
                brief._id ||
                brief.id ||
                (typeof selectedProposal?.briefID === "string" ? selectedProposal.briefID : null);

              if (!brief.title && !brief.description) return null;

              return (
                <div className="mt-2 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Associated Project Brief
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-[6px] border border-gray-200/80 space-y-2">
                    <div className="font-bold text-gray-900 text-sm">{brief.title}</div>
                    {brief.budget && (
                      <div className="text-xs text-gray-500">
                        Client Budget:{" "}
                        <span className="font-semibold text-gray-800">
                          {typeof brief.budget === "number" ? `$${brief.budget}` : brief.budget}
                        </span>
                      </div>
                    )}
                    {brief.description && (
                      <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">
                        {brief.description}
                      </p>
                    )}
                    {briefId && (
                      <div className="pt-2">
                        <Link
                          href={`/briefs/${briefId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6D5F] hover:underline"
                        >
                          <span>Open Full Project Page</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              radius="fiverr"
              onClick={() => setSelectedProposal(null)}
            >
              Close
            </Button>
            {(() => {
              const brief =
                typeof selectedProposal?.briefID === "object" && selectedProposal?.briefID !== null
                  ? selectedProposal.briefID
                  : {};
              const briefId =
                brief._id ||
                brief.id ||
                (typeof selectedProposal?.briefID === "string" ? selectedProposal.briefID : null);
              if (!briefId) return null;
              return (
                <Link
                  href={`/briefs/${briefId}`}
                  className="px-4 py-2 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0B5C50] text-white text-xs font-semibold transition-colors"
                >
                  View Project
                </Link>
              );
            })()}
          </div>
        </aside>
      </div>
    </div>
  );
}
