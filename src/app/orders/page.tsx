"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from '@/components';
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import "./Orders.scss";

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
        router.push(`/message/${data.conversationID}`);
      })
      .catch(async () => {
        const { data } = await axiosFetch.post("/conversations", {
          to: user.isSeller ? buyerID : sellerID,
          from: user.isSeller ? sellerID : buyerID,
        });
        router.push(`/message/${data.conversationID}`);
      });
  };

  // Filter orders by selected status tab
  const filteredOrders = data.filter((order: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "in_progress") return order.status === "paid" || !order.status;
    return order.status === statusFilter;
  });

  return (
    <div className="orders">
      {isLoading ? (
        <div className="loader"> <Loader size={45} /> </div>
      ) : error ? (
        <div className="orders-error">Something went wrong!</div>
      ) : (
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1>Manage Orders</h1>
              <p>Click on any order row to track delivery status, view ledger details, or message contacts</p>
            </div>

            {/* Filter Tabs Row */}
            <div className="filter-tabs">
              <button 
                className={statusFilter === "all" ? "tab-btn active" : "tab-btn"} 
                onClick={() => setStatusFilter("all")}
              >
                All Orders ({data.length})
              </button>
              <button 
                className={statusFilter === "in_progress" ? "tab-btn active" : "tab-btn"} 
                onClick={() => setStatusFilter("in_progress")}
              >
                In Progress ({data.filter((o: any) => o.status === 'paid' || !o.status).length})
              </button>
              <button 
                className={statusFilter === "delivered" ? "tab-btn active" : "tab-btn"} 
                onClick={() => setStatusFilter("delivered")}
              >
                Delivered ({data.filter((o: any) => o.status === 'delivered').length})
              </button>
              <button 
                className={statusFilter === "completed" ? "tab-btn active" : "tab-btn"} 
                onClick={() => setStatusFilter("completed")}
              >
                Completed ({data.filter((o: any) => o.status === 'completed').length})
              </button>
            </div>
            
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>{user?.isSeller ? "Buyer" : "Seller"}</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Status Pill</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-orders-msg">
                        No orders found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => (
                      <tr key={order._id} onClick={() => router.push(`/orders/${order._id}`)} className="clickable-row">
                        <td>
                          <img className="order-img" src={order.image || "/media/noavatar.png"} alt="" />
                        </td>
                        <td className="user-cell">
                          {user?.isSeller
                            ? order.buyerID?.username
                            : order.sellerID?.username}
                        </td>
                        <td className="title-cell">{order.title}</td>
                        <td className="price-cell">
                          {order.price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>
                        <td>
                          <span className={`status-pill ${order.status || 'paid'}`}>
                            {order.status === 'completed' ? 'Completed' : order.status === 'delivered' ? 'Delivered' : 'In Progress'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="contact-action-btn"
                            onClick={(e: any) => {
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
