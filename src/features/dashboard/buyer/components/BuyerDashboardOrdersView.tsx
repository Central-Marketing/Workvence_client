"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiPackage, FiHeart, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { Button } from "@/components/ui";

interface BuyerDashboardOrdersViewProps {
  user: any;
  orders: any[];
}

export const BuyerDashboardOrdersView: React.FC<BuyerDashboardOrdersViewProps> = ({
  user,
  orders,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Packages" | "Briefs">("All");

  // Fetch favorites count for the metrics bar
  const { data: apiFavorites } = useQuery({
    queryKey: ["buyer-favorites-summary"],
    queryFn: async () => {
      try {
        const [gigsRes, sellersRes] = await Promise.all([
          axiosFetch.get("/gigs/favorites").catch(() => null),
          axiosFetch.get("/users/favorite-sellers").catch(() => null),
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

  // Normalized order data
  const normalizedOrders = useMemo(() => {
    return orders.map((order: any) => {
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
  }, [orders]);

  // Metrics computation from real data
  const totalSpend = useMemo(() => {
    return orders.reduce((sum: number, o: any) => sum + (Number(o.price) || 0), 0);
  }, [orders]);

  const totalOrdersCount = orders.length;

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o: any) => {
      const isCompleted = o.status === "completed" || o.isCompleted === true;
      return !isCompleted && o.status !== "cancelled" && o.status !== "failed";
    }).length;
  }, [orders]);

  const completedOrdersCount = useMemo(() => {
    return orders.filter((o: any) => o.status === "completed" || o.isCompleted === true).length;
  }, [orders]);

  const favGigsCount = apiFavorites?.gigs?.length || 0;
  const favSellersCount = apiFavorites?.sellers?.length || 0;
  const totalFavoritesCount = favGigsCount + favSellersCount;

  // Filtered orders: capped to 5 rows for dashboard overview
  const displayedOrders = useMemo(() => {
    let list = normalizedOrders;
    if (activeTab === "Packages") {
      list = list.filter((o) => o.itemType === "package");
    } else if (activeTab === "Briefs") {
      list = list.filter((o) => o.itemType === "brief");
    }
    return list.slice(0, 5);
  }, [normalizedOrders, activeTab]);

  const handleRowClick = (orderId: string) => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* 1. Order Summary Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Order Summary</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Get a quick overview of your orders, spending, and current order activity in one place.
          </p>
        </div>

        {/* 4-Stat Metric Bar */}
        <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">
          {/* Total Spend */}
          <div className="p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Spend</p>
              <p className="text-[24px] font-semibold text-slate-900 mt-1 tracking-tight">
                {totalSpend.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Across all {totalOrdersCount} placed orders</p>
            </div>
            <div className="w-12 h-12 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#E07A24] shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8l-5 5" />
                <path d="M16 8h-4" />
                <path d="M16 8v4" />
                <text x="7.5" y="15.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">$</text>
              </svg>
            </div>
          </div>

          {/* Active Orders */}
          <div className="p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Orders</p>
              <p className="text-[24px] font-semibold text-slate-900 mt-1 tracking-tight">
                {activeOrdersCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">Currently in progress</p>
            </div>
            <div className="w-12 h-12 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#9747FF] shrink-0">
              <FiPackage className="text-2xl" />
            </div>
          </div>

          {/* Completed Orders */}
          <div className="p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed Orders</p>
              <p className="text-[24px] font-semibold text-slate-900 mt-1 tracking-tight">
                {completedOrdersCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">Packages successfully closed</p>
            </div>
            <div className="w-12 h-12 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#0D9488] shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
                <polyline points="9 16 11 18 15 14" />
              </svg>
            </div>
          </div>

          {/* My Favorites */}
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
              <p className="text-[24px] font-semibold text-slate-900 mt-1 tracking-tight">
                {totalFavoritesCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {favGigsCount} packages and {favSellersCount} sellers saved
              </p>
            </div>
            <div className="w-12 h-12 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] group-hover:bg-[#FFEBEB] flex items-center justify-center text-[#EF4444] shrink-0 transition-colors">
              <FiHeart className="text-2xl" />
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Recent Orders Section */}
      <div className="bg-white rounded-[6px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-7">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
          </div>

          <div className="flex items-center gap-5 justify-between sm:justify-end">
            {/* Pill Switcher */}
            <div className="flex items-center h-[46px] bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 overflow-x-auto scrollbar-none">
              {(["All", "Packages", "Briefs"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? "brand" : "ghost"}
                  size="sm"
                  radius="fiverr"
                  className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 ${
                    activeTab === tab
                      ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                      : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                  }`}
                >
                  {tab}
                </Button>
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
        <div className="w-full overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch]">
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
                displayedOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order.id)}
                    className="hover:bg-slate-50/75 cursor-pointer transition-colors group"
                  >
                    {/* Order Name */}
                    <td className="py-4 px-3 align-middle max-w-[380px]">
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 sm:w-28 h-14 sm:h-16 rounded-[6px] overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
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
                            className="text-[13px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#327C73] transition-colors"
                            title={order.title}
                          >
                            {order.title}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-[#F1F3F5] px-2 py-0.5 rounded-[6px] w-fit mt-1.5 capitalize">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View All Orders Button */}
        <div className="flex justify-center mt-6 pt-2 border-t border-slate-100">
          <Button
            href="/orders/manage-orders"
            variant="outline"
            size="sm"
            radius="fiverr"
            className="font-medium text-xs sm:text-sm px-6 py-2.5 border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>View all orders</span>
            <FiArrowRight className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardOrdersView;
