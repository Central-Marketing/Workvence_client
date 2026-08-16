"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from '@/components';
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";

const Orders = () => {
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
        .then(({ data }) => data)
        .catch(({ response }) => {
          console.log(response?.data);
          return [];
        }),
  });

  const handleContact = async (order: any) => {
    const sellerID = order.sellerID.hasOwnProperty("_id")
      ? order.sellerID._id
      : order.sellerID;
    const buyerID = order.buyerID.hasOwnProperty("_id")
      ? order.buyerID._id
      : order.buyerID;

    axiosFetch
      .get(`/conversations/single/${sellerID}/${buyerID}`)
      .then(({ data }) => {
        const targetId = data.uuid || data.conversationID || data._id;
        router.push(`/message/${targetId}`);
      })
      .catch(async () => {
        const { data } = await axiosFetch.post("/conversations", {
          to: user.isSeller ? buyerID : sellerID,
          from: user.isSeller ? sellerID : buyerID,
        });
        const targetId = data.uuid || data.conversationID || data._id;
        router.push(`/message/${targetId}`);
      });
  };

  // Filter orders by selected status tab
  const filteredOrders = data.filter((order: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "in_progress") return order.status === "paid" || !order.status;
    return order.status === statusFilter;
  });

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 flex justify-center font-sans">
      {isLoading ? (
        <div className="w-full flex justify-center items-center py-16"> <Loader size={45} /> </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-semibold">Something went wrong!</div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 flex flex-col ">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-6 md:px-7 md:pb-4 md:pt-6 bg-white">
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Manage Orders</h1>
              <p className="text-[13.5px] text-slate-500">Click on any order row to track delivery status, view ledger details, or message contacts</p>
            </div>

            {/* Filter Tabs Row */}
            <div className="flex gap-2 px-5 pb-5 md:px-7 md:pb-4 border-b border-slate-200 flex-wrap">
              <button
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${statusFilter === "all" ? "bg-brand-green text-white border-brand-green" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-200"}`}
                onClick={() => setStatusFilter("all")}
              >
                All Orders ({data.length})
              </button>
              <button
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${statusFilter === "in_progress" ? "bg-brand-green text-white border-brand-green" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-200"}`}
                onClick={() => setStatusFilter("in_progress")}
              >
                In Progress ({data.filter((o: any) => o.status === 'paid' || !o.status).length})
              </button>
              <button
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${statusFilter === "delivered" ? "bg-brand-green text-white border-brand-green" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-200"}`}
                onClick={() => setStatusFilter("delivered")}
              >
                Delivered ({data.filter((o: any) => o.status === 'delivered').length})
              </button>
              <button
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${statusFilter === "completed" ? "bg-brand-green text-white border-brand-green" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-200"}`}
                onClick={() => setStatusFilter("completed")}
              >
                Completed ({data.filter((o: any) => o.status === 'completed').length})
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">
                      Image
                    </th>

                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50 whitespace-nowrap">
                      {user?.isSeller ? "Buyer" : "Seller"}
                    </th>

                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50 w-[280px]">
                      Title
                    </th>

                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50 whitespace-nowrap">
                      Order ID
                    </th>

                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50 whitespace-nowrap">
                      Price
                    </th>

                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50 whitespace-nowrap">
                      Status Pill
                    </th>

                    <th className="py-3.5 px-5 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50 whitespace-nowrap">
                      Contact
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center p-12 text-slate-400 font-medium"
                      >
                        No orders found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => (
                      <tr
                        key={order._id}
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="cursor-pointer transition-colors hover:bg-slate-50"
                      >
                        {/* Image */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle">
                          <img
                            className="w-[70px] h-[48px] rounded-md object-cover border border-slate-200"
                            src={order.image || "/media/noavatar.png"}
                            alt=""
                          />
                        </td>

                        {/* Buyer / Seller */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle text-sm font-semibold text-slate-800 whitespace-nowrap">
                          {user?.isSeller
                            ? order.buyerID?.username
                            : order.sellerID?.username}
                        </td>

                        {/* Title */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle w-[280px] max-w-[280px]">
                          <div
                            className="line-clamp-2 text-sm font-medium text-slate-700 leading-5"
                            title={order.title}
                          >
                            {order.title}
                          </div>
                        </td>

                        {/* Order ID */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle text-[12px] font-mono text-slate-500 whitespace-nowrap">
                          {order._id}
                        </td>

                        {/* Price */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle text-[14px] font-bold text-slate-900 whitespace-nowrap">
                          {order.price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wide inline-block ${order.status === "completed"
                                ? "bg-emerald-50 text-emerald-500"
                                : order.status === "delivered"
                                  ? "bg-blue-50 text-blue-500"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                          >
                            {order.status === "completed"
                              ? "Completed"
                              : order.status === "delivered"
                                ? "Delivered"
                                : "In Progress"}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-5 border-b border-slate-100 align-middle whitespace-nowrap">
                          <button
                            className="bg-slate-100 text-slate-700 font-semibold text-[13px] border border-slate-300 py-1.5 px-3.5 rounded-md transition-all hover:bg-brand-green hover:border-brand-green hover:text-white"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleContact(order);
                            }}
                          >
                            Chat
                          </button>
                        </td>
                      </tr>
                    ))
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

export default function OrdersPage() {
  return (
    <PrivateRoute>
      <Orders />
    </PrivateRoute>
  );
}
