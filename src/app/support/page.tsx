"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Wrench,
  Sparkles,
  CreditCard,
  UserCheck,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";
import { supportService, SupportTicketItem } from "@/utils/supportService";
import { Button } from "@/components/ui";

const CATEGORIES = [
  { id: "All", label: "All Categories", icon: Inbox },
  { id: "Account & Billing", label: "Account & Billing", icon: UserCheck },
  { id: "Content & Listing Violation", label: "Content Violations", icon: ShieldAlert },
  { id: "Payment & Escrow", label: "Payment & Escrow", icon: CreditCard },
  { id: "Technical Support", label: "Technical Support", icon: Wrench },
  { id: "Platform Feedback", label: "Platform Feedback", icon: Sparkles },
];

const STATUSES = ["All", "open", "in_progress", "resolved", "closed"] as const;

export default function SupportDashboardPage() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedCategory !== "All" || selectedStatus !== "All";
  const activeFiltersCount = (selectedCategory !== "All" ? 1 : 0) + (selectedStatus !== "All" ? 1 : 0);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch (err: any) {
      console.error("Failed to load support tickets:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const resolvedClosed = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
    return { total, open, inProgress, resolvedClosed };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/^#/, "");

    return tickets.filter((t) => {
      const matchesCat =
        selectedCategory === "All" ||
        t.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "All" ||
        t.status?.toLowerCase() === selectedStatus.toLowerCase();

      const rawTicketNumber = t.ticketNumber || (t.id ? `#TK-${t.id.substring(0, 6).toUpperCase()}` : "");
      const tNumber = rawTicketNumber.toLowerCase();
      const cleanTNumber = tNumber.replace(/^#/, "");
      const tId = String(t.id || t._id || "").toLowerCase();

      const matchesSearch =
        !q ||
        t.subject?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q) ||
        tNumber.includes(q) ||
        cleanTNumber.includes(cleanQ) ||
        tId.includes(cleanQ) ||
        (t.orderID && String(t.orderID).toLowerCase().includes(cleanQ));

      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [tickets, selectedCategory, selectedStatus, searchQuery]);

  const formatStatusPill = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case "escalated_to_dispute":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3 h-3" /> Escalated to Dispute
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-10 pb-[80px] min-[1400px]:pb-[100px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[6px] border border-[#e2e8f0] shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#327C73]/10 text-[#327C73] flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight font-sf-pro">
                Support & Help Desk
              </h1>
            </div>
            <p className="text-sm text-[#64748b] max-w-2xl font-inter">
              Track your open support inquiries, submit new help requests, and communicate directly with platform administrators.
            </p>
          </div>

          <Link
            href="/support/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap font-sf-pro"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Support Ticket</span>
          </Link>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Total Tickets
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#0f172a]">{stats.total}</span>
              <div className="p-2.5 rounded-[6px] bg-[#f1f5f9] text-[#475569]">
                <Inbox className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 p-5 rounded-[6px] border border-amber-200 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Open Tickets
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-amber-700">{stats.open}</span>
              <div className="p-2.5 rounded-[6px] bg-amber-100 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-[6px] border border-blue-200 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              In Progress
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-700">{stats.inProgress}</span>
              <div className="p-2.5 rounded-[6px] bg-blue-100 text-blue-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-5 rounded-[6px] border border-emerald-200 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#327C73]">
              Resolved / Closed
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#327C73]">{stats.resolvedClosed}</span>
              <div className="p-2.5 rounded-[6px] bg-[#327C73]/10 text-[#327C73]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search ticket subject or #ID (e.g. TK-F290F6)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-[6px] text-xs border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:bg-white focus:border-[#327C73] focus:ring-2 focus:ring-[#327C73]/10 outline-none font-inter transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center gap-2 justify-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedStatus("All");
                  }}
                  className="text-xs font-semibold text-[#64748b] hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-semibold border transition-all cursor-pointer font-sf-pro ${
                  showFilters || hasActiveFilters
                    ? "bg-[#327C73]/10 border-[#327C73] text-[#327C73] shadow-xs"
                    : "bg-[#f8fafc] border-[#e2e8f0] text-[#334155] hover:bg-[#f1f5f9] hover:border-[#cbd5e1]"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#327C73] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Collapsible Filter Panel (Initially false, shown on click) */}
          {showFilters && (
            <div className="pt-4 border-t border-[#e2e8f0] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Category Tabs */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Category:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <Button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        variant={isSelected ? "brand" : "soft"}
                        size="sm"
                        radius="fiverr"
                        leftIcon={<Icon className="w-3.5 h-3.5" />}
                        className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shadow-xs"
                      >
                        {cat.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Status Pills */}
              <div className="space-y-1.5 pt-2 border-t border-[#f1f5f9]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Status:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {STATUSES.map((st) => (
                    <Button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      variant={selectedStatus === st ? "dark" : "ghost"}
                      size="xs"
                      radius="fiverr"
                      className="px-3 py-1.5 font-semibold capitalize text-xs"
                    >
                      {st.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tickets Grid / List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-[6px] border border-[#e2e8f0] text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#327C73]" />
              <p className="text-xs font-semibold text-[#64748b]">Loading your support tickets...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 p-8 rounded-[6px] border border-rose-200 text-center space-y-4">
              <AlertTriangle className="w-10 h-10 mx-auto text-rose-600" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-900">Unable to load tickets</h3>
                <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
              </div>
              <Button
                onClick={fetchTickets}
                variant="danger"
                size="sm"
                radius="fiverr"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="px-5 py-2.5 font-semibold text-xs shadow-xs"
              >
                Retry
              </Button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white p-12 rounded-[6px] border border-[#e2e8f0] text-center space-y-4">
              <MessageSquare className="w-12 h-12 mx-auto text-[#cbd5e1]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0f172a] font-sf-pro">No support tickets found</h3>
                <p className="text-xs text-[#64748b] max-w-md mx-auto font-inter">
                  {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
                    ? "No tickets match your search or filter selection."
                    : "You haven't submitted any support tickets yet. Need help? Create a ticket to reach out to our team."}
                </p>
              </div>
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs transition cursor-pointer font-sf-pro shadow-xs active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Request</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs hover:border-[#327C73] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Ticket ID & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-[#64748b]">
                        {ticket.ticketNumber || `#TK-${String(ticket.id || ticket._id).substring(0, 6).toUpperCase()}`}
                      </span>
                      {formatStatusPill(ticket.status)}
                    </div>

                    {/* Category & Responded Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#475569]">
                        {ticket.category || "General Support"}
                      </span>
                      {ticket.adminResponded && (
                        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#327C73]/10 text-[#327C73]">
                          Admin Responded
                        </span>
                      )}
                    </div>

                    {/* Ticket Subject */}
                    <Link href={`/support/${ticket.id}`} className="block">
                      <h3 className="text-sm sm:text-[15px] font-bold text-[#0f172a] group-hover:text-[#327C73] transition-colors font-sf-pro line-clamp-2 leading-snug">
                        {ticket.subject}
                      </h3>
                    </Link>

                    {/* Preview Message */}
                    <p className="text-xs text-[#64748b] line-clamp-2 bg-[#f8fafc] p-2.5 rounded-[6px] border border-[#e2e8f0] leading-relaxed">
                      {ticket.message || "No preview available."}
                    </p>
                  </div>

                  {/* Footer Meta & Button */}
                  <div className="pt-3 mt-4 border-t border-[#f1f5f9] space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>{ticket.messageCount || 1} Message(s)</span>
                    </div>

                    <Link
                      href={`/support/${ticket.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[6px] bg-[#f8fafc] group-hover:bg-[#327C73] group-hover:text-white text-[#334155] border border-[#e2e8f0] group-hover:border-[#327C73] font-semibold text-xs transition duration-150 cursor-pointer font-sf-pro shadow-2xs"
                    >
                      <span>View Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
