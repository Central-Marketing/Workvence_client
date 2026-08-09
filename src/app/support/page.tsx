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
} from "lucide-react";
import { supportService, SupportTicketItem } from "@/utils/supportService";

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
    return tickets.filter((t) => {
      const matchesCat =
        selectedCategory === "All" ||
        t.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "All" ||
        t.status?.toLowerCase() === selectedStatus.toLowerCase();

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        t.subject?.toLowerCase().includes(query) ||
        t.ticketNumber?.toLowerCase().includes(query) ||
        t.message?.toLowerCase().includes(query);

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
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1dbf73]/10 text-[#1dbf73] flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight">
                Support & Help Desk
              </h1>
            </div>
            <p className="text-sm text-[#64748b] max-w-2xl">
              Track your open support inquiries, submit new help requests, and communicate directly with platform administrators.
            </p>
          </div>

          <Link
            href="/support/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Support Ticket</span>
          </Link>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Total Tickets
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-[#0f172a]">{stats.total}</span>
              <div className="p-2.5 rounded-lg bg-[#f1f5f9] text-[#475569]">
                <Inbox className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Open Tickets
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-amber-700">{stats.open}</span>
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              In Progress
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-blue-700">{stats.inProgress}</span>
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1dbf73]">
              Resolved / Closed
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-[#1dbf73]">{stats.resolvedClosed}</span>
              <div className="p-2.5 rounded-lg bg-[#1dbf73]/10 text-[#1dbf73]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? "bg-[#1dbf73] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Status Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#e2e8f0]">
            
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-[#64748b] mr-1">Status:</span>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                    selectedStatus === st
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search ticket subject or #ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-xs border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 outline-none"
              />
            </div>

          </div>
        </div>

        {/* Tickets Grid / List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-[#e2e8f0] text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#1dbf73]" />
              <p className="text-xs font-semibold text-[#64748b]">Loading your support tickets...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 p-8 rounded-2xl border border-rose-200 text-center space-y-4">
              <AlertTriangle className="w-10 h-10 mx-auto text-rose-600" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-900">Unable to load tickets</h3>
                <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
              </div>
              <button
                onClick={fetchTickets}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#e2e8f0] text-center space-y-4">
              <MessageSquare className="w-12 h-12 mx-auto text-[#cbd5e1]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0f172a]">No support tickets found</h3>
                <p className="text-xs text-[#64748b] max-w-md mx-auto">
                  {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
                    ? "No tickets match your search or filter selection."
                    : "You haven't submitted any support tickets yet. Need help? Create a ticket to reach out to our team."}
                </p>
              </div>
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold text-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Request</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs hover:border-[#1dbf73] hover:shadow-md transition-all duration-200 space-y-4 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#64748b]">
                          {ticket.ticketNumber}
                        </span>
                        {formatStatusPill(ticket.status)}
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#475569]">
                          {ticket.category || "General Support"}
                        </span>
                        {ticket.adminResponded && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1dbf73]/10 text-[#1dbf73]">
                            Admin Responded
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#0f172a] group-hover:text-[#1dbf73] transition-colors">
                        {ticket.subject}
                      </h3>
                    </div>

                    <Link
                      href={`/support/${ticket.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#f1f5f9] hover:bg-[#1dbf73] hover:text-white text-[#334155] font-semibold text-xs transition cursor-pointer"
                    >
                      <span>View Ticket</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <p className="text-xs text-[#64748b] line-clamp-2 bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                    {ticket.message || "No preview available."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#94a3b8] pt-1 border-t border-[#f1f5f9]">
                    <span>Submitted on: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span>{ticket.messageCount || 1} Message(s)</span>
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
