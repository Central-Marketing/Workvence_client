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
import { ManageOrderItem } from "@/features/dashboard/data/mockBuyerDashboard";
import { Loader, Button } from "@/components";
import { Breadcrumb } from "@/components/ui";

export default function BuyerManageOrdersPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Tab filter states
  type TabType = "Priority" | "Active" | "Late" | "Delivered" | "Completed" | "Cancelled";
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
        return [];
      }
    },
    staleTime: 60000,
  });

  // Filter orders for buyer
  const buyerOrders = useMemo(() => {
    if (!apiOrders || !Array.isArray(apiOrders)) return [];
    if (!user?._id) return apiOrders;
    return apiOrders.filter((order: any) => {
      const buyerId = typeof order.buyerID === "object" ? order.buyerID?._id : order.buyerID;
      return String(buyerId) === String(user._id);
    });
  }, [apiOrders, user]);

  // Normalize real orders without mock fallbacks
  const normalizedOrders: ManageOrderItem[] = useMemo(() => {
    return buyerOrders.map((order: any) => {
      const sellerObj = typeof order.sellerID === "object" && order.sellerID !== null ? order.sellerID : {};
      const sellerName = sellerObj.username || sellerObj.name || "Seller";
      const sellerAvatar = sellerObj.image || sellerObj.avatar || "/media/noavatar.png";
      const sellerRole = sellerObj.title || sellerObj.shortTitle || sellerObj.role || "--";
      const sellerBadge = sellerObj.badge;

      let dueDate = "-";
      if (order.deadline) {
        const d = new Date(order.deadline);
        if (!isNaN(d.getTime())) {
          dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      }

      const isCompleted = order.status === "completed" || order.isCompleted === true;
      const st = (order.status || "inprogress").toLowerCase();
      let status: ManageOrderItem["status"] = "inprogress";
      if (isCompleted) status = "completed";
      else if (st === "delivered") status = "delivered";
      else if (st === "revision" || st === "in_revision") status = "revision";
      else if (st === "failed") status = "failed";
      else if (st === "pending") status = "pending";
      else if (st === "cancelled") status = "cancelled";
      else if (st === "late") status = "late";
      else status = "inprogress";

      return {
        id: String(order._id || order.id),
        seller: {
          id: String(sellerObj._id || sellerObj.id || ""),
          name: sellerName,
          avatar: sellerAvatar,
          role: sellerRole,
          badge: sellerBadge,
        },
        projectTitle: order.title || order.gigID?.title || order.packageID?.title || "Custom Deliverable",
        projectDescription: order.description || order.gigID?.description || order.instructions || "",
        dueDate,
        notes: order.notes || order.instructions || "",
        price: Number(order.price) || 0,
        status,
      };
    });
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
        return order.status === "inprogress" || order.status === "revision" || order.status === "pending" || order.status === "late";
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
        return order.status === "late";
      }

      // Priority (default view: show all)
      return true;
    });
  }, [normalizedOrders, activeTab, searchQuery]);

  const handleRowClick = (orderId: string) => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
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
      case "late":
        return (
          <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-4 py-1.5 rounded-full inline-block">
            Late
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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              name: "Orders",
              href: "/orders",
            },
            {
              name: "Manage Orders",
              isLast: true,
            },
          ]}
        />

        {/* Page Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl  font-normal font-inter text-[#292929]">
            Manage Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            View, track, and manage all your orders, from recent purchases to upcoming deliveries, in one place.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[6px] border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-6 sm:p-8">

          {/* Controls Bar: Tabs + Calendar + Search Input */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">

            {/* Pill Tabs */}
            <div className="bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 inline-flex items-center h-[46px] overflow-x-auto scrollbar-none max-w-full">
              {(["Priority", "Active", "Late", "Delivered", "Completed", "Cancelled"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? "brand" : "ghost"}
                  size="sm"
                  radius="fiverr"
                  className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 whitespace-nowrap ${activeTab === tab
                    ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                    : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                    }`}
                >
                  {tab}
                </Button>
              ))}
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
                  placeholder="What you are looking for"
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
          ) : (
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
                        No orders found in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleRowClick(order.id)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                        >
                          {/* Seller info */}
                          <td className="py-5 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={order.seller.avatar || "/media/noavatar.png"}
                                alt={order.seller.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#0D3B34] transition-colors">
                                    {order.seller.name}
                                  </span>
                                  {renderBadge(order.seller.badge)}
                                </div>
                                <span className="text-xs text-slate-500 font-normal">
                                  {order.seller.role}
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
                                  title={order.projectTitle}
                                >
                                  {order.projectTitle}
                                </span>
                                {order.projectDescription && (
                                  <span
                                    className="text-xs text-slate-500 line-clamp-1 mt-0.5"
                                    title={order.projectDescription}
                                  >
                                    {order.projectDescription}
                                  </span>
                                )}
                              </div>

                              {order.notes && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  radius="lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNotesOrder(order);
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
                            {order.dueDate}
                          </td>

                          {/* Price */}
                          <td className="py-5 px-4 align-middle text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                            {order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          </td>

                          {/* Status pill */}
                          <td className="py-5 px-4 align-middle whitespace-nowrap">
                            {renderStatusPill(order.status)}
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Seller</p>
                <p className="text-sm text-slate-700">{activeNotesOrder.seller.name}</p>
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
