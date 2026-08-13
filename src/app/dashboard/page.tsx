"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import "./Dashboard.scss";

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch orders
  const { isLoading: ordersLoading, data: orders = [] } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () =>
      axiosFetch.get("/orders").then(({ data }) => data ?? []).catch(() => []),
  });

  // Fetch conversations
  const { isLoading: convsLoading, data: conversations = [] } = useQuery({
    queryKey: ["dashboard-convs"],
    queryFn: () =>
      axiosFetch.get("/conversations").then(({ data }) => data ?? []).catch(() => []),
  });

  if (!user) {
    return (
      <div className="dashboard-loading">
        <Loader size={45} />
        <h2>Please log in to access your dashboard.</h2>
      </div>
    );
  }

  // Calculate statistics using the delivery status flow
  const completedOrders = orders.filter((o: any) => o.status === 'completed');
  const pendingOrders = orders.filter((o: any) => o.status === 'paid' || o.status === 'delivered' || !o.status);
  const totalOrdersCount = orders.length;

  const totalFinancialAmount = user.isSeller
    ? completedOrders.reduce((sum: number, order: any) => sum + order.price, 0)
    : orders.reduce((sum: number, order: any) => sum + order.price, 0);

  const unreadMessagesCount = conversations.filter((c: any) => {
    return user.isSeller ? !c.readBySeller : !c.readByBuyer;
  }).length;

  // Fetch favorite gigs & favorite sellers for buyers
  const { data: favoriteGigs = [] } = useQuery({
    queryKey: ["dashboard-favorite-gigs"],
    queryFn: () => axiosFetch.get("/gigs/favorites").then(({ data }) => data?.favorites || []).catch(() => []),
    enabled: !!user && !user.isSeller
  });

  const { data: favoriteSellers = [] } = useQuery({
    queryKey: ["dashboard-favorite-sellers"],
    queryFn: () => axiosFetch.get("/users/favorite-sellers").then(({ data }) => data?.sellers || []).catch(() => []),
    enabled: !!user && !user.isSeller
  });

  const totalFavoritesCount = favoriteGigs.length + favoriteSellers.length;

  return (
    <div className="dashboard">
      <div className="container">

        {/* Welcome Section */}
        <div className="welcome-banner">
          <div className="text-sec">
            <h1>Welcome back, {user.username}!</h1>
            <p>Here is what is happening with your Workvence projects today.</p>
          </div>
          <span className={`badge ${user.isSeller ? "seller-badge" : "buyer-badge"}`}>
            {user.isSeller ? "Seller Account" : "Buyer Account"}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="label">{user.isSeller ? "Total Revenue" : "Total Spent"}</span>
            <h2 className="value">
              {totalFinancialAmount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0
              })}
            </h2>
            <p className="subtext">
              {user.isSeller
                ? `Cleared earnings from ${completedOrders.length} packages`
                : `Across all ${totalOrdersCount} placed orders`}
            </p>
          </div>

          <div className="stat-card">
            <span className="label">Active Orders</span>
            <h2 className="value">{pendingOrders.length}</h2>
            <p className="subtext">Currently in progress</p>
          </div>

          <div className="stat-card">
            <span className="label">Completed Orders</span>
            <h2 className="value">{completedOrders.length}</h2>
            <p className="subtext">Packages successfully closed</p>
          </div>

          {!user.isSeller ? (
            <div className="stat-card clickable-card" onClick={() => router.push("/favorites")}>
              <span className="label">My Favorites</span>
              <h2 className="value highlight text-red-500 flex items-center gap-2">
                {totalFavoritesCount}
              </h2>
              <p className="subtext">{favoriteGigs.length} Gigs & {favoriteSellers.length} Sellers saved</p>
            </div>
          ) : (
            <div className="stat-card">
              <span className="label">Unread Messages</span>
              <h2 className="value highlight">{unreadMessagesCount}</h2>
              <p className="subtext">Awaiting your response</p>
            </div>
          )}
        </div>

        {/* Two Column Layout: Recent Orders & Quick Actions */}
        <div className="layout-columns">

          {/* Recent Orders Card */}
          <div className="card orders-card">
            <div className="card-header">
              <h2>Recent Orders</h2>
              <Link href="/orders" className="view-all">View All</Link>
            </div>
            {ordersLoading ? (
              <div className="loader-container"><Loader size={35} /></div>
            ) : orders.length === 0 ? (
              <p className="empty-message">No orders placed yet.</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 4).map((order: any) => {
                      const isOrdPaid = order.status === 'paid' || !order.status;
                      const isOrdDelivered = order.status === 'delivered';
                      const isOrdCompleted = order.status === 'completed';
                      return (
                        <tr key={order._id} onClick={() => router.push(`/orders/${order._id}`)} className="clickable-row">
                          <td>
                            <img className="order-img" src={order.image || "/media/noavatar.png"} alt="" />
                          </td>
                          <td className="title-cell">{order.title}</td>
                          <td className="price-cell">
                            {order.price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD"
                            })}
                          </td>
                          <td>
                            <span className={`status-tag ${order.status || 'paid'}`}>
                              {isOrdCompleted ? "Completed" : isOrdDelivered ? "Delivered" : "In Progress"}
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
          <div className="card actions-card">
            <h2>Quick Actions</h2>
            <div className="actions-list">
              <Link href="/packages" className="action-button primary">
                Browse Services
              </Link>
              <Link href="/messages" className="action-button secondary">
                Open Inbox Chat
              </Link>
              {user.isSeller ? (
                <>
                  <Link href="/organize" className="action-button secondary">
                    Publish a new Package
                  </Link>
                  <Link href="/briefs" className="action-button secondary">
                    Browse Job Briefs
                  </Link>
                  <Link href="/earnings" className="action-button secondary">
                    View Earnings Statement
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/favorites" className="action-button secondary ">
                    My Favorites ({totalFavoritesCount})
                  </Link>
                  <Link href="/briefs/create" className="action-button secondary">
                    Post a Job Brief
                  </Link>
                  <Link href="/register?seller=true" className="action-button secondary">
                    Become a Seller
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  );
}
