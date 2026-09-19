"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { calculateProfileCompletion } from "../utils/dashboardNormalizer";

interface SellerDashboardProps {
  user: any;
  onSwitchToBuyer?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const router = useRouter();
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "package" | "brief">("all");

  // Fetch seller's packages
  const { data: packages = [] } = useQuery({
    queryKey: ["my-packages"],
    queryFn: () =>
      axiosFetch(`/gigs?userID=${user?._id || user?.id}`)
        .then(({ data }) => (Array.isArray(data) ? data : data?.packages || data?.gigs || []))
        .catch(() => []),
    enabled: !!user,
  });

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ["seller-dashboard-orders"],
    queryFn: () =>
      axiosFetch
        .get("/orders")
        .then(({ data }) => (Array.isArray(data) ? data : data?.orders || []))
        .catch(() => []),
    enabled: !!user,
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["seller-dashboard-convs"],
    queryFn: () =>
      axiosFetch
        .get("/conversations")
        .then(({ data }) => (Array.isArray(data) ? data : []))
        .catch(() => []),
    enabled: !!user,
  });

  const completionPercentage = calculateProfileCompletion(user);
  const isProfileCompleted = completionPercentage >= 100;
  const packagesList = Array.isArray(packages) ? packages : [];
  const hasPackages = packagesList.length > 0;
  const displayName = user?.name ? user.name.split(" ")[0] : (user?.username || "Tomas");

  // Filter draft packages (isDraft === true or "true" or status === "draft")
  const draftPackages = packagesList.filter(
    (pkg: any) => Boolean(pkg.isDraft) === true || pkg.isDraft === "true" || pkg.status === "draft"
  );

  // Find the last uploaded / created draft gig
  const latestDraftPackage = draftPackages.length > 0
    ? [...draftPackages].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      })[0]
    : null;

  const draftEditUrl = latestDraftPackage?._id
    ? `/organize/${latestDraftPackage._id}`
    : latestDraftPackage?.id
    ? `/organize/${latestDraftPackage.id}`
    : "/organize";

  // Condition specified by user:
  // "this image ui will be for seller dashboard when profile is complete 100% and package length is >0"
  const showActiveDashboard = isProfileCompleted && hasPackages;

  // Filter seller-specific orders
  const sellerOrders = orders.filter((order: any) => {
    if (!user?._id) return true;
    const sellerId = typeof order.sellerID === "object" ? order.sellerID?._id : order.sellerID;
    return String(sellerId) === String(user._id) || !order.buyerID;
  });

  const completedOrders = sellerOrders.filter(
    (o: any) => o.status === "completed" || o.isCompleted === true
  );
  const pendingOrders = sellerOrders.filter((o: any) => {
    if (o.isCompleted === true || o.status === "completed") return false;
    if (o.status === "cancelled" || o.status === "failed") return false;
    return (
      o.isCompleted === false ||
      o.status === "in_progress" ||
      o.status === "inprogress" ||
      o.status === "paid" ||
      o.status === "delivered" ||
      o.status === "revision" ||
      o.status === "pending" ||
      !o.status
    );
  });
  const totalFinancialAmount = completedOrders.reduce((sum: number, order: any) => sum + (order.price || 0), 0);
  const unreadMessagesCount = conversations.filter((c: any) => !c.readBySeller).length;

  // Filtered orders by type tab (All, Packages, Briefs)
  const filteredOrders = sellerOrders.filter((o: any) => {
    const isBrief = Boolean(o.briefID || o.type === "brief");
    if (orderTypeFilter === "package") return !isBrief;
    if (orderTypeFilter === "brief") return isBrief;
    return true;
  });

  // -------------------------------------------------------------
  // 1. ACTIVE SELLER DASHBOARD (Profile complete 100% & packages > 0)
  // -------------------------------------------------------------
  if (showActiveDashboard) {
    const ordersToDisplay = filteredOrders;

    const displayRevenue = totalFinancialAmount;
    const displayActiveOrders = pendingOrders.length;
    const displayCompletedOrders = completedOrders.length;
    const displayUnreadMessages = unreadMessagesCount;

    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-10 font-sans">
        <div className="container mx-auto px-4 md:px-6 space-y-7">

          {/* Top Hero Banner: Draft Package Notification */}
          {latestDraftPackage && (
            <div className="relative overflow-hidden rounded-[10px] bg-[#0F0F12] bg-[radial-gradient(ellipse_65%_130%_at_82%_50%,_#7C3AED_0%,_#531A85_38%,_#1D0933_68%,_#0F0F12_100%)] p-7 sm:p-[22px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              {/* Ellipse 15017 ambient glow */}
              <div
                className="absolute -right-16 -top-24 w-[620px] h-[440px] rounded-full pointer-events-none blur-[80px] opacity-80"
                style={{
                  background: "radial-gradient(ellipse at center, #8B5CF6 0%, #7C3AED 35%, #581C87 65%, transparent 85%)",
                }}
              />

              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl sm:text-[28px] font-normal tracking-tight text-white">
                  Your <span className="font-bold">package</span> is currently in draft
                </h2>
                <p className="text-white/75 text-xs sm:text-[13px] mt-2 mb-5 leading-relaxed font-normal">
                  {latestDraftPackage.title
                    ? `"${latestDraftPackage.title}" isn't published yet. Complete the details and publish it when you're ready to start attracting clients.`
                    : "Your package isn't published yet. Complete the details and publish it when you're ready to start attracting clients."}
                </p>
                <Link
                  href={draftEditUrl}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-emerald-300 transition-colors group cursor-pointer"
                >
                  Continue Editing <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              <div
                className="relative w-[180px] sm:w-[215px] h-[172px] sm:h-[206px] shrink-0 self-center md:self-auto z-10 drop-shadow-[0_0_24px_rgba(168,85,247,0.5)]"
                style={{
                  aspectRatio: "215/206",
                  backgroundImage: "url('/images/dashboard/c43d084049b88664dd8666ff65abaa314387feea.png')",
                  backgroundPosition: "-17.2px -16.448px",
                  backgroundSize: "116% 115.969%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          )}

          {/* 4-Metric Stats Bar */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 gap-y-5 sm:gap-y-0">
            <div className="sm:pr-6">
              <span className="text-xs font-normal text-gray-500 block mb-1">Total Revenue</span>
              <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                {displayRevenue.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Cleared earning from{" "}
                <strong className="font-semibold text-gray-700">
                  {completedOrders.length}
                </strong>{" "}
                packages
              </p>
            </div>

            <div className="sm:px-6 pt-4 sm:pt-0">
              <span className="text-xs font-normal text-gray-500 block mb-1">Active Orders</span>
              <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                {displayActiveOrders}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Currently in progress</p>
            </div>

            <div className="sm:px-6 pt-4 sm:pt-0">
              <span className="text-xs font-normal text-gray-500 block mb-1">Completed Orders</span>
              <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                {displayCompletedOrders}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Packages successfully closed</p>
            </div>

            <div className="sm:pl-6 pt-4 sm:pt-0">
              <span className="text-xs font-normal text-gray-500 block mb-1">Unread Messages</span>
              <div className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                {displayUnreadMessages}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Awaiting your response</p>
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-[22px] font-bold text-gray-900 tracking-tight">
                Recent Orders
              </h2>

              <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  title="Filter by date"
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <FiCalendar className="text-sm" />
                </button>

                <div className="bg-white border border-gray-200/90 rounded-lg p-0.5 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setOrderTypeFilter("all")}
                    className={`px-5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${orderTypeFilter === "all"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderTypeFilter("package")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${orderTypeFilter === "package"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Packages
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderTypeFilter("brief")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${orderTypeFilter === "brief"
                      ? "bg-[#0B3A33] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Briefs
                  </button>
                </div>

                <Link
                  href="/manage-orders"
                  className="text-[#0D6D5F] hover:text-[#0A5348] font-semibold text-xs sm:text-[13px] flex items-center gap-1.5 hover:underline ml-1 transition-colors"
                >
                  Manage all orders <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </div>

            {/* Orders Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-700 border-b border-gray-100">
                    <th className="py-3.5 px-3 font-bold">Order Name</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Order Date</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Due on</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Total</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordersToDisplay.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 text-xs sm:text-sm">
                        No orders found in this view.
                      </td>
                    </tr>
                  ) : (
                    ordersToDisplay.slice(0, 8).map((order: any) => {
                      const isBrief = Boolean(order.briefID || order.type === "brief");
                      const orderDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "-";
                      const dueDate = order.deadline
                        ? new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "-";

                      // Determine status pill badge style
                      const st = (order.status || "inprogress").toLowerCase();
                      let statusBadge = {
                        label: "Inprogress",
                        style: "bg-[#E0F2FE] text-[#0284C7]",
                      };

                      if (st === "completed" || order.isCompleted === true) {
                        statusBadge = {
                          label: "Completed",
                          style: "bg-[#D1FAE5] text-[#059669]",
                        };
                      } else if (st === "delivered") {
                        statusBadge = {
                          label: "Delivered",
                          style: "bg-[#D1FAE5] text-[#059669]",
                        };
                      } else if (st === "revision") {
                        statusBadge = {
                          label: "Revision",
                          style: "bg-[#F3E8FF] text-[#9333EA]",
                        };
                      } else if (st === "failed" || st === "cancelled") {
                        statusBadge = {
                          label: "Failed",
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
                          key={order._id}
                          onClick={() => {
                            router.push(`/orders/${order._id}`);
                          }}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-3 align-middle">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-24 sm:w-36 md:w-[180px] lg:w-[220px] aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0">
                                <Image
                                  src={
                                    order.image ||
                                    order.cover ||
                                    order.packageID?.cover ||
                                    order.packageID?.image ||
                                    order.packageID?.images?.[0] ||
                                    "/images/dashboard/orders/order_1.jpg"
                                  }
                                  alt={order.title || "Order deliverable"}
                                  fill
                                  sizes="(max-width: 640px) 96px, (max-width: 1024px) 180px, 220px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-xs sm:text-[13px] font-normal text-gray-800 line-clamp-2 leading-snug">
                                  {order.title || "Custom Deliverable"}
                                </span>
                                <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200 w-fit">
                                  {isBrief ? "Brief" : "Package"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 align-middle text-xs sm:text-[13px] text-gray-700 font-normal whitespace-nowrap">
                            {orderDate}
                          </td>

                          <td className="py-4 px-4 align-middle text-xs sm:text-[13px] text-gray-700 font-normal whitespace-nowrap">
                            {dueDate}
                          </td>

                          <td className="py-4 px-4 align-middle text-xs sm:text-[13.5px] font-bold text-gray-950 whitespace-nowrap">
                            {(order.price || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

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
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ONBOARDING SELLER DASHBOARD (Profile < 100% or packages == 0)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8F8F8] py-8 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-7">

        {/* 1. Header: Welcome & Profile Completion */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-[26px] text-[#555E68] font-normal tracking-tight">
              Welcome to Workvence, <span className="font-bold text-black">{displayName}</span>
            </h1>
          </div>

          {/* Profile Completion Bar */}
          <Link
            href="/profile"
            className="flex flex-col items-start sm:items-end gap-1.5 group cursor-pointer self-start sm:self-auto"
          >
            <div className="flex items-center gap-3 text-[11px] sm:text-xs">
              <span className="text-[#374151] group-hover:text-teal-600 transition-colors underline underline-offset-2">
                Complete your profile
              </span>
              <span className="font-bold text-[#111827]">{completionPercentage}%</span>
            </div>
            <div className="w-[170px] sm:w-[200px] h-[5px] bg-[#E9EBEF] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00E575] to-[#00E3A2] rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </Link>
        </div>

        {/* Draft Package Notification (if draft exists during onboarding) */}
        {latestDraftPackage && (
          <div className="relative overflow-hidden rounded-[10px] bg-[#0F0F12] bg-[radial-gradient(ellipse_65%_130%_at_82%_50%,_#7C3AED_0%,_#531A85_38%,_#1D0933_68%,_#0F0F12_100%)] p-7 sm:p-[22px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div
              className="absolute -right-16 -top-24 w-[620px] h-[440px] rounded-full pointer-events-none blur-[80px] opacity-80"
              style={{
                background: "radial-gradient(ellipse at center, #8B5CF6 0%, #7C3AED 35%, #581C87 65%, transparent 85%)",
              }}
            />

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-[28px] font-normal tracking-tight text-white">
                Your <span className="font-bold">package</span> is currently in draft
              </h2>
              <p className="text-white/75 text-xs sm:text-[13px] mt-2 mb-5 leading-relaxed font-normal">
                {latestDraftPackage.title
                  ? `"${latestDraftPackage.title}" isn't published yet. Complete the details and publish it when you're ready to start attracting clients.`
                  : "Your package isn't published yet. Complete the details and publish it when you're ready to start attracting clients."}
              </p>
              <Link
                href={draftEditUrl}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-emerald-300 transition-colors group cursor-pointer"
              >
                Continue Editing <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div
              className="relative w-[180px] sm:w-[215px] h-[172px] sm:h-[206px] shrink-0 self-center md:self-auto z-10 drop-shadow-[0_0_24px_rgba(168,85,247,0.5)]"
              style={{
                aspectRatio: "215/206",
                backgroundImage: "url('/images/dashboard/c43d084049b88664dd8666ff65abaa314387feea.png')",
                backgroundPosition: "-17.2px -16.448px",
                backgroundSize: "116% 115.969%",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        )}

        {/* 2. Card 1: Ready to Grow Your Business? */}
        <div className="bg-white rounded-[18px] sm:rounded-[22px] border border-[#EBECEF] p-8 sm:py-12 sm:px-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-[140px] sm:w-[165px] h-auto mb-3.5 flex items-center justify-center">
            <img
              src="/images/dashboard/seller_grow_exact.png"
              alt="Ready to Grow Your Business?"
              className="w-full h-auto object-contain"
            />
          </div>
          <h2 className="text-lg sm:text-[22px] font-bold text-[#111827] mb-2 tracking-tight">
            Ready to Grow Your Business?
          </h2>
          <p className="text-[#6B7280] text-xs sm:text-[13px] max-w-[480px] mx-auto leading-relaxed mb-6">
            Showcase your expertise, connect with the right clients, and turn your skills into meaningful opportunities on WorkVench.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/briefs"
              className="px-5 py-2.5 rounded-lg bg-[#EFEFEF] hover:bg-[#E5E5E5] text-[#1F2937] text-xs sm:text-[13px] font-semibold transition-colors"
            >
              Explore Projects
            </Link>
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs sm:text-[13px] font-semibold transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        </div>

        {/* 3. Section 2: Packages (List when exist, Empty state card when 0) */}
        {hasPackages ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-[24px] font-bold text-[#111827] tracking-tight">
                Packages <span className="text-sm font-normal text-slate-500">({packagesList.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                <Link
                  href="/my-packages"
                  className="text-xs sm:text-sm font-semibold text-[#327C73] hover:underline"
                >
                  Manage All
                </Link>
                <Link
                  href="/organize"
                  className="px-4 py-2 rounded-lg bg-brand-green hover:bg-brand-green/90 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  + Add New Package
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {packagesList.map((pkg: any) => (
                <div
                  key={pkg._id}
                  onClick={() => {
                    if (pkg.isDraft === true || pkg.isDraft === "true" || pkg.status === "draft") {
                      router.push(`/organize/${pkg._id}`);
                    } else {
                      router.push(`/package/${pkg._id}`);
                    }
                  }}
                  className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={pkg.cover || pkg.image || "/images/mock-dashboard/rec-1.png"}
                      alt={pkg.title || "Package"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {(pkg.isDraft === true || pkg.isDraft === "true" || pkg.status === "draft") && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      <span className="text-slate-500">
                        Sales: <strong className="text-slate-700">{pkg.sales || 0}</strong>
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {(pkg.price || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <h2 className="text-xl sm:text-[24px] font-bold text-[#111827] tracking-tight">
              Packages
            </h2>

            <div className="bg-white rounded-[18px] sm:rounded-[22px] border border-[#EBECEF] p-8 sm:py-14 sm:px-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="w-[160px] sm:w-[195px] h-auto mb-4 flex items-center justify-center">
                <img
                  src="/images/dashboard/seller_skills_exact.png"
                  alt="Turn Your Skills Into Services"
                  className="w-full h-auto object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-[22px] font-bold text-[#111827] mb-2 tracking-tight">
                Turn Your Skills Into Services
              </h3>
              <p className="text-[#6B7280] text-xs sm:text-[13px] max-w-[480px] mx-auto leading-relaxed mb-6">
                Create packages that showcase your expertise, set clear deliverables, and make it easy for clients to hire you.
              </p>
              <Link
                href="/organize"
                className="px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#74F2C7] to-[#70B2F8] hover:opacity-95 text-[#111827] text-xs sm:text-[13.5px] font-semibold transition-all shadow-xs"
              >
                Create Your First Package
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerDashboard;
