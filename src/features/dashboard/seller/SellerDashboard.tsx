"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { Loader, RecentOrdersSkeleton } from "@/components";

interface SellerDashboardProps {
  user: any;
  onSwitchToBuyer?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const router = useRouter();

  // Fetch orders
  const { isLoading: ordersLoading, data: orders = [] } = useQuery({
    queryKey: ["seller-dashboard-orders"],
    queryFn: () => axiosFetch.get("/orders").then(({ data }) => data ?? []).catch(() => []),
    enabled: !!user,
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["seller-dashboard-convs"],
    queryFn: () => axiosFetch.get("/conversations").then(({ data }) => data ?? []).catch(() => []),
    enabled: !!user,
  });

  // Calculate statistics using the delivery status flow
  const completedOrders = orders.filter((o: any) => o.status === "completed");
  const pendingOrders = orders.filter((o: any) => o.status === "paid" || o.status === "delivered" || !o.status);

  const totalFinancialAmount = completedOrders.reduce((sum: number, order: any) => sum + (order.price || 0), 0);

  const unreadMessagesCount = conversations.filter((c: any) => !c.readBySeller).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 md:px-6 space-y-8">

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || user?.username}!
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Here is what is happening with your Workvence projects today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              SELLER ACCOUNT
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-1">
              {totalFinancialAmount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </h2>
            <p className="text-xs text-gray-500">Cleared earnings from {completedOrders.length} packages</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ACTIVE ORDERS</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-1">{pendingOrders.length}</h2>
            <p className="text-xs text-gray-500">Currently in progress</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">COMPLETED ORDERS</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-1">{completedOrders.length}</h2>
            <p className="text-xs text-gray-500">Packages successfully closed</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">UNREAD MESSAGES</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#327C73] mt-2 mb-1">{unreadMessagesCount}</h2>
            <p className="text-xs text-gray-500">Awaiting your response</p>
          </div>
        </div>

        {/* Two Column Layout: Recent Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Recent Orders Card */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link href="/orders" className="text-xs font-semibold text-[#327C73] hover:underline">
                View All
              </Link>
            </div>

            {ordersLoading ? (
              <RecentOrdersSkeleton rows={4} />
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">No orders received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-50">
                      <th className="pb-3 font-semibold uppercase">IMAGE</th>
                      <th className="pb-3 font-semibold uppercase">TITLE</th>
                      <th className="pb-3 font-semibold uppercase">PRICE</th>
                      <th className="pb-3 font-semibold uppercase">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map((order: any) => {
                      const isOrdDelivered = order.status === "delivered";
                      const isOrdCompleted = order.status === "completed";
                      return (
                        <tr
                          key={order._id}
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 pr-3">
                            <img
                              src={order.image || "/media/noavatar.png"}
                              alt=""
                              className="w-12 h-9 rounded-lg object-cover bg-gray-100 border border-gray-200"
                            />
                          </td>
                          <td className="py-3.5 pr-3 max-w-[240px] truncate font-medium text-gray-800">
                            {order.title}
                          </td>
                          <td className="py-3.5 pr-3 font-bold text-gray-900">
                            {order.price?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${isOrdCompleted
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isOrdDelivered
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                            >
                              {isOrdCompleted ? "COMPLETED" : isOrdDelivered ? "DELIVERED" : "IN PROGRESS"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 pb-3 border-b border-gray-100">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/packages"
                className="w-full py-3 px-4 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white font-medium text-sm text-center transition-colors shadow-sm block"
              >
                Browse Services
              </Link>
              <Link
                href="/messages"
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm text-center transition-colors block"
              >
                Open Inbox Chat
              </Link>
              <Link
                href="/organize"
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm text-center transition-colors block"
              >
                Publish a new Package
              </Link>
              <Link
                href="/briefs"
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm text-center transition-colors block"
              >
                Browse Job Projects
              </Link>
              <Link
                href="/earnings"
                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm text-center transition-colors block"
              >
                View Earnings Statement
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SellerDashboard;
