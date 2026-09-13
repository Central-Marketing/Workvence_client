"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiFileText,
  FiX,
  FiSearch,
  FiExternalLink
} from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import {
  ManageOrderItem,
  MOCK_MANAGE_ORDERS
} from "@/features/dashboard/data/mockBuyerDashboard";
import { normalizeManageOrders } from "@/features/dashboard/utils/dashboardNormalizer";
import { Loader } from "@/components";

export default function BuyerManageOrdersPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Tab filter states matching screenshot
  type TabType = "Priority" | "Active" | "Late" | "Delivered" | "Completed" | "Cancelled" | "Starred";
  const [activeTab, setActiveTab] = useState<TabType>("Priority");
  const [searchQuery, setSearchQuery] = useState("");

  // Notes Modal state
  const [activeNotesOrder, setActiveNotesOrder] = useState<ManageOrderItem | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Fetch real buyer orders
  const { data: apiOrders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/orders");
        return Array.isArray(data) ? data : data?.orders || [];
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  // Filter orders for buyer
  const buyerOrders = useMemo(() => {
    if (!apiOrders || !Array.isArray(apiOrders)) return [];
    if (!user?._id) return apiOrders;
    if (user.isSeller) {
      return apiOrders.filter((order: any) => {
        const buyerId = typeof order.buyerID === "object" ? order.buyerID?._id : order.buyerID;
        return String(buyerId) === String(user._id);
      });
    }
    return apiOrders.filter((order: any) => {
      const sellerId = typeof order.sellerID === "object" ? order.sellerID?._id : order.sellerID;
      return String(sellerId) !== String(user._id);
    });
  }, [apiOrders, user]);

  // Normalize orders with rich fallbacks matching screenshot
  const normalizedOrders: ManageOrderItem[] = useMemo(() => {
    return normalizeManageOrders(buyerOrders, MOCK_MANAGE_ORDERS);
  }, [buyerOrders]);

  // Filter orders based on active tab and search query
  const filteredOrders = useMemo(() => {
    return normalizedOrders.filter((order) => {
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSeller = order.seller.name.toLowerCase().includes(q) || order.seller.role.toLowerCase().includes(q);
        const matchesProject = order.projectTitle.toLowerCase().includes(q) || order.projectDescription.toLowerCase().includes(q);
        if (!matchesSeller && !matchesProject) return false;
      }

      // Tab filtering
      if (activeTab === "Active") {
        return order.status === "inprogress" || order.status === "revision" || order.status === "pending";
      }
      if (activeTab === "Delivered") {
        return order.status === "delivered";
      }
      if (activeTab === "Completed") {
        return order.status === "completed";
      }
      if (activeTab === "Cancelled") {
        return order.status === "cancelled" || order.status === "failed";
      }
      if (activeTab === "Late") {
        return order.status === "late" || order.status === "failed";
      }
      if (activeTab === "Starred") {
        return Boolean(order.starred);
      }
      // Priority (default view from screenshot)
      return true;
    });
  }, [normalizedOrders, activeTab, searchQuery]);

  const handleRowClick = (orderId: string) => {
    if (orderId && !orderId.startsWith("ord-manage-")) {
      router.push(`/orders/${orderId}`);
    } else {
      router.push(`/orders`);
    }
  };

  const renderBadge = (badge?: "Expert" | "Pro" | "Legend") => {
    if (!badge) return null;
    if (badge === "Expert") {
      return (
        <span className="bg-[#5c4928] text-[#FDE68A] text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
          Expert
        </span>
      );
    }
    if (badge === "Pro") {
      return (
        <span className="bg-[#4C1D95] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
          Pro
        </span>
      );
    }
    if (badge === "Legend") {
      return (
        <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
          Legend
        </span>
      );
    }
    return null;
  };

  const renderStatusPill = (status: ManageOrderItem["status"]) => {
    switch (status) {
      case "revision":
        return (
          <span className="bg-[#F5F0FF] text-[#8B5CF6] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Revision
          </span>
        );
      case "inprogress":
        return (
          <span className="bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Inprogress
          </span>
        );
      case "delivered":
        return (
          <span className="bg-[#E6FFFA] text-[#0D9488] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Delivered
          </span>
        );
      case "failed":
        return (
          <span className="bg-[#FEE2E2] text-[#EF4444] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Failed
          </span>
        );
      case "pending":
        return (
          <span className="bg-[#FEF9C3] text-[#CA8A04] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Pending
          </span>
        );
      case "completed":
        return (
          <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Inprogress
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb matching design */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
          <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center">
            <FiHome className="text-sm" />
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/orders" className="text-slate-500 hover:text-slate-800 transition-colors">
            Orders
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700 font-medium">Manage Orders</span>
        </div>

        {/* Page Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight">
            Manage Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            View, track, and manage all your orders, from recent purchases to upcoming deliveries, in one place.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-6 sm:p-8">

          {/* Controls Bar: Tabs + Calendar + Search Input */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">

            {/* Pill Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 overflow-x-auto scrollbar-none">
              {(["Priority", "Active", "Late", "Delivered", "Completed", "Cancelled", "Starred"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab
                    ? "bg-[#0D3B34] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right Controls: Calendar button + Search input */}
            <div className="flex items-center gap-3">
              <button
                aria-label="Calendar view"
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <FiCalendar className="text-base" />
              </button>

              <div className="relative w-full sm:w-64 md:w-72 shrink-0">
                <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  placeholder="What you are looking for"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-[#327C73] rounded-xl text-xs sm:text-sm outline-none text-slate-800 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader size={45} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-base font-bold text-slate-800 mb-1">No orders found</p>
              <p className="text-xs sm:text-sm text-slate-500">
                {searchQuery
                  ? "No orders match your search query."
                  : `No orders in the ${activeTab} tab.`}
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs sm:text-sm font-bold text-slate-700">
                    <th className="py-4 px-4 font-bold">Seller</th>
                    <th className="py-4 px-4 font-bold">Project</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Due on</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Notes</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Total</th>
                    <th className="py-4 px-4 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleRowClick(order.id)}
                        className="hover:bg-slate-50/75 cursor-pointer transition-colors group"
                      >
                        {/* Seller Column */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={order.seller.avatar || "/media/noavatar.png"}
                              alt={order.seller.name}
                              className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 bg-slate-100"
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 leading-tight">
                                  {order.seller.name}
                                </span>
                                {renderBadge(order.seller.badge)}
                              </div>
                              <span className="text-xs text-slate-500 font-medium mt-0.5">
                                {order.seller.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Project Column */}
                        <td className="py-4 px-4 align-middle max-w-[340px]">
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-bold text-sm text-slate-900 leading-snug group-hover:text-[#327C73] transition-colors"
                              title={order.projectTitle}
                            >
                              {order.projectTitle}
                            </span>
                            <span
                              className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5 line-clamp-2"
                              title={order.projectDescription}
                            >
                              {order.projectDescription}
                            </span>
                          </div>
                        </td>

                        {/* Due On Column */}
                        <td className="py-4 px-4 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                          {order.dueDate}
                        </td>

                        {/* Notes Column */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNotesOrder(order);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0f766e] transition-colors cursor-pointer group/note"
                          >
                            <FiFileText className="text-sm text-[#0D9488]" />
                            <span className="underline decoration-[#0D9488]/50 group-hover/note:decoration-[#0D9488]">
                              view
                            </span>
                          </button>
                        </td>

                        {/* Total Column */}
                        <td className="py-4 px-4 align-middle text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                          ${order.price.toFixed(2)}
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          {renderStatusPill(order.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Project Notes Modal */}
      {activeNotesOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                  <FiFileText className="text-base" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Project Notes</h3>
              </div>
              <button
                onClick={() => setActiveNotesOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1 transition-colors cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeNotesOrder.projectTitle}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activeNotesOrder.projectDescription}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {activeNotesOrder.seller.name} &bull; <span className="text-slate-500 font-normal">{activeNotesOrder.seller.role}</span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instructions & Updates</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeNotesOrder.notes}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Due date: <strong className="text-slate-800">{activeNotesOrder.dueDate}</strong>
              </span>
              <button
                onClick={() => setActiveNotesOrder(null)}
                className="px-4 py-2 bg-[#0D3B34] hover:bg-[#113E37] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
