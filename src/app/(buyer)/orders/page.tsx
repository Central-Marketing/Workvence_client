"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiChevronDown,
  FiPackage,
  FiHeart
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

export default function BuyerOrdersPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Tab filter: "All" | "Packages" | "Briefs"
  const [activeTab, setActiveTab] = useState<"All" | "Packages" | "Briefs">("All");
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Fetch real buyer orders
  const { data: apiOrders = [], isLoading } = useQuery({
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

  // 2. Fetch buyer briefs (for active brief detection)
  const { data: apiBriefs = [] } = useQuery({
    queryKey: ["buyer-briefs-summary"],
    queryFn: async () => {
      try {
        const { data } = await axiosFetch.get("/briefs/my-briefs");
        return Array.isArray(data) ? data : data?.briefs || [];
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  // 3. Fetch favorites count
  const { data: apiFavorites } = useQuery({
    queryKey: ["buyer-favorites-summary"],
    queryFn: async () => {
      try {
        const [gigsRes, sellersRes] = await Promise.all([
          axiosFetch.get("/gigs/favorites").catch(() => null),
          axiosFetch.get("/users/favorite-sellers").catch(() => null)
        ]);
        const gigs = gigsRes?.data?.favorites || [];
        const sellers = sellersRes?.data?.sellers || [];
        return { gigs, sellers };
      } catch {
        return { gigs: [], sellers: [] };
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

  // Real normalized orders without mock fallbacks
  const normalizedOrders = useMemo(() => {
    return buyerOrders.map((order: any) => {
      let orderDate = "-";
      if (order.createdAt) {
        const d = new Date(order.createdAt);
        if (!isNaN(d.getTime())) {
          orderDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      }

      let dueDate = "-";
      if (order.deadline) {
        const d = new Date(order.deadline);
        if (!isNaN(d.getTime())) {
          dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      }

      const isCompleted = order.status === "completed" || order.isCompleted === true;
      const st = (order.status || "inprogress").toLowerCase();
      let status = "inprogress";
      if (isCompleted) status = "completed";
      else if (st === "delivered") status = "delivered";
      else if (st === "revision" || st === "in_revision") status = "revision";
      else if (st === "failed" || st === "cancelled") status = "cancelled";
      else if (st === "late") status = "late";
      else status = "inprogress";

      const isBrief = Boolean(order.briefID || order.type === "brief");

      const coverImage =
        order.image ||
        order.cover ||
        order.packageID?.cover ||
        order.packageID?.image ||
        order.packageID?.images?.[0] ||
        order.gigID?.cover ||
        order.gigID?.image ||
        "/images/dashboard/orders/order_1.jpg";

      return {
        id: String(order._id || order.id),
        title: order.title || order.gigID?.title || order.packageID?.title || "Custom Deliverable",
        coverImage,
        itemType: isBrief ? ("brief" as const) : ("package" as const),
        orderDate,
        dueDate,
        price: Number(order.price) || 0,
        status,
      };
    });
  }, [buyerOrders]);

  // Metrics computation from real data
  const totalSpend = useMemo(() => {
    return buyerOrders.reduce((sum: number, o: any) => sum + (Number(o.price) || 0), 0);
  }, [buyerOrders]);

  const totalOrdersCount = buyerOrders.length;
  const activeOrdersCount = useMemo(() => {
    return buyerOrders.filter((o: any) => {
      const isCompleted = o.status === "completed" || o.isCompleted === true;
      return !isCompleted && o.status !== "cancelled" && o.status !== "failed";
    }).length;
  }, [buyerOrders]);

  const completedOrdersCount = useMemo(() => {
    return buyerOrders.filter((o: any) => o.status === "completed" || o.isCompleted === true).length;
  }, [buyerOrders]);

  const favGigsCount = apiFavorites?.gigs?.length || 0;
  const favSellersCount = apiFavorites?.sellers?.length || 0;
  const totalFavoritesCount = favGigsCount + favSellersCount;

  // Active brief project detection for hero banner
  const activeBrief = useMemo(() => {
    if (!apiBriefs || !Array.isArray(apiBriefs) || apiBriefs.length === 0) return null;
    return apiBriefs.find((b: any) => b.status === "in_progress" || b.status === "active");
  }, [apiBriefs]);

  // Tab filter
  const displayedOrders = useMemo(() => {
    let list = normalizedOrders;
    if (activeTab === "Packages") {
      list = list.filter((o) => o.itemType === "package");
    } else if (activeTab === "Briefs") {
      list = list.filter((o) => o.itemType === "brief");
    }
    return showAllOrders ? list : list.slice(0, 5);
  }, [normalizedOrders, activeTab, showAllOrders]);

  const handleRowClick = (orderId: string) => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-7 sm:space-y-8">

        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center">
              <FiHome className="text-sm" />
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 font-medium">Orders</span>
          </div>

          {user?.isSeller && (
            <Link
              href="/manage-orders"
              className="text-xs font-semibold text-[#327C73] hover:underline flex items-center gap-1"
            >
              <span>Go to Seller Manage Orders</span>
              <span>→</span>
            </Link>
          )}
        </div>

        {/* Top Hero Banner: Shown when there is an active brief project */}
        {activeBrief && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1E30] via-[#09323B] to-[#0D5B5A] text-white shadow-sm p-7 sm:p-9 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-normal tracking-tight text-white leading-tight">
                Your <span className="font-bold">brief</span> project is currently{" "}
                <span className="font-bold">in progress</span>
              </h2>
              <p className="text-sm text-slate-200/90 mt-2 font-normal leading-relaxed">
                Your freelancer is actively working on your project. High-quality delivery takes time.
              </p>
              <Link
                href={`/briefs/${activeBrief._id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:underline mt-4 group"
              >
                <span>See the current project</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="relative shrink-0 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center self-center md:self-auto md:mr-4">
              <Image
                src="/images/mock-dashboard/hero-star.jpg"
                alt="In Progress Project"
                width={160}
                height={160}
                className="object-contain filter drop-shadow-[0_0_30px_rgba(45,212,191,0.25)] rounded-2xl"
                priority
              />
            </div>
          </div>
        )}

        {/* Order Summary Section */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
              Order Summary
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Get a quick overview of your orders, spending, and current order activity in one place.
            </p>
          </div>

          {/* 4-Stat Metric Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">

            {/* 1. Total Spend */}
            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Spend</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {totalSpend.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </p>
                <p className="text-xs text-slate-400 mt-1">Across all {totalOrdersCount} placed orders</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#FFE8D1] bg-[#FFF9F2] flex items-center justify-center text-[#E07A24] shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8l-5 5" />
                  <path d="M16 8h-4" />
                  <path d="M16 8v4" />
                  <text x="7.5" y="15.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">$</text>
                </svg>
              </div>
            </div>

            {/* 2. Active Orders */}
            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Orders</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {activeOrdersCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">Currently in progress</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#F0DCFF] bg-[#FBF5FF] flex items-center justify-center text-[#9747FF] shrink-0">
                <FiPackage className="text-2xl" />
              </div>
            </div>

            {/* 3. Completed Orders */}
            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Completed Orders</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {completedOrdersCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">Packages successfully closed</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#CCFBF1] bg-[#F0FDFB] flex items-center justify-center text-[#0D9488] shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                  <polyline points="9 16 11 18 15 14" />
                </svg>
              </div>
            </div>

            {/* 4. My Favorites */}
            <Link
              href="/favorites"
              className="p-5 sm:p-6 flex items-center justify-between hover:bg-slate-50/80 transition-all group cursor-pointer block"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-slate-500 font-medium group-hover:text-[#0D6D5F] transition-colors">
                    My Favorites
                  </p>
                  <span className="text-slate-400 group-hover:text-[#0D6D5F] text-xs transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {totalFavoritesCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {favGigsCount} packages and {favSellersCount} sellers saved
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#FFE0E0] bg-[#FFF5F5] group-hover:bg-[#FFEBEB] flex items-center justify-center text-[#EF4444] shrink-0 transition-colors">
                <FiHeart className="text-2xl" />
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-7">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Recent Orders
              </h2>
              <button
                type="button"
                aria-label="Filter by date"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs cursor-pointer"
              >
                <FiCalendar className="text-base" />
              </button>
            </div>

            <div className="flex items-center gap-5 justify-between sm:justify-end">
              {/* Pill Switcher */}
              <div className="bg-[#F1F3F5] p-1 rounded-xl flex items-center">
                {(["All", "Packages", "Briefs"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-[#113E37] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Manage All Orders Link */}
              <Link
                href="/orders/manage-orders"
                className="text-xs sm:text-sm font-semibold text-[#113E37] hover:underline flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Manage all orders</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader size={40} />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs sm:text-sm font-bold text-slate-700">
                    <th className="py-3.5 px-3 font-bold">Order Name</th>
                    <th className="py-3.5 px-3 font-bold whitespace-nowrap">Order Date</th>
                    <th className="py-3.5 px-3 font-bold whitespace-nowrap">Due on</th>
                    <th className="py-3.5 px-3 font-bold whitespace-nowrap">Total</th>
                    <th className="py-3.5 px-3 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 text-xs sm:text-sm font-medium">
                        No orders found in this view.
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((order) => {
                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleRowClick(order.id)}
                          className="hover:bg-slate-50/75 cursor-pointer transition-colors group"
                        >
                          {/* Order Name */}
                          <td className="py-4 px-3 align-middle max-w-[380px]">
                            <div className="flex items-center gap-4">
                              <div className="relative w-24 sm:w-28 h-14 sm:h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                <Image
                                  src={order.coverImage}
                                  alt={order.title}
                                  fill
                                  sizes="112px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#327C73] transition-colors"
                                  title={order.title}
                                >
                                  {order.title}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-600 bg-[#F1F3F5] px-2 py-0.5 rounded-md w-fit mt-1.5 capitalize">
                                  {order.itemType}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Order Date */}
                          <td className="py-4 px-3 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                            {order.orderDate}
                          </td>

                          {/* Due Date */}
                          <td className="py-4 px-3 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                            {order.dueDate}
                          </td>

                          {/* Total */}
                          <td className="py-4 px-3 align-middle text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                            {order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-3 align-middle whitespace-nowrap">
                            {order.status === "revision" ? (
                              <span className="bg-[#F5F0FF] text-[#8B5CF6] border border-[#DDD6FE] text-xs font-semibold px-3 py-1 rounded-full text-center inline-block">
                                Revision
                              </span>
                            ) : order.status === "delivered" ? (
                              <span className="bg-[#E6FFFA] text-[#0D9488] border border-[#99F6E4] text-xs font-semibold px-3 py-1 rounded-full text-center inline-block">
                                Delivered
                              </span>
                            ) : order.status === "completed" ? (
                              <span className="bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] text-xs font-semibold px-3 py-1 rounded-full text-center inline-block">
                                Completed
                              </span>
                            ) : order.status === "late" ? (
                              <span className="bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] text-xs font-semibold px-3 py-1 rounded-full text-center inline-block">
                                Late
                              </span>
                            ) : (
                              <span className="bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE] text-xs font-semibold px-3 py-1 rounded-full text-center inline-block">
                                Inprogress
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* See more orders button */}
          {normalizedOrders.length > 5 && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>{showAllOrders ? "Show less orders" : "See more orders"}</span>
                <FiChevronDown className={`transition-transform duration-200 ${showAllOrders ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
