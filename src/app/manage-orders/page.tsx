"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import { FiMessageSquare, FiPackage, FiClock, FiCheckCircle, FiTruck } from "react-icons/fi";

const ManageOrders = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, error, data = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      axiosFetch
        .get(`/orders`)
        .then(({ data }) => (Array.isArray(data) ? data : data?.orders || []))
        .catch(({ response }) => {
          console.log(response?.data);
          return [];
        }),
  });

  // Filter orders for Seller
  const sellerOrders = data.filter((order: any) => {
    if (!user?._id) return true;
    const sellerId = typeof order.sellerID === "object" ? order.sellerID?._id : order.sellerID;
    return String(sellerId) === String(user._id) || !order.buyerID;
  });

  const handleContact = async (order: any) => {
    const sellerID = typeof order.sellerID === "object" ? order.sellerID?._id : order.sellerID;
    const buyerID = typeof order.buyerID === "object" ? order.buyerID?._id : order.buyerID;

    axiosFetch
      .get(`/conversations/single/${sellerID}/${buyerID}`)
      .then(({ data }) => {
        const targetId = data.uuid || data.conversationID || data._id;
        router.push(`/message/${targetId}`);
      })
      .catch(async () => {
        const { data } = await axiosFetch.post("/conversations", {
          to: buyerID,
          from: sellerID,
        });
        const targetId = data.uuid || data.conversationID || data._id;
        router.push(`/message/${targetId}`);
      });
  };

  // Status counts for metrics
  const inProgressOrders = sellerOrders.filter((o: any) => o.status === "paid" || o.status === "in_progress" || !o.status);
  const deliveredOrders = sellerOrders.filter((o: any) => o.status === "delivered");
  const completedOrders = sellerOrders.filter((o: any) => o.status === "completed");

  // Filter orders by selected status tab
  const filteredOrders = sellerOrders.filter((order: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "in_progress") return order.status === "paid" || order.status === "in_progress" || !order.status;
    return order.status === statusFilter;
  });

  // Helper for status badge styling matching the seller dashboard reference
  const getStatusBadge = (status?: string) => {
    const st = (status || "inprogress").toLowerCase();
    if (st === "completed") {
      return {
        label: "Completed",
        style: "bg-[#D1FAE5] text-[#059669]",
      };
    }
    if (st === "delivered") {
      return {
        label: "Delivered",
        style: "bg-[#D1FAE5] text-[#059669]",
      };
    }
    if (st === "revision") {
      return {
        label: "Revision",
        style: "bg-[#F3E8FF] text-[#9333EA]",
      };
    }
    if (st === "failed" || st === "cancelled") {
      return {
        label: "Failed",
        style: "bg-[#FEE2E2] text-[#EF4444]",
      };
    }
    if (st === "pending") {
      return {
        label: "Pending",
        style: "bg-[#FEF3C7] text-[#D97706]",
      };
    }
    return {
      label: "Inprogress",
      style: "bg-[#E0F2FE] text-[#0284C7]",
    };
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-10 font-sans">
      {isLoading ? (
        <div className="w-full flex justify-center items-center py-24">
          <Loader size={45} />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-semibold">
          Something went wrong loading your orders!
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 space-y-6">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
              Manage Orders
            </h1>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
              Track delivery status, review buyer instructions, and manage all your order deliverables.
            </p>
          </div>

          {/* 4-Metric Stats Bar matching dashboard aesthetic */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 gap-y-5 sm:gap-y-0">
            <div className="sm:pr-6 flex items-start justify-between">
              <div>
                <span className="text-xs font-normal text-gray-500 block mb-1">Total Orders</span>
                <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                  {sellerOrders.length}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Across all clients</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <FiPackage className="text-base" />
              </div>
            </div>

            <div className="sm:px-6 pt-4 sm:pt-0 flex items-start justify-between">
              <div>
                <span className="text-xs font-normal text-gray-500 block mb-1">In Progress</span>
                <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                  {inProgressOrders.length}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Active deliverables</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50/60 border border-blue-100/60 flex items-center justify-center text-blue-600 shrink-0">
                <FiClock className="text-base" />
              </div>
            </div>

            <div className="sm:px-6 pt-4 sm:pt-0 flex items-start justify-between">
              <div>
                <span className="text-xs font-normal text-gray-500 block mb-1">Delivered</span>
                <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                  {deliveredOrders.length}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Awaiting client review</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50/60 border border-emerald-100/60 flex items-center justify-center text-emerald-600 shrink-0">
                <FiTruck className="text-base" />
              </div>
            </div>

            <div className="sm:pl-6 pt-4 sm:pt-0 flex items-start justify-between">
              <div>
                <span className="text-xs font-normal text-gray-500 block mb-1">Completed</span>
                <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                  {completedOrders.length}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Successfully closed</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50/60 border border-emerald-100/60 flex items-center justify-center text-emerald-600 shrink-0">
                <FiCheckCircle className="text-base" />
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap pb-1">
              <div className="bg-white border border-gray-200/90 rounded-lg p-0.5 flex items-center gap-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 sm:px-5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Orders ({sellerOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("in_progress")}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "in_progress"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  In Progress ({inProgressOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("delivered")}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "delivered"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Delivered ({deliveredOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "completed"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Completed ({completedOrders.length})
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-700 border-b border-gray-100">
                    <th className="py-3.5 px-3 font-bold">Order Name</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Buyer</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Order Date</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Due on</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Total</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-gray-400 text-xs sm:text-sm font-medium">
                        No orders found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => {
                      const isBrief = Boolean(order.briefID || order.type === "brief");
                      const orderDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—";
                      const dueDate = order.deadline
                        ? new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—";

                      const statusBadge = getStatusBadge(order.status);
                      const buyerName = order.buyerID?.username || order.buyerID?.name || "Client";
                      const buyerAvatar = order.buyerID?.image || "/media/noavatar.png";

                      return (
                        <tr
                          key={order._id}
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                        >
                          {/* Order Name & Thumbnail */}
                          <td className="py-4 px-3 align-middle max-w-[340px]">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={order.image || order.cover || "/images/dashboard/orders/order_1.png"}
                                alt=""
                                className="w-20 sm:w-24 h-12 sm:h-13 rounded-lg object-cover bg-gray-100 border border-gray-200/80 shrink-0"
                              />
                              <div className="flex flex-col gap-1 min-w-0">
                                <span
                                  className="text-xs sm:text-[13px] font-normal text-gray-800 line-clamp-2 leading-snug"
                                  title={order.title}
                                >
                                  {order.title || "Custom Deliverable"}
                                </span>
                                <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200 w-fit">
                                  {isBrief ? "Brief" : "Package"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Buyer */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img
                                src={buyerAvatar}
                                alt={buyerName}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200"
                              />
                              <span className="text-xs sm:text-[13px] font-medium text-gray-800">
                                {buyerName}
                              </span>
                            </div>
                          </td>

                          {/* Order Date */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13px] text-gray-700 font-normal whitespace-nowrap">
                            {orderDate}
                          </td>

                          {/* Due Date */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13px] text-gray-700 font-normal whitespace-nowrap">
                            {dueDate}
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13.5px] font-bold text-gray-950 whitespace-nowrap">
                            {(order.price || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Status Pill */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span
                              className={`text-[11.5px] font-medium px-3.5 py-1 rounded-full inline-block ${statusBadge.style}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                handleContact(order);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200/90 hover:bg-[#0B3A33] hover:text-white hover:border-[#0B3A33] transition-all cursor-pointer shadow-2xs"
                            >
                              <FiMessageSquare className="text-xs" />
                              <span>Chat</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default function ManageOrdersPage() {
  return <ManageOrders />;
}
