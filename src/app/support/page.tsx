"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import moment from "moment";
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
  ShoppingBag,
  User,
  RotateCcw,
} from "lucide-react";
import { supportService, SupportTicketItem } from "@/utils/supportService";
import { Button, PageHeader } from "@/components/ui";

const CATEGORIES = [
  { id: "All", label: "All Categories", icon: Inbox },
  { id: "Account & Billing", label: "Account & Billing", icon: UserCheck },
  { id: "Content & Listing Violation", label: "Content Violations", icon: ShieldAlert },
  { id: "Payment & Escrow", label: "Payment & Escrow", icon: CreditCard },
  { id: "Technical Support", label: "Technical Support", icon: Wrench },
  { id: "Platform Feedback", label: "Platform Feedback", icon: Sparkles },
];

const STATUSES = ["All", "open", "in_progress", "escalated_to_dispute", "resolved", "closed"] as const;

export default function SupportDashboardPage() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [relationshipFilter, setRelationshipFilter] = useState<"all" | "created_by_me" | "linked_order">("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "All" ||
    selectedStatus !== "All" ||
    relationshipFilter !== "all";

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedStatus !== "All" ? 1 : 0) +
    (relationshipFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setRelationshipFilter("all");
  };

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

  const relationshipCounts = useMemo(() => {
    const total = tickets.length;
    const createdByMe = tickets.filter(
      (t) => t.isCreator !== false && t.ticketRelationship !== "linked_order"
    ).length;
    const linkedOrders = tickets.filter(
      (t) => t.ticketRelationship === "linked_order" || t.isCreator === false || Boolean(t.order)
    ).length;
    return { total, createdByMe, linkedOrders };
  }, [tickets]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: tickets.length };
    STATUSES.forEach((st) => {
      if (st !== "All") {
        counts[st] = tickets.filter(
          (t) => t.status?.toLowerCase() === st.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [tickets]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: tickets.length };
    CATEGORIES.forEach((cat) => {
      if (cat.id !== "All") {
        counts[cat.id] = tickets.filter(
          (t) => t.category?.toLowerCase() === cat.id.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/^#/, "");

    return tickets.filter((t) => {
      const matchesRelationship =
        relationshipFilter === "all" ||
        (relationshipFilter === "created_by_me" && t.isCreator !== false && t.ticketRelationship !== "linked_order") ||
        (relationshipFilter === "linked_order" && (t.ticketRelationship === "linked_order" || t.isCreator === false || Boolean(t.order)));

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

      const orderCode = t.order?.orderCode || t.order?.code || "";
      const otherPartyName = t.otherParty?.name || "";

      const matchesSearch =
        !q ||
        t.subject?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q) ||
        tNumber.includes(q) ||
        cleanTNumber.includes(cleanQ) ||
        tId.includes(cleanQ) ||
        (t.orderID && String(t.orderID).toLowerCase().includes(cleanQ)) ||
        (orderCode && orderCode.toLowerCase().includes(cleanQ)) ||
        (otherPartyName && otherPartyName.toLowerCase().includes(q));

      return matchesRelationship && matchesCat && matchesStatus && matchesSearch;
    });
  }, [tickets, relationshipFilter, selectedCategory, selectedStatus, searchQuery]);

  const formatStatusPill = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-tight inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-tight inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            In Progress
          </span>
        );
      case "escalated_to_dispute":
        return (
          <span className="bg-purple-50 text-purple-800 border border-purple-200/80 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-tight inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Escalated
          </span>
        );
      case "resolved":
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-tight inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Resolved
          </span>
        );
      case "closed":
        return (
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap tracking-tight inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            Closed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap tracking-tight capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 md:pt-12 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-7">
        <PageHeader
          homeHref="/dashboard/seller"
          homeTitle="Dashboard"
          breadcrumbs={[{ name: "Support & Help Desk", isLast: true }]}
          title="Support & Help Desk"
          subtitle="Track your open support inquiries, submit new help requests, and communicate directly with platform administrators."
          actions={
            <Button
              href="/support/new"
              variant="brand"
              size="sm"
              radius="fiverr"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="px-5 py-2.5 font-semibold"
            >
              Create Support Ticket
            </Button>
          }
        />

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[6px] border border-[#e2e8f0] shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Total Tickets
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#0f172a]">{stats.total}</span>
              <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)]">
                <Inbox className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[6px] border border-[rgba(0,0,0,0.10)] shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0f172a]">
              Open Tickets
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#0f172a]">{stats.open}</span>
              <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[6px] border border-[rgba(0,0,0,0.10)] shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              In Progress
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-700">{stats.inProgress}</span>
              <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)]">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[6px] border border-[rgba(0,0,0,0.10)] shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#327C73]">
              Resolved / Closed
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#327C73]">{stats.resolvedClosed}</span>
              <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Left Filter Sidebar (Desktop) + Right Tickets Content */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-7">
          {/* Left Filter Sidebar */}
          <aside className="w-full lg:w-[280px] xl:w-[300px] shrink-0 lg:sticky lg:top-24">
            {/* Mobile Filter Toggle Bar (Visible on mobile/tablet < lg) */}
            <div className="lg:hidden mb-3">
              <button
                type="button"
                onClick={() => setShowMobileFilters((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#e2e8f0] rounded-[6px] shadow-xs text-xs font-semibold text-[#0f172a] hover:bg-[#f8fafc] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#327C73]" />
                  <span>Filters & Search</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#327C73] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[#64748b]">
                  <span className="text-[11px] font-medium">{showMobileFilters ? "Hide" : "Show"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMobileFilters ? "rotate-180" : ""}`} />
                </div>
              </button>
            </div>

            {/* Filter Card: sticky + scrollable on desktop, collapsible on mobile */}
            <div
              className={`${showMobileFilters ? "block" : "hidden"
                } lg:block bg-white rounded-[6px] border border-[#e2e8f0] shadow-xs p-5 space-y-6 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200`}
            >
              {/* 1. Header: Filter Title + Active Count + Reset */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#327C73]" />
                  <h3 className="text-sm font-bold text-[#0f172a] font-sf-pro">Filter Tickets</h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#327C73]/10 text-[#327C73] text-[10px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3 h-3 text-[#94a3b8]" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* 2. Search Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] font-sf-pro">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="text"
                    placeholder="Search #ID, subject, order..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-[6px] text-xs border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:bg-white focus:border-[#327C73] focus:ring-1 focus:ring-[#327C73]/20 outline-none font-inter transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Ticket Scope / Relationship Filter */}
              <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] font-sf-pro">
                  Ticket Scope
                </label>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setRelationshipFilter("all")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer font-sf-pro ${relationshipFilter === "all"
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-transparent text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                      }`}
                  >
                    <span>All Tickets</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${relationshipFilter === "all" ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                    >
                      {relationshipCounts.total}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelationshipFilter("created_by_me")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer font-sf-pro ${relationshipFilter === "created_by_me"
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-transparent text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                      }`}
                  >
                    <span>Created by Me</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${relationshipFilter === "created_by_me" ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                    >
                      {relationshipCounts.createdByMe}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelationshipFilter("linked_order")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer font-sf-pro ${relationshipFilter === "linked_order"
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-transparent text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>Linked Orders</span>
                    </div>
                    {relationshipCounts.linkedOrders > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${relationshipFilter === "linked_order" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                          }`}
                      >
                        {relationshipCounts.linkedOrders}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 4. Status Filter */}
              <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] font-sf-pro">
                  Status
                </label>
                <div className="space-y-1">
                  {STATUSES.map((st) => {
                    const isSelected = selectedStatus === st;
                    const count = statusCounts[st as keyof typeof statusCounts] ?? 0;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatus(st)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold capitalize transition-all cursor-pointer font-sf-pro ${isSelected
                          ? "bg-[#0f172a] text-white shadow-xs"
                          : "bg-transparent text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                          }`}
                      >
                        <span>
                          {st === "All"
                            ? "All Statuses"
                            : st === "escalated_to_dispute"
                              ? "Escalated to Dispute"
                              : st.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Category Filter */}
              <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] font-sf-pro">
                  Category
                </label>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    const count = categoryCounts[cat.id] ?? 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer font-sf-pro ${isSelected
                          ? "bg-[#327C73]/10 text-[#327C73] border border-[#327C73]/30 font-bold"
                          : "bg-transparent text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-transparent"
                          }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-1">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#327C73]" : "text-[#94a3b8]"}`} />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isSelected ? "bg-[#327C73] text-white" : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Side: Results Summary Header & Tickets Grid */}
          <div className="flex-1 min-w-0 w-full space-y-4">


            {/* Tickets Grid / List */}
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
                    {searchQuery || selectedCategory !== "All" || selectedStatus !== "All" || relationshipFilter !== "all"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredTickets.map((ticket) => {
                  const ticketId = ticket.id || ticket._id;
                  const ticketNumber =
                    ticket.ticketNumber || `#TK-${String(ticketId).substring(0, 6).toUpperCase()}`;
                  const messagesCount = ticket.messageCount || 1;
                  const otherUser = ticket.otherParty;

                  return (
                    <Link
                      key={ticketId}
                      href={`/support/${ticketId}`}
                      className="relative overflow-hidden bg-white rounded-[6px] border border-gray-200/90 hover:border-[#327C73] p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none"
                    >
                      {/* Top Content Area */}
                      <div>
                        {/* Header Row: Title, Meta, Badges */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-base sm:text-[17px] font-bold text-gray-900 group-hover:text-[#327C73] transition-colors line-clamp-1 tracking-tight">
                              {ticket.subject}
                            </h3>
                          </div>

                          {/* Right Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            {formatStatusPill(ticket.status)}
                            {ticket.category && (
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap hidden sm:inline-block tracking-tight">
                                {ticket.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ticket Message Excerpt */}
                        <p className="text-[13px] text-gray-600 line-clamp-2 my-4 leading-relaxed font-normal">
                          {ticket.message || "No preview available for this ticket."}
                        </p>

                        {/* Tags / Pills Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                          {/* {ticket.isCreator !== false ? (
                            <span className="text-xs font-medium text-gray-600 bg-[#F5F5F7] border border-gray-200/80 px-2.5 py-1 rounded-[6px]">
                              Opened by You
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-blue-700 bg-blue-50/70 border border-blue-200/60 px-2.5 py-1 rounded-[6px]">
                              Opened by {otherUser?.role === "seller" ? "Seller" : otherUser?.role === "buyer" ? "Buyer" : "Other Party"}
                            </span>
                          )} */}

                          {(ticket.order || ticket.orderID) && (
                            <span className="text-xs font-medium text-gray-700 bg-[#F5F5F7] border border-gray-200/80 px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-[#327C73]" />
                              <span>Order #{ticket.order?.orderCode || ticket.order?.code || ticket.orderID}</span>
                              {ticket.order?.price && (
                                <span className="text-gray-500 font-semibold ml-0.5">{ticket.order.price}</span>
                              )}
                            </span>
                          )}


                        </div>
                      </div>

                      {/* Divider & Bottom Counterparty / Activity Bar */}
                      <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
                        {/* User / Requester Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {otherUser?.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name || "User"}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200/80 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200/80 shadow-2xs shrink-0">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs sm:text-[13px] font-semibold text-gray-900 leading-tight truncate">
                              {otherUser?.name || "Support Ticket"}
                            </p>
                            <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                              {otherUser?.role
                                ? `${otherUser.role.charAt(0).toUpperCase() + otherUser.role.slice(1)} • `
                                : ""}
                              {ticket.category || "General Support"}
                            </p>
                          </div>
                        </div>

                        {/* Messages count and view arrow */}
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                            {messagesCount} {messagesCount === 1 ? "message" : "messages"}
                          </p>
                          <p className="text-[11px] text-[#327C73] font-semibold leading-tight mt-0.5 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>View ticket</span>
                            <ArrowRight className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
