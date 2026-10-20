"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components";
import { Breadcrumb, Tag, Modal, OrdersTableSkeleton } from "@/components/ui";
import { sortOrdersByPriority, getOrderDeadlineTime } from "@/features/orders";

type FilterTab = "priority" | "active" | "late" | "delivered" | "completed" | "cancelled";

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

  // Status resolver helper following canonical orders business logic
  const resolveOrderStatus = (item: any, now = Date.now()): { label: string; variant: string } => {
    const raw = item.raw || item;
    const statusStr = String(item.status || raw.status || "inprogress").toLowerCase().trim();

    const isCompleted =
      statusStr === "completed" ||
      statusStr === "complete" ||
      Boolean(item.isCompleted || raw.isCompleted);
    if (isCompleted) {
      return { label: "Completed", variant: "completed" };
    }

    const isCancelled =
      statusStr === "cancelled" || statusStr === "canceled" || statusStr === "failed";
    if (isCancelled) {
      return { label: "Cancelled", variant: "cancelled" };
    }

    const isDisputed =
      statusStr === "disputed" ||
      statusStr === "escalated_to_dispute" ||
      String(raw.escrowStatus || "").toLowerCase() === "disputed" ||
      Boolean(raw.isDisputed || item.isDisputed);
    if (isDisputed) {
      return { label: "Disputed", variant: "disputed" };
    }

    const isRevision = statusStr === "revision" || statusStr === "in_revision";
    if (isRevision) {
      return { label: "In Revision", variant: "in_revision" };
    }

    const isDelivered = statusStr === "delivered";
    if (isDelivered) {
      return { label: "Delivered", variant: "delivered" };
    }

    const deadlineTime = getOrderDeadlineTime(item);
    const isLate = statusStr === "late" || Boolean(deadlineTime !== null && deadlineTime < now);
    if (isLate) {
      return { label: "Late", variant: "late" };
    }

    if (statusStr === "pending" || statusStr === "paid") {
      return { label: "Pending", variant: "pending" };
    }

    return { label: "Inprogress", variant: "inprogress" };
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

  const formatDueDate = (order: any): string => {
    const raw = order.raw || order;
    const deadline = order.deadline || raw.deadline || order.dueDate || raw.dueDate;
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    const createdAt = order.createdAt || raw.createdAt;
    const deliveryDays = Number(order.deliveryTime ?? raw.deliveryTime);
    if (createdAt && !isNaN(deliveryDays) && deliveryDays > 0) {
      const d = new Date(new Date(createdAt).getTime() + deliveryDays * 86400000);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    return "-";
  };

  // Filter orders by active tab and search query with accurate status resolution
  const tabFilteredOrders = useMemo(() => {
    const now = Date.now();
    return mutualOrders.filter((item: any) => {
      const statusInfo = resolveOrderStatus(item, now);
      const deadlineTime = getOrderDeadlineTime(item);

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (item.title || item.projectTitle || item.gigID?.title || "").toLowerCase();
        const desc = (item.description || item.projectDescription || item.instructions || "").toLowerCase();
        const code = String(item._id || item.id || "").toLowerCase();
        if (!title.includes(q) && !desc.includes(q) && !code.includes(q)) {
          return false;
        }
      }

      // Tab filtering
      if (activeTab === "priority") {
        if (
          statusInfo.variant === "completed" ||
          statusInfo.variant === "cancelled" ||
          statusInfo.variant === "delivered"
        ) {
          return false;
        }
        if (
          statusInfo.variant === "disputed" ||
          statusInfo.variant === "in_revision" ||
          statusInfo.variant === "late"
        ) {
          return true;
        }
        const isUrgent = Boolean(deadlineTime && deadlineTime - now <= 24 * 60 * 60 * 1000);
        return isUrgent;
      }
      if (activeTab === "active") {
        return statusInfo.variant !== "completed" && statusInfo.variant !== "cancelled";
      }
      if (activeTab === "late") return statusInfo.variant === "late";
      if (activeTab === "delivered") return statusInfo.variant === "delivered";
      if (activeTab === "completed") return statusInfo.variant === "completed";
      if (activeTab === "cancelled") return statusInfo.variant === "cancelled";
      return true;
    });
  }, [mutualOrders, activeTab, searchQuery]);

  // Apply canonical multi-tier priority sort
  const displayedOrders = useMemo(() => {
    return sortOrdersByPriority(tabFilteredOrders);
  }, [tabFilteredOrders]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "priority", label: "Priority" },
    { id: "active", label: "Active" },
    { id: "late", label: "Late" },
    { id: "delivered", label: "Delivered" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
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
    <div className="min-h-screen bg-[#F8F8F8] pt-8 sm:pt-10 md:pt-12 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Breadcrumb
            homeHref={isSeller ? "/dashboard/seller" : "/dashboard/buyer"}
            homeTitle="Dashboard"
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
        <div className="bg-[#F5F5F5] rounded-[6px] border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
          {/* Controls Bar: Tabs + Search Input */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Pill Tabs */}
            <div className="bg-[#fff] p-[4px] rounded-[6px] border border-gray-200/50 inline-flex items-center h-[46px] overflow-x-auto scrollbar-none max-w-full">
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
                    className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                        : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                    }`}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Right Tools: Search box */}
            <div className="flex items-center gap-3">
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
            <OrdersTableSkeleton />
          ) : (
            <div className="w-full bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)] shadow-sm overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-base font-sf-pro font-bold text-[#434343]">
                    <th className="py-3 px-4">{isSeller ? "Buyer" : "Seller"}</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4 whitespace-nowrap">Due on</th>
                    <th className="py-3 px-4 whitespace-nowrap">Price</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 text-xs sm:text-sm font-medium">
                        No orders found with this {isSeller ? "buyer" : "seller"} in this view.
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((order: any) => {
                      const counterpartObj = isSeller
                        ? (typeof order.buyerID === "object" && order.buyerID !== null ? order.buyerID : (order.buyer || {}))
                        : (typeof order.sellerID === "object" && order.sellerID !== null ? order.sellerID : (order.seller || {}));

                      const counterpartName = counterpartObj.name || counterpartObj.username || contactDisplayName;
                      const counterpartAvatar = counterpartObj.image || counterpartObj.avatar || counterpartObj.img || contactAvatar;
                      const counterpartRole = counterpartObj.shortTitle || counterpartObj.title || counterpartObj.role || contactRole;
                      const counterpartBadge = counterpartObj.badge || contactUser?.badge;

                      const projectTitle =
                        order.title ||
                        order.projectTitle ||
                        order.gigID?.title ||
                        order.packageID?.title ||
                        "Custom Deliverable";
                      const projectDescription =
                        order.projectDescription ||
                        order.description ||
                        order.gigID?.desc ||
                        order.gigID?.description ||
                        order.instructions ||
                        "";

                      const dueDate = formatDueDate(order);
                      const statusInfo = resolveOrderStatus(order);
                      const price = Number(order.price) || 0;

                      return (
                        <tr
                          key={order._id || order.id}
                          onClick={() => router.push(`/orders/${order._id || order.id}`)}
                          className="group relative cursor-pointer transition-colors odd:bg-[#F5F5F5] even:bg-white after:pointer-events-none after:absolute after:inset-0 after:border-transparent hover:after:border-[rgba(0,0,0,0.10)]"
                        >
                          {/* Counterpart Column */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={counterpartAvatar}
                                alt={counterpartName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-[510] font-sf-pro text-black group-hover:text-[#0D3B34] transition-colors">
                                    {counterpartName}
                                  </span>
                                  {!isSeller && renderBadge(counterpartBadge)}
                                </div>
                                <span className="text-xs text-slate-500 font-normal">
                                  {counterpartRole}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Project Column */}
                          <td className="py-4 px-4 align-middle max-w-[340px]">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="text-[14px] font-[700] font-sf-pro text-[#434343] line-clamp-1 group-hover:text-[#0D3B34] transition-colors"
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
                                      sellerOrBuyerName: counterpartName,
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
                          <td className="py-5 px-4 align-middle text-xs sm:text-sm font-[400] font-sf-pro text-[#434343] whitespace-nowrap">
                            {dueDate}
                          </td>

                          {/* Price Column */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13.5px] font-bold text-gray-950 whitespace-nowrap">
                            {price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <Tag variant={statusInfo.variant} size="sm">
                              {statusInfo.label}
                            </Tag>
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
      <Modal
        isOpen={Boolean(activeNotesOrder)}
        onClose={() => setActiveNotesOrder(null)}
        title="Order Requirements & Notes"
        footer={
          <Button
            type="button"
            onClick={() => setActiveNotesOrder(null)}
            variant="soft"
            size="md"
            radius="fiverr"
          >
            Close
          </Button>
        }
      >
        {activeNotesOrder && (
          <div className="space-y-4 text-left">
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
              <div className="p-3.5 bg-slate-50 rounded-[6px] border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {activeNotesOrder.notes}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
