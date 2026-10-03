"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { FiCalendar, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Button, Tag, AccountStandingBanner } from "@/components/ui";
import { calculateProfileCompletion } from "../utils/dashboardNormalizer";
import { sortOrdersByPriority } from "@/features/orders";

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
      o.status === "in_revision" ||
      o.status === "revision" ||
      o.status === "paid" ||
      o.status === "delivered" ||
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
    const ordersToDisplay = sortOrdersByPriority(filteredOrders);

    const displayRevenue = totalFinancialAmount;
    const displayActiveOrders = pendingOrders.length;
    const displayCompletedOrders = completedOrders.length;
    const displayUnreadMessages = unreadMessagesCount;

    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-10 sm:pt-12 pb-[80px] min-[1400px]:pb-[100px] font-sans">
        <div className="container mx-auto px-4 md:px-6 space-y-7">
          {/* Account Standing Warning / Suspension Banner */}
          <AccountStandingBanner />

          {/* 1. Header: Welcome & Profile Completion */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
            {/* Greeting */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-[38px] font-normal text-gray-800 tracking-tight leading-tight">
                Welcome to Workvence, <span className="font-extrabold text-gray-950">{displayName}</span>
              </h1>
            </div>

            {/* Complete Your Profile Bar (only shown when profile < 100%) */}
            {completionPercentage < 100 && (
              <div className="flex flex-col items-start md:items-end shrink-0">
                <div className="flex items-center justify-between w-56 sm:w-64 text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  <Link href="/profile" className="underline hover:text-[#327C73] transition-colors">
                    Complete your profile
                  </Link>
                  <span className="font-bold text-gray-900">{completionPercentage}%</span>
                </div>
                <div className="w-56 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-[#00E599]"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Top Hero Banner: Draft Package Notification */}
          {latestDraftPackage && (
            <div className="relative overflow-hidden rounded-[6px] bg-[#0F0F12] bg-[radial-gradient(ellipse_65%_130%_at_82%_50%,_#7C3AED_0%,_#531A85_38%,_#1D0933_68%,_#0F0F12_100%)] p-7 sm:p-[22px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
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

          <div>
            <h2 className="text-[20px] font-bold text-slate-900">Order Summary</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Get a quick overview of your orders, spending, and current order activity in one place.
            </p>
          </div>

          {/* 4-Metric Stats Bar */}
          <div className="bg-[#f5f5f5] rounded-[6px] border border-[#DADADA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(0,0,0,0.10)] overflow-hidden">
            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
                <p className="text-[24px] font-semibold text-slate-900 mt-1 tracking-tight">
                  {displayRevenue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
                <p className="text-xs text-slate-400 mt-1">Cleared earning from {completedOrders.length} packages</p>
              </div>
              <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#E07A24] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <path d="M26.25 4.12508C25.0384 3.87911 23.7842 3.75 22.5 3.75C12.1447 3.75 3.75 12.1447 3.75 22.5C3.75 32.8552 12.1447 41.25 22.5 41.25C32.8552 41.25 41.25 32.8552 41.25 22.5C41.25 21.2158 41.1208 19.9616 40.875 18.75" stroke="#F57727" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M22.5 16.875C20.4289 16.875 18.75 18.1342 18.75 19.6875C18.75 21.2408 20.4289 22.5 22.5 22.5C24.5711 22.5 26.25 23.7592 26.25 25.3125C26.25 26.8658 24.5711 28.125 22.5 28.125M22.5 16.875C24.1328 16.875 25.5217 17.6576 26.0366 18.75M22.5 16.875V15M22.5 28.125C20.8672 28.125 19.4783 27.3424 18.9634 26.25M22.5 28.125V30" stroke="#F57727" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M31.8712 13.1289L39.7011 5.29478M41.2462 12.1506L41.0246 6.35406C41.0246 4.98786 40.209 4.13663 38.7231 4.02927L32.8654 3.75391" stroke="#F57727" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>



            </div>

            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div className="">
                <p className="text-xs text-slate-500 font-medium">Active Orders</p>
                <p className="text-[24px] font-semibold text-slate-900 mt-1 tracking-tight">
                  {displayActiveOrders}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Currently in progress</p>
              </div>
              <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#9747FF] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <path d="M4.6875 14.0625V25.3125C4.6875 32.3835 4.6875 35.9192 6.88419 38.1157C9.08091 40.3125 12.6164 40.3125 19.6875 40.3125H25.3125C32.3835 40.3125 35.9192 40.3125 38.1157 38.1157C40.3125 35.9192 40.3125 32.3835 40.3125 25.3125V14.0625" stroke="#8133F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.25454 9.96489L4.6875 14.0625H40.3125L37.9646 10.1494C36.3639 7.48164 35.5637 6.14775 34.2741 5.41763C32.9846 4.6875 31.4289 4.6875 28.3179 4.6875H16.7882C13.7437 4.6875 12.2215 4.6875 10.9502 5.39119C9.67903 6.09487 8.87087 7.38489 7.25454 9.96489Z" stroke="#8133F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22.5 14.0625V4.6875" stroke="#8133F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11.25 33.75H20.625M11.25 28.125H16.875" stroke="#8133F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div className="">
                <p className="text-xs font-normal text-slate-500 block mb-1">Completed Orders</p>
                <p className="text-2xl sm:text-[26px] font-bold text-slate-900 mt-1 tracking-tight">
                  {displayCompletedOrders}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Packages successfully completed</p>
              </div>
              <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] flex items-center justify-center text-[#0D9488] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <path d="M22.5 22.5V30" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 22.5V30" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M42.1875 15H2.8125" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M33.75 15L28.125 5.625" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11.25 15L16.875 5.625" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M28.125 35.625C28.125 35.625 30 35.625 31.875 39.375C31.875 39.375 35.9559 30 41.25 28.125" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22.5 37.5H17.9677C13.4161 37.5 11.1403 37.5 9.56674 36.1671C7.99316 34.8339 7.61903 32.5892 6.87075 28.0995L4.6875 15H40.3125L39.0624 22.5" stroke="#1A9997" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>


            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div className="">
                <p className="text-xs font-normal text-gray-500 block mb-1">Unread Messages</p>
                <p className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
                  {displayUnreadMessages}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Awaiting your response</p>
              </div>
              <div className="w-10 h-10 p-2 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#fff] group-hover:bg-[#FFEBEB] flex items-center justify-center text-[#EF4444] shrink-0 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <rect
                    x="4.6875"
                    y="9.375"
                    width="35.625"
                    height="26.25"
                    rx="5.625"
                    stroke="#F00000"
                    strokeWidth="2.8125"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5625 12.1875L20.2444 23.133C21.5794 24.201 23.4206 24.201 24.7556 23.133L38.4375 12.1875"
                    stroke="#F00000"
                    strokeWidth="2.8125"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>
            </div>

          </div>

          {/* Recent Orders Card */}
          <div className="bg-[#F5F5F5] rounded-[6px] border border-[rgba(0,0,0,0.10)] shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-[22px] font-bold text-gray-900 tracking-tight">
                Recent Orders
              </h2>

              <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">


                <div className="inline-flex items-center h-[46px] bg-[#fff] p-[4px] rounded-[6px] border border-gray-200/50">
                  <Button
                    type="button"
                    onClick={() => setOrderTypeFilter("all")}
                    variant={orderTypeFilter === "all" ? "brand" : "ghost"}
                    size="sm"
                    radius="fiverr"
                    className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 ${orderTypeFilter === "all"
                      ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                      : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                      }`}
                  >
                    All
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setOrderTypeFilter("package")}
                    variant={orderTypeFilter === "package" ? "brand" : "ghost"}
                    size="sm"
                    radius="fiverr"
                    className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 ${orderTypeFilter === "package"
                      ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                      : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                      }`}
                  >
                    Packages
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setOrderTypeFilter("brief")}
                    variant={orderTypeFilter === "brief" ? "brand" : "ghost"}
                    size="sm"
                    radius="fiverr"
                    className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 ${orderTypeFilter === "brief"
                      ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                      : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                      }`}
                  >
                    Briefs
                  </Button>
                </div>

                <Link
                  href="/manage-orders"
                  className="text-xs sm:text-sm font-semibold text-[#113E37] hover:underline flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  Manage all orders <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </div>

            <hr className="border-[rgba(0, 0, 0, 0.10)] my-10" />

            {/* Orders Table */}
            <div className="w-full overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch] bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)] ">
              <table className="w-full text-left text-sm border-collapse min-w-[700px] ">
                <thead className="">
                  <tr className="border-b border-slate-100 text-base  font-sf-pro font-bold text-[#434343]">
                    <th className="py-3 px-4 ">Order Name</th>
                    <th className="py-3 px-4  whitespace-nowrap">Order Date</th>
                    <th className="py-3 px-4  whitespace-nowrap">Due on</th>
                    <th className="py-3 px-4  whitespace-nowrap">Total</th>
                    <th className="py-3 px-4  whitespace-nowrap">Status</th>
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
                    ordersToDisplay.slice(0, 5).map((order: any, idx: number) => {
                      const isBrief = Boolean(order.briefID || order.type === "brief");
                      const orderDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "-";
                      let dueDate = "-";
                      let deadlineTime: number | null = null;
                      if (order.deadline) {
                        const d = new Date(order.deadline);
                        if (!isNaN(d.getTime())) {
                          dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                          deadlineTime = d.getTime();
                        }
                      } else if (order.createdAt && order.deliveryTime) {
                        const d = new Date(order.createdAt);
                        if (!isNaN(d.getTime())) {
                          d.setDate(d.getDate() + Number(order.deliveryTime));
                          dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                          deadlineTime = d.getTime();
                        }
                      }

                      // Determine status pill badge style
                      const isCompleted = order.status === "completed" || order.isCompleted === true;
                      const st = (order.status || "inprogress").toLowerCase();
                      const isDisputed = st === "disputed" || st === "escalated_to_dispute";
                      const isCancelled = st === "failed" || st === "cancelled";
                      const isDelivered = st === "delivered";
                      const isRevision = st === "revision" || st === "in_revision";
                      const isLate = !isCompleted && !isCancelled && !isDelivered && !isRevision && !isDisputed && Boolean(deadlineTime && deadlineTime < Date.now());

                      let statusBadge = {
                        label: "Inprogress",
                        style: "bg-[#E6E9F2] text-[#0284C7]",
                      };

                      if (isCompleted) {
                        statusBadge = {
                          label: "Completed",
                          style: "bg-[#D1FAE5] text-[#059669]",
                        };
                      } else if (isDisputed) {
                        statusBadge = {
                          label: "Disputed",
                          style: "bg-[#FEF3C7] text-[#B45309]",
                        };
                      } else if (isDelivered) {
                        statusBadge = {
                          label: "Delivered",
                          style: "bg-[#D1FAE5] text-[#059669]",
                        };
                      } else if (isRevision) {
                        statusBadge = {
                          label: "In Revision",
                          style: "bg-[#F3E8FF] text-[#9333EA]",
                        };
                      } else if (isLate || st === "late") {
                        statusBadge = {
                          label: "Late",
                          style: "bg-[#FEE2E2] text-[#DC2626]",
                        };
                      } else if (isCancelled) {
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
                          key={order._id}
                          onClick={() => {
                            router.push(`/orders/${order._id}`);
                          }}
                          className={`group relative cursor-pointer transition-colors ${idx % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"
                            } after:pointer-events-none after:absolute after:inset-0`}
                        >
                          <td className="py-4 px-3 align-middle">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-24 sm:w-36 md:w-[180px] lg:w-[220px] aspect-[11/6] rounded-[6px] overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0">
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
                                <span className="text-[14px] font-[700] font-sf-pro text-[#434343] line-clamp-1 group-hover:text-[#0D3B34] transition-colors">
                                  {order.title || "Custom Deliverable"}
                                </span>
                                <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-[6px] bg-[#FAFAFA] text-[#292929] border border-[#C7C7C7] w-fit">
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
                            <Tag variant={isDisputed ? "disputed" : (isRevision ? "in_revision" : (isLate || st === "late" ? "late" : (st || statusBadge.label)))} size="sm">
                              {statusBadge.label}
                            </Tag>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* See more orders button */}
            <div className="flex justify-center mt-6 pt-2 ">
              <Button
                href="/manage-orders"
                variant="outline"
                size="sm"
                radius="fiverr"
                className="font-medium text-xs sm:text-sm px-6 py-2.5 border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>See more orders</span>
                <FiArrowRight className="w-4 h-4 text-slate-500" />
              </Button>
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
    <div className="min-h-screen bg-[#F8F8F8] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-6 sm:space-y-7">
        {/* Account Standing Warning / Suspension Banner */}
        <AccountStandingBanner />

        {/* 1. Header: Welcome & Profile Completion */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-[38px] font-normal text-gray-800 tracking-tight leading-tight">
              Welcome to Workvence, <span className="font-extrabold text-gray-950">{displayName}</span>
            </h1>
          </div>

          {/* Complete Your Profile Bar (only shown when profile < 100%) */}
          {completionPercentage < 100 && (
            <div className="flex flex-col items-start md:items-end shrink-0">
              <div className="flex items-center justify-between w-56 sm:w-64 text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                <Link href="/profile" className="underline hover:text-[#327C73] transition-colors">
                  Complete your profile
                </Link>
                <span className="font-bold text-gray-900">{completionPercentage}%</span>
              </div>
              <div className="w-56 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-[#00E599]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Draft Package Notification (if draft exists during onboarding) */}
        {latestDraftPackage && (
          <div className="relative overflow-hidden rounded-[6px] bg-[#0F0F12] bg-[radial-gradient(ellipse_65%_130%_at_82%_50%,_#7C3AED_0%,_#531A85_38%,_#1D0933_68%,_#0F0F12_100%)] p-7 sm:p-[22px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
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
        <div className="bg-white rounded-[6px] border border-[#EBECEF] p-8 sm:py-12 sm:px-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
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
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/briefs"
              className="px-5 py-2.5 rounded-[6px] bg-[#EFEFEF] hover:bg-[#E5E5E5] text-[#1F2937] text-xs sm:text-[13px] font-semibold transition-colors"
            >
              Explore Projects
            </Link>
            <Link
              href="/briefs/my-proposals"
              className="px-5 py-2.5 rounded-[6px] bg-teal-50 hover:bg-teal-100 text-[#0D6D5F] border border-teal-200 text-xs sm:text-[13px] font-semibold transition-colors"
            >
              My Proposals
            </Link>
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-[6px] bg-black hover:bg-zinc-800 text-white text-xs sm:text-[13px] font-semibold transition-colors"
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
                {user?.isSuspended ? (
                  <span
                    title="Account is suspended. Package creation is temporarily disabled."
                    className="px-4 py-2 rounded-[6px] bg-gray-200 text-gray-500 text-xs sm:text-sm font-semibold cursor-not-allowed select-none"
                  >
                    + Add New Package
                  </span>
                ) : (
                  <Link
                    href="/organize"
                    className="px-4 py-2 rounded-[6px] bg-brand-green hover:bg-brand-green/90 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    + Add New Package
                  </Link>
                )}
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
                  className="bg-white rounded-[6px] border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
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

            <div className="bg-white rounded-[6px] border border-[#EBECEF] p-8 sm:py-14 sm:px-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
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
              {user?.isSuspended ? (
                <span
                  title="Account is suspended. Package creation is temporarily disabled."
                  className="px-6 py-2.5 sm:py-3 rounded-[6px] bg-gray-200 text-gray-500 text-xs sm:text-[13.5px] font-semibold cursor-not-allowed select-none"
                >
                  Create Your First Package (Suspended)
                </span>
              ) : (
                <Link
                  href="/organize"
                  className="px-6 py-2.5 sm:py-3 rounded-[6px] bg-gradient-to-r from-[#74F2C7] to-[#70B2F8] hover:opacity-95 text-[#111827] text-xs sm:text-[13.5px] font-semibold transition-all shadow-xs"
                >
                  Create Your First Package
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerDashboard;
