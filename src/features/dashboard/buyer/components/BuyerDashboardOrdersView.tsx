"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiPackage, FiHeart, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { Button, Tag } from "@/components/ui";

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
        isCompleted,
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
            <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#E07A24] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                <path d="M26.25 4.12508C25.0384 3.87911 23.7842 3.75 22.5 3.75C12.1447 3.75 3.75 12.1447 3.75 22.5C3.75 32.8552 12.1447 41.25 22.5 41.25C32.8552 41.25 41.25 32.8552 41.25 22.5C41.25 21.2158 41.1208 19.9616 40.875 18.75" stroke="#F57727" strokeWidth="2.5" stroke-linecap="round" />
                <path d="M22.5 16.875C20.4289 16.875 18.75 18.1342 18.75 19.6875C18.75 21.2408 20.4289 22.5 22.5 22.5C24.5711 22.5 26.25 23.7592 26.25 25.3125C26.25 26.8658 24.5711 28.125 22.5 28.125M22.5 16.875C24.1328 16.875 25.5217 17.6576 26.0366 18.75M22.5 16.875V15M22.5 28.125C20.8672 28.125 19.4783 27.3424 18.9634 26.25M22.5 28.125V30" stroke="#F57727" strokeWidth="2.5" stroke-linecap="round" />
                <path d="M31.8712 13.1289L39.7011 5.29478M41.2462 12.1506L41.0246 6.35406C41.0246 4.98786 40.209 4.13663 38.7231 4.02927L32.8654 3.75391" stroke="#F57727" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
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
            <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#9747FF] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                <path d="M4.6875 14.0625V25.3125C4.6875 32.3835 4.6875 35.9192 6.88419 38.1157C9.08091 40.3125 12.6164 40.3125 19.6875 40.3125H25.3125C32.3835 40.3125 35.9192 40.3125 38.1157 38.1157C40.3125 35.9192 40.3125 32.3835 40.3125 25.3125V14.0625" stroke="#8133F1" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7.25454 9.96489L4.6875 14.0625H40.3125L37.9646 10.1494C36.3639 7.48164 35.5637 6.14775 34.2741 5.41763C32.9846 4.6875 31.4289 4.6875 28.3179 4.6875H16.7882C13.7437 4.6875 12.2215 4.6875 10.9502 5.39119C9.67903 6.09487 8.87087 7.38489 7.25454 9.96489Z" stroke="#8133F1" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22.5 14.0625V4.6875" stroke="#8133F1" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M11.25 33.75H20.625M11.25 28.125H16.875" stroke="#8133F1" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
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
            <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#0D9488] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                <path d="M22.5 22.5V30" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 22.5V30" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M42.1875 15H2.8125" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M33.75 15L28.125 5.625" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M11.25 15L16.875 5.625" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M28.125 35.625C28.125 35.625 30 35.625 31.875 39.375C31.875 39.375 35.9559 30 41.25 28.125" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22.5 37.5H17.9677C13.4161 37.5 11.1403 37.5 9.56674 36.1671C7.99316 34.8339 7.61903 32.5892 6.87075 28.0995L4.6875 15H40.3125L39.0624 22.5" stroke="#1A9997" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round" />
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
            <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] group-hover:bg-[#FFEBEB] flex items-center justify-center text-[#EF4444] shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                <path d="M19.5201 37.4394C14.2302 33.4837 3.75 24.4403 3.75 16.3021C3.75 10.9231 7.69736 6.5625 13.125 6.5625C15.9375 6.5625 18.75 7.5 22.5 11.25C26.25 7.5 29.0625 6.5625 31.875 6.5625C37.3026 6.5625 41.25 10.9231 41.25 16.3021C41.25 24.4403 30.7699 33.4837 25.4799 37.4394C23.6998 38.7705 21.3002 38.7705 19.5201 37.4394Z" stroke="#F00000" strokeWidth="2.8125" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Recent Orders Section */}
      <div className="bg-[#F5F5F5] rounded-[6px] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-7">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
          </div>

          <div className="flex items-center gap-5 justify-between sm:justify-end">
            {/* Pill Switcher */}
            <div className="flex items-center h-[46px] bg-[#fff] p-[4px] rounded-[6px] border border-gray-200/50 overflow-x-auto scrollbar-none">
              {(["All", "Packages", "Briefs"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? "brand" : "ghost"}
                  size="sm"
                  radius="fiverr"
                  className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 ${activeTab === tab
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
        <div className="w-full shadow-md overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch] rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)]">
          <table className="w-full  min-w-[760px] border-collapse text-left">
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
                displayedOrders.map((order, idx) => {
                  // Determine status pill badge style
                  const st = (order.status || "inprogress").toLowerCase();
                  let statusBadge = {
                    label: "Inprogress",
                    style: "bg-[#E6E9F2] text-[#0284C7]",
                  };

                  if (st === "completed" || order.isCompleted) {
                    statusBadge = {
                      label: "Completed",
                      style: "bg-[#D1FAE5] text-[#059669]",
                    };
                  } else if (st === "delivered") {
                    statusBadge = {
                      label: "Delivered",
                      style: "bg-[#D1FAE5] text-[#059669]",
                    };
                  } else if (st === "revision" || st === "in_revision") {
                    statusBadge = {
                      label: "Revision",
                      style: "bg-[#F3E8FF] text-[#9333EA]",
                    };
                  } else if (st === "failed" || st === "cancelled") {
                    statusBadge = {
                      label: "Cancelled",
                      style: "bg-[#FEE2E2] text-[#EF4444]",
                    };
                  } else if (st === "pending") {
                    statusBadge = {
                      label: "Pending",
                      style: "bg-[#FEF3C7] text-[#D97706]",
                    };
                  }

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order.id)}
                      className={`group relative cursor-pointer transition-colors ${idx % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"
                        } after:pointer-events-none after:absolute after:inset-0`}
                    >
                      {/* Order Name */}
                      <td className="py-4 px-3 align-middle max-w-[380px]">
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 sm:w-36 md:w-[180px] lg:w-[220px] aspect-[11/6] rounded-[6px] overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0">
                            <Image
                              src={order.coverImage}
                              alt={order.title}
                              fill
                              sizes="(max-width: 640px) 96px, (max-width: 1024px) 180px, 220px"
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
                            <span className="text-[11px] font-semibold rounded-[6px] bg-[#FAFAFA] text-[#292929] border border-[#C7C7C7] px-2 py-1 w-fit mt-1.5 capitalize">
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
                        <Tag variant={statusBadge.label} size="sm">
                          {statusBadge.label}
                        </Tag>
                      </td>
                    </tr>
                  )
                })
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
