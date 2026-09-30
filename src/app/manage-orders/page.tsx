"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components";
import { Breadcrumb, OrdersTableSkeleton, Tag } from "@/components/ui";
import { FiHome, FiCalendar, FiSearch } from "react-icons/fi";

const getOrderDeadlineTime = (item: any): number | null => {
  const deadlineStr = item.deadline || item.raw?.deadline;
  if (deadlineStr) {
    const parsed = new Date(deadlineStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  const createdAtStr = item.createdAt || item.raw?.createdAt;
  const deliveryDays = Number(item.deliveryTime ?? item.raw?.deliveryTime);
  if (createdAtStr && !isNaN(deliveryDays) && deliveryDays > 0) {
    const created = new Date(createdAtStr).getTime();
    if (!isNaN(created)) {
      return created + deliveryDays * 86400000;
    }
  }
  return null;
};



type FilterTab = "priority" | "active" | "late" | "delivered" | "completed" | "cancelled";

const ManageOrders = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Filter and search state
  const [activeTab, setActiveTab] = useState<FilterTab>("priority");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Helper for status badge style matching the mockup
  const getStatusBadge = (status?: string, isCompleted?: boolean) => {
    if (isCompleted || status === "completed") {
      return {
        label: "Completed",
        style: "bg-[#D1FAE5] text-[#059669]",
      };
    }
    const st = (status || "inprogress").toLowerCase();
    if (st === "delivered") {
      return {
        label: "Delivered",
        style: "bg-[#D1FAE5] text-[#059669]",
      };
    }
    if (st === "revision" || st === "in_revision") {
      return {
        label: "Revision",
        style: "bg-[#F3E8FF] text-[#9333EA]",
      };
    }
    if (st === "late") {
      return {
        label: "Late",
        style: "bg-[#FEE2E2] text-[#DC2626]",
      };
    }
    if (st === "cancelled") {
      return {
        label: "Cancelled",
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

  // Real backend orders for seller
  const ordersList = sellerOrders;

  // Filter orders by active tab
  const tabFilteredOrders = ordersList.filter((item: any) => {
    const isCompleted = item.status === "completed" || item.isCompleted === true;
    const st = (item.status || "inprogress").toLowerCase();
    if (activeTab === "priority") {
      if (isCompleted) return false;
      if (st === "cancelled" || st === "failed") return false;
      return true;
    }
    if (activeTab === "active") {
      if (isCompleted) return false;
      if (st === "cancelled" || st === "failed") return false;
      return (
        item.isCompleted === false ||
        st === "paid" ||
        st === "in_progress" ||
        st === "inprogress" ||
        st === "delivered" ||
        st === "in_revision" ||
        st === "revision" ||
        st === "pending" ||
        st === "late" ||
        !item.status
      );
    }
    if (activeTab === "late") return st === "late";
    if (activeTab === "delivered") return st === "delivered";
    if (activeTab === "completed") return isCompleted;
    if (activeTab === "cancelled") return st === "cancelled" || st === "failed";
    return true;
  });

  // Filter orders by search query
  const filteredOrders = tabFilteredOrders.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const buyerName = item.buyer?.name || item.buyerID?.username || item.buyerID?.name || "";
    const projectTitle = item.projectTitle || item.title || "";
    const projectDesc = item.projectDescription || item.description || "";
    const orderId = item.orderIdText || item._id || "";
    return (
      buyerName.toLowerCase().includes(q) ||
      projectTitle.toLowerCase().includes(q) ||
      projectDesc.toLowerCase().includes(q) ||
      orderId.toLowerCase().includes(q)
    );
  });

  // Sort orders based on active tab:
  // "priority" tab sorts by deadline ascending (closest/earliest deadline first)
  const displayedOrders = useMemo(() => {
    if (activeTab === "priority") {
      return [...filteredOrders].sort((a: any, b: any) => {
        const timeA = getOrderDeadlineTime(a);
        const timeB = getOrderDeadlineTime(b);

        const validA = timeA !== null && !isNaN(timeA);
        const validB = timeB !== null && !isNaN(timeB);

        if (validA && validB) {
          return (timeA as number) - (timeB as number);
        }
        if (validA && !validB) return -1;
        if (!validA && validB) return 1;
        return 0;
      });
    }
    return filteredOrders;
  }, [filteredOrders, activeTab]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "priority", label: "Priority" },
    { id: "active", label: "Active" },
    { id: "late", label: "Late" },
    { id: "delivered", label: "Delivered" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      {isLoading ? (
        <div className="container mx-auto px-4 md:px-6 space-y-6">
          <Breadcrumb
            homeHref="/dashboard/seller"
            homeTitle="Dashboard"
            items={[
              {
                name: "Dashboard",
                href: "/dashboard/seller",
              },
              {
                name: "Manage Orders",
                isLast: true,
              },
            ]}
          />
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[28px] font-medium font-inter text-[#292929]">
              Manage Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Track and manage all buyer orders and milestones.
            </p>
          </div>
          <OrdersTableSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-semibold">
          Something went wrong loading your orders!
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 space-y-6">

          {/* Breadcrumb Navigation */}
          <Breadcrumb
            homeHref="/dashboard/seller"
            homeTitle="Dashboard"
            items={[
              // {
              //   name: "Dashboard",
              //   href: "/dashboard/seller",
              // },
              {
                name: "Manage Orders",
                isLast: true,
              },
            ]}
          />

          {/* Page Heading */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-sf-pro text-[#292929]">
              Manage Orders
            </h1>
            <p className="text-xs sm:text-[14px] text-[#6E6E6E] mt-1.5 leading-relaxed">
              View, track, and manage all your orders, from recent purchases to upcoming deliveries, in one place.
            </p>
          </div>

          {/* Main Card Container */}
          <div className="bg-[#F5F5F5] rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">

            {/* Top Toolbar: Filter Tabs on Left + Calendar & Search on Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              {/* Segmented Filter Tab Pills */}
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
                      className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-3 sm:px-4 whitespace-nowrap transition-all cursor-pointer ${isActive
                        ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                        : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                        }`}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              {/* Right Side: Calendar Button + Search Box */}
              <div className="flex items-center gap-3 self-start lg:self-auto">


                <div className="relative flex items-center">
                  <FiSearch className="absolute left-3 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    placeholder="What you are looking for"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-52 sm:w-64 pl-8 pr-3 py-2 text-xs border border-gray-200/90 rounded-[6px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0B3A33] transition-colors bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="w-full bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)] shadow-sm overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 text-base  font-sf-pro font-bold text-[#434343]">
                    <th className="py-3 px-4 ">Buyer</th>
                    <th className="py-3 px-4 ">Project</th>
                    <th className="py-3 px-4  whitespace-nowrap">Due on</th>
                    <th className="py-3 px-4  whitespace-nowrap">Price</th>
                    <th className="py-3 px-4  whitespace-nowrap">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {displayedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-400 text-xs sm:text-sm font-medium">
                        No orders found in this view.
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((order: any) => {
                      // Extract Buyer details
                      const buyerName =
                        order.buyer?.name ||
                        order.buyerID?.username ||
                        order.buyerID?.name ||
                        "Client";
                      const buyerRole =
                        order.buyer?.role ||
                        order.buyerID?.shortTitle ||
                        order.buyerID?.role ||
                        "--";
                      const buyerAvatar =
                        order.buyer?.avatar ||
                        order.buyerID?.image ||
                        "/media/noavatar.png";
                      const isVerified = Boolean(
                        order.buyer?.verified ||
                        order.buyerID?.isVerified ||
                        order.buyerID?.verified
                      );

                      // Extract Project details
                      const projectTitle =
                        order.projectTitle ||
                        order.gigID?.title ||
                        order.title ||
                        "Custom Deliverable";
                      const projectDescription =
                        order.projectDescription ||
                        order.gigID?.desc ||
                        order.description ||
                        order.instructions ||
                        "";

                      // Extract Due Date text
                      const rawDeadline =
                        order.deadline ||
                        order.dueDate ||
                        order.raw?.deadline;
                      let dueDate = "-";
                      if (rawDeadline) {
                        const d = new Date(rawDeadline);
                        if (!isNaN(d.getTime())) {
                          dueDate = d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }
                      } else if (order.deliveryTime && order.createdAt) {
                        const days =
                          typeof order.deliveryTime === "number"
                            ? order.deliveryTime
                            : parseInt(order.deliveryTime, 10);
                        if (!isNaN(days)) {
                          const d = new Date(
                            new Date(order.createdAt).getTime() + days * 24 * 60 * 60 * 1000
                          );
                          if (!isNaN(d.getTime())) {
                            dueDate = d.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                          }
                        }
                      }

                      // Status pill styling
                      const statusBadge = getStatusBadge(order.status, order.isCompleted);

                      return (
                        <tr
                          key={order._id}
                          onClick={() => {
                            router.push(`/orders/${order._id}`);
                          }}
                          className="group relative cursor-pointer transition-colors odd:bg-[#F5F5F5] after:pointer-events-none after:absolute after:inset-0 after:border-transparent hover:after:border-[rgba(0,0,0,0.10)]"
                        >
                          {/* Buyer Column */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={buyerAvatar}
                                alt={buyerName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-[510] font-sf-pro text-black group-hover:text-[#0D3B34] transition-colors">
                                    {buyerName}
                                  </span>
                                  {/* {isVerified && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#0B3A33] text-white text-[9.5px] font-semibold tracking-wide">
                                      Verified
                                    </span>
                                  )} */}
                                </div>
                                {/* <span className="text-[11px] text-gray-500 mt-0.5">
                                  {buyerRole}
                                </span> */}
                              </div>
                            </div>
                          </td>

                          {/* Project Column */}
                          <td className="py-4 px-4 align-middle max-w-[340px]">
                            <div className="flex flex-col">
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
                          </td>

                          {/* Due Date Column */}
                          <td className="py-5 px-4 align-middle text-xs sm:text-sm font-[400] font-sf-pro text-[#434343] whitespace-nowrap">
                            {dueDate}
                          </td>

                          {/* Price Column */}
                          <td className="py-4 px-4 align-middle text-xs sm:text-[13.5px] font-bold text-gray-950 whitespace-nowrap">
                            {(order.price || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <Tag variant={order.status || statusBadge.label} size="sm">
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

          </div>

        </div>
      )}
    </div>
  );
};

export default function ManageOrdersPage() {
  return <ManageOrders />;
}
