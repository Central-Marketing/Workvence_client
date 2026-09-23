"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiCalendar,
  FiFileText,
  FiX,
  FiSearch,
  FiArrowLeft,
} from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, Button } from "@/components";
import { Breadcrumb } from "@/components/ui";

type FilterTab = "priority" | "active" | "late" | "delivered" | "completed" | "cancelled" | "starred";

export default function ContactOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id ? String(params.id) : "";

  const user = useUserStore((state) => state.user);
  const isSeller = Boolean(user?.isSeller);

  // Filter and search state
  const [activeTab, setActiveTab] = useState<FilterTab>("priority");
  const [searchQuery, setSearchQuery] = useState("");

  // Notes Modal state (for viewing instructions/notes)
  const [activeNotesOrder, setActiveNotesOrder] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Fetch Contact User Profile (username, avatar, title, etc.)
  const { data: contactUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["user-profile", contactId],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get(`/users/${contactId}`);
        return data?.user || data?.data || data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(contactId),
    staleTime: 60000,
  });

  // 2. Fetch All User Orders
  const { data: apiOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/orders");
        return Array.isArray(data) ? data : data?.orders || [];
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  // 3. Filter orders to strictly mutual orders between current user and target contact
  const mutualOrders = useMemo(() => {
    if (!Array.isArray(apiOrders) || !user?._id || !contactId) return [];
    const currentUid = String(user._id || user.id);
    const targetUid = String(contactId);

    return apiOrders.filter((order: any) => {
      const sId = String(order.sellerID?._id || order.sellerID || "");
      const bId = String(order.buyerID?._id || order.buyerID || "");

      // If current user is a seller, the contact is the buyer
      if (isSeller) {
        return (sId === currentUid || !order.sellerID) && (bId === targetUid || !order.buyerID);
      }
      // If current user is a buyer, the contact is the seller
      return (bId === currentUid || !order.buyerID) && (sId === targetUid || !order.sellerID);
    });
  }, [apiOrders, user, contactId, isSeller]);

  // Status badge helper for seller view
  const getSellerStatusBadge = (status?: string, isCompleted?: boolean) => {
    if (isCompleted || status === "completed") {
      return { label: "Completed", style: "bg-[#D1FAE5] text-[#059669]" };
    }
    const st = (status || "inprogress").toLowerCase();
    if (st === "delivered") return { label: "Delivered", style: "bg-[#D1FAE5] text-[#059669]" };
    if (st === "revision" || st === "in_revision") return { label: "Revision", style: "bg-[#F3E8FF] text-[#9333EA]" };
    if (st === "late") return { label: "Late", style: "bg-[#FEE2E2] text-[#DC2626]" };
    if (st === "failed" || st === "cancelled") return { label: "Failed", style: "bg-[#FEE2E2] text-[#EF4444]" };
    if (st === "pending") return { label: "Pending", style: "bg-[#FEF3C7] text-[#D97706]" };
    return { label: "Inprogress", style: "bg-[#E0F2FE] text-[#0284C7]" };
  };

  // Status pill helper for buyer view
  const renderBuyerStatusPill = (status?: string, isCompleted?: boolean) => {
    if (isCompleted || status === "completed") {
      return <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Completed</span>;
    }
    const st = (status || "inprogress").toLowerCase();
    if (st === "delivered") {
      return <span className="bg-[#E6FFFA] text-[#0D9488] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Delivered</span>;
    }
    if (st === "revision" || st === "in_revision") {
      return <span className="bg-[#F5F0FF] text-[#8B5CF6] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Revision</span>;
    }
    if (st === "late") {
      return <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Late</span>;
    }
    if (st === "failed") {
      return <span className="bg-[#FEE2E2] text-[#EF4444] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Failed</span>;
    }
    if (st === "cancelled") {
      return <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Cancelled</span>;
    }
    if (st === "pending") {
      return <span className="bg-[#FEF9C3] text-[#CA8A04] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Pending</span>;
    }
    return <span className="bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">Inprogress</span>;
  };

  const renderBadge = (badge?: "Expert" | "Pro" | "Legend") => {
    if (!badge) return null;
    if (badge === "Expert") {
      return (
        <span className="bg-[#5c4928] text-[#FDE68A] text-[10px] font-bold px-2 py-0.5 rounded-[6px] tracking-wider">
          Expert
        </span>
      );
    }
    if (badge === "Pro") {
      return (
        <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-[6px] tracking-wider">
          Pro
        </span>
      );
    }
    if (badge === "Legend") {
      return (
        <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-[6px] tracking-wider">
          Legend
        </span>
      );
    }
    return null;
  };

  // Filter orders by active tab and search query
  const filteredOrders = useMemo(() => {
    return mutualOrders.filter((order: any) => {
      const isCompleted = order.status === "completed" || order.isCompleted === true;
      const st = (order.status || "inprogress").toLowerCase();

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (order.title || order.projectTitle || order.gigID?.title || "").toLowerCase();
        const desc = (order.description || order.projectDescription || "").toLowerCase();
        const code = String(order._id || order.id || "").toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !code.includes(q)) {
          return false;
        }
      }

      // Tab filtering
      if (activeTab === "priority") return true;
      if (activeTab === "active") {
        if (isCompleted) return false;
        if (st === "cancelled" || st === "failed") return false;
        return (
          order.isCompleted === false ||
          st === "paid" ||
          st === "in_progress" ||
          st === "inprogress" ||
          st === "delivered" ||
          st === "in_revision" ||
          st === "revision" ||
          st === "pending" ||
          st === "late" ||
          !order.status
        );
      }
      if (activeTab === "late") return st === "late";
      if (activeTab === "delivered") return st === "delivered";
      if (activeTab === "completed") return isCompleted;
      if (activeTab === "cancelled") return st === "cancelled" || st === "failed";
      if (activeTab === "starred") return Boolean(order.starred);
      return true;
    });
  }, [mutualOrders, activeTab, searchQuery]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "priority", label: "Priority" },
    { id: "active", label: "Active" },
    { id: "late", label: "Late" },
    { id: "delivered", label: "Delivered" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "starred", label: "Starred" },
  ];

  const contactDisplayName =
    contactUser?.name || contactUser?.username || "Contact";
  const contactAvatar =
    contactUser?.image ||
    contactUser?.avatar ||
    contactUser?.img ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(contactDisplayName)}&background=0D9488&color=fff&bold=true`;

  const contactRole =
    contactUser?.shortTitle ||
    contactUser?.occupation ||
    contactUser?.title ||
    (isSeller ? "Buyer" : "Seller");

  const isLoading = isOrdersLoading || isUserLoading;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Breadcrumb
            items={[
              {
                name: isSeller ? "Manage Orders" : "Orders",
                href: isSeller ? "/manage-orders" : "/orders",
              },
              {
                name: isSeller
                  ? `Orders from @${contactUser?.username || contactDisplayName}`
                  : `Orders with @${contactUser?.username || contactDisplayName}`,
                isLast: true,
              },
            ]}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            radius="fiverr"
            onClick={() => router.back()}
            leftIcon={<FiArrowLeft className="text-sm" />}
            className="text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm"
          >
            Back to Chat
          </Button>
        </div>

        {/* Page Heading with Contact Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[6px] border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <img
              src={contactAvatar}
              alt={contactDisplayName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-inter text-[#292929]">
                  {isSeller ? `Orders from ${contactDisplayName}` : `Orders with ${contactDisplayName}`}
                </h1>
                {contactUser?.username && (
                  <span className="text-xs text-slate-500 font-medium">@{contactUser.username}</span>
                )}
                <span className="bg-[#0D6D5F]/10 text-[#0D6D5F] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {mutualOrders.length} {mutualOrders.length === 1 ? "Order" : "Orders"}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed">
                {isSeller
                  ? `Track and manage all orders received from this buyer.`
                  : `Track and manage all orders placed with this seller.`}
              </p>
            </div>
          </div>


        </div>

        {/* Main Orders Table Card */}
        <div className="bg-white rounded-[6px] border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          {/* Controls Bar: Tabs + Calendar + Search Input */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Pill Tabs */}
            <div className="bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 inline-flex items-center h-[46px] overflow-x-auto scrollbar-none max-w-full">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    type="button"
                    variant={isActive ? "brand" : "ghost"}
                    size="sm"
                    radius="fiverr"
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                      : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                      }`}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Right Tools: Calendar button + Search box */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                radius="xl"
                aria-label="Calendar view"
                className="w-10 h-10 text-slate-600 shadow-xs shrink-0"
              >
                <FiCalendar className="text-base" />
              </Button>

              <div className="relative flex items-center w-full sm:w-64">
                <RiSearchLine className="absolute left-3.5 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search project or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-[6px] border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#0D3B34] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Table Area */}
          {isLoading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader size={45} />
            </div>
          ) : isSeller ? (
            /* ══════════════════════════════════════════════════════════
               SELLER VIEW: Manage Orders Style (Buyer, Project, Due on, Price, Status)
               ══════════════════════════════════════════════════════════ */
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs sm:text-[13px] font-bold text-gray-900 tracking-tight">
                    <th className="py-3.5 px-4 font-bold">BUYER</th>
                    <th className="py-3.5 px-4 font-bold">PROJECT</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">DUE ON</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">TOTAL</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 text-sm font-medium">
                        No orders found with this buyer in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => {
                      const buyerObj = typeof order.buyerID === "object" && order.buyerID !== null ? order.buyerID : {};
                      const buyerName = buyerObj.username || buyerObj.name || contactDisplayName;
                      const buyerAvatarUrl = buyerObj.image || buyerObj.avatar || contactAvatar;

                      const projectTitle =
                        order.title ||
                        order.projectTitle ||
                        order.gigID?.title ||
                        order.packageID?.title ||
                        "Custom Deliverable";
                      const projectDescription =
                        order.projectDescription ||
                        order.gigID?.desc ||
                        order.description ||
                        order.instructions ||
                        "";

                      let dueDateDisplay = "-";
                      if (order.deadline) {
                        const d = new Date(order.deadline);
                        if (!isNaN(d.getTime())) {
                          dueDateDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }
                      } else if (order.createdAt) {
                        const d = new Date(order.createdAt);
                        if (!isNaN(d.getTime())) {
                          dueDateDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }
                      }

                      const statusBadge = getSellerStatusBadge(order.status, order.isCompleted);

                      return (
                        <tr
                          key={order._id || order.id}
                          onClick={() => router.push(`/orders/${order._id || order.id}`)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                        >
                          {/* Buyer Column */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={buyerAvatarUrl}
                                alt={buyerName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-[13px] font-semibold text-gray-950 group-hover:text-[#0D3B34] transition-colors">
                                  {buyerName}
                                </span>
                                <span className="text-[11px] text-gray-500 mt-0.5">
                                  {contactRole}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Project Column */}
                          <td className="py-4 px-4 align-middle max-w-[340px]">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="text-[13px] font-semibold text-gray-900 line-clamp-1 leading-snug group-hover:text-[#0D3B34] transition-colors"
                                  title={projectTitle}
                                >
                                  {projectTitle}
                                </span>
                                {projectDescription && (
                                  <span
                                    className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-normal"
                                    title={projectDescription}
                                  >
                                    {projectDescription}
                                  </span>
                                )}
                              </div>

                              {(order.notes || order.instructions) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  radius="lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNotesOrder({
                                      projectTitle,
                                      sellerOrBuyerName: buyerName,
                                      notes: order.notes || order.instructions,
                                    });
                                  }}
                                  className="shrink-0 p-1.5 w-8 h-8 text-slate-500 hover:text-slate-800 border-slate-200"
                                  title="View order notes"
                                >
                                  <FiFileText className="text-sm" />
                                </Button>
                              )}
                            </div>
                          </td>

                          {/* Due Date Column */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13px] text-gray-700 font-normal whitespace-nowrap">
                            {dueDateDisplay}
                          </td>

                          {/* Price Column */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13.5px] font-bold text-gray-950 whitespace-nowrap">
                            {(Number(order.price) || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span
                              className={`text-[11.5px] font-medium px-3.5 py-1 rounded-full inline-block ${statusBadge.style}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════
               BUYER VIEW: Manage Orders Style (Seller, Project, Due on, Price, Status)
               ══════════════════════════════════════════════════════════ */
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs sm:text-sm font-bold text-slate-800">
                    <th className="py-4 px-4 font-bold">Seller</th>
                    <th className="py-4 px-4 font-bold">Project</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Due on</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Price</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 text-sm font-medium">
                        No orders found with this seller in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => {
                      const sellerObj = typeof order.sellerID === "object" && order.sellerID !== null ? order.sellerID : {};
                      const sellerName = sellerObj.username || sellerObj.name || contactDisplayName;
                      const sellerAvatarUrl = sellerObj.image || sellerObj.avatar || contactAvatar;
                      const sellerRole = sellerObj.title || sellerObj.shortTitle || contactRole;
                      const sellerBadge = sellerObj.badge || contactUser?.badge;

                      const projectTitle =
                        order.title ||
                        order.projectTitle ||
                        order.gigID?.title ||
                        order.packageID?.title ||
                        "Custom Deliverable";
                      const projectDescription =
                        order.description ||
                        order.projectDescription ||
                        order.gigID?.description ||
                        order.instructions ||
                        "";

                      let dueDate = "-";
                      if (order.deadline) {
                        const d = new Date(order.deadline);
                        if (!isNaN(d.getTime())) {
                          dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }
                      } else if (order.createdAt) {
                        const d = new Date(order.createdAt);
                        if (!isNaN(d.getTime())) {
                          dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }
                      }

                      return (
                        <tr
                          key={order._id || order.id}
                          onClick={() => router.push(`/orders/${order._id || order.id}`)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                        >
                          {/* Seller info */}
                          <td className="py-5 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={sellerAvatarUrl}
                                alt={sellerName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#0D3B34] transition-colors">
                                    {sellerName}
                                  </span>
                                  {renderBadge(sellerBadge)}
                                </div>
                                <span className="text-xs text-slate-500 font-normal">
                                  {sellerRole}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Project info + Notes button */}
                          <td className="py-5 px-4 align-middle max-w-[340px]">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#0D3B34] transition-colors"
                                  title={projectTitle}
                                >
                                  {projectTitle}
                                </span>
                                {projectDescription && (
                                  <span
                                    className="text-xs text-slate-500 line-clamp-1 mt-0.5"
                                    title={projectDescription}
                                  >
                                    {projectDescription}
                                  </span>
                                )}
                              </div>

                              {(order.notes || order.instructions) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  radius="lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNotesOrder({
                                      projectTitle,
                                      sellerOrBuyerName: sellerName,
                                      notes: order.notes || order.instructions,
                                    });
                                  }}
                                  className="shrink-0 p-1.5 w-8 h-8 text-slate-500 hover:text-slate-800 border-slate-200"
                                  title="View requirement notes"
                                >
                                  <FiFileText className="text-sm" />
                                </Button>
                              )}
                            </div>
                          </td>

                          {/* Due date */}
                          <td className="py-5 px-4 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                            {dueDate}
                          </td>

                          {/* Price */}
                          <td className="py-5 px-4 align-middle text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                            {(Number(order.price) || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Status pill */}
                          <td className="py-5 px-4 align-middle whitespace-nowrap">
                            {renderBuyerStatusPill(order.status, order.isCompleted)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal Popup */}
      {activeNotesOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FiFileText className="text-teal-600" />
                Order Requirements & Notes
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                onClick={() => setActiveNotesOrder(null)}
                className="w-8 h-8 text-slate-400 hover:text-slate-700 border-none shadow-none"
              >
                <FiX className="text-lg" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Project</p>
                <p className="text-sm font-medium text-slate-800">{activeNotesOrder.projectTitle}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {isSeller ? "Buyer" : "Seller"}
                </p>
                <p className="text-sm text-slate-700">{activeNotesOrder.sellerOrBuyerName}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Note / Instructions</p>
                <div className="p-3.5 bg-slate-50 rounded-[6px] border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {activeNotesOrder.notes}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => setActiveNotesOrder(null)}
                variant="dark"
                size="md"
                radius="fiverr"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
