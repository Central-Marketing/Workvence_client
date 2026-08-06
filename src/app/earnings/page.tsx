"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { Loader } from "@/components";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import moment from "moment";
import toast from "react-hot-toast";
import "./Earnings.scss";

const Earnings = () => {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, error, data: orders = [] } = useQuery({
    queryKey: ["seller-earnings-orders"],
    queryFn: () =>
      axiosFetch.get("/orders").then(({ data }) => data).catch(() => []),
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["my-payouts"],
    queryFn: () =>
      axiosFetch.get("/payouts").then(({ data }) => data).catch(() => []),
  });

  const payoutMutation = useMutation({
    mutationFn: (payload: any) => axiosFetch.post("/payouts", payload),
    onSuccess: ({ data }) => {
      toast.success(data.message || "Payout request submitted!");
      setShowPayoutModal(false);
      setPayoutAmount("");
      setPayoutNote("");
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
    },
    onError: () => toast.error("Failed to submit payout request."),
  });

  if (isLoading) return <div className="loader-container"><Loader size={50} /></div>;
  if (error) return <div className="error-container">Something went wrong!</div>;

  // Filter only orders where logged-in user is the seller
  const sellerOrders = orders.filter(
    (order: any) => (order.sellerID?._id || order.sellerID) === user?._id
  );

  const completedOrders = sellerOrders.filter((o: any) => o.status === "completed");
  const netIncome = completedOrders.reduce((acc: number, curr: any) => acc + curr.price, 0);

  const awaitingOrders = sellerOrders.filter((o: any) => o.status === "paid" || o.status === "delivered");
  const awaitingClearance = awaitingOrders.reduce((acc: number, curr: any) => acc + curr.price, 0);

  // Subtract already-requested payouts from available balance
  const totalRequested = payouts
    .filter((p: any) => p.status === "pending" || p.status === "approved")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const availableBalance = Math.max(netIncome - totalRequested, 0);

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amt > availableBalance) {
      toast.error(`Amount exceeds available balance of $${availableBalance.toFixed(2)}.`);
      return;
    }
    payoutMutation.mutate({ amount: amt, note: payoutNote });
  };

  const statusColor = (s: string) => ({
    pending: { bg: "#fffbeb", color: "#d97706" },
    approved: { bg: "#ecfdf5", color: "#10b981" },
    rejected: { bg: "#fef2f2", color: "#ef4444" },
  }[s] || { bg: "#f1f5f9", color: "#64748b" });

  return (
    <div className="earnings">
      <div className="container">

        {/* ── Balance Header ── */}
        <div className="earnings-hero">
          <div className="hero-left">
            <h1>Seller Earnings</h1>
            <p>Track your income, awaiting clearance, and request payouts</p>
          </div>
          <button
            className="payout-cta"
            onClick={() => setShowPayoutModal(true)}
            disabled={availableBalance <= 0}
          >
            Request Payout
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="stats-grid">
          <div className="card stat-box">
            <div className="stat-icon green">💰</div>
            <div>
              <span className="stat-label">Net Income (Cleared)</span>
              <h2>{netIncome.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>
              <p className="stat-sub">{completedOrders.length} completed orders</p>
            </div>
          </div>

          <div className="card stat-box">
            <div className="stat-icon amber">⏳</div>
            <div>
              <span className="stat-label">Awaiting Clearance</span>
              <h2>{awaitingClearance.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>
              <p className="stat-sub">{awaitingOrders.length} active orders in escrow</p>
            </div>
          </div>

          <div className="card stat-box highlight">
            <div className="stat-icon blue">🏦</div>
            <div>
              <span className="stat-label green-text">Available Balance</span>
              <h2 className="balance-amount">
                {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h2>
              <p className="stat-sub">Ready to withdraw</p>
            </div>
          </div>
        </div>

        {/* ── Payout Request History ── */}
        {payouts.length > 0 && (
          <div className="card payout-history-card">
            <div className="card-header">
              <h2>Payout Requests</h2>
              <p>Your submitted withdrawal requests</p>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Note</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => {
                    const sc = statusColor(p.status);
                    return (
                      <tr key={p._id}>
                        <td className="date-cell">{moment(p.createdAt).format("MMM DD, YYYY")}</td>
                        <td className="amount-cell">
                          {p.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="desc-cell">{p.note || "—"}</td>
                        <td>
                          <span
                            className="status-tag"
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Financial Statement Table ── */}
        <div className="card statement-card">
          <div className="card-header">
            <h2>Financial Statement History</h2>
            <p>Complete transaction ledger for all your orders</p>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order Reference</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sellerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-transactions">
                      No financial transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sellerOrders.map((order: any) => (
                    <tr key={order._id}>
                      <td className="date-cell">{moment(order.createdAt).format("MMM DD, YYYY")}</td>
                      <td className="id-cell font-mono">{order._id?.slice(-8)}</td>
                      <td className="desc-cell">Payment for: {order.title}</td>
                      <td className="amount-cell">
                        +{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </td>
                      <td>
                        <span className={`status-tag ${order.status || "paid"}`}>
                          {order.status === "completed" ? "Cleared" : order.status === "delivered" ? "Delivered" : "In Escrow"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Payout Request Modal ── */}
      {showPayoutModal && (
        <div className="modal-backdrop" onClick={() => setShowPayoutModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Request Payout</h3>
              <button onClick={() => setShowPayoutModal(false)}>&times;</button>
            </div>
            <form onSubmit={handlePayoutSubmit} className="payout-form">
              <div className="available-info">
                <span>Available Balance</span>
                <strong>
                  {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </strong>
              </div>

              <div className="field-group">
                <label>Amount to Withdraw (USD)</label>
                <div className="amount-input-wrap">
                  <span className="currency-prefix">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    min="1"
                    max={availableBalance}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly withdrawal"
                  value={payoutNote}
                  onChange={e => setPayoutNote(e.target.value)}
                />
              </div>

              <p className="payout-disclaimer">
                ⚡ Payout requests are reviewed and processed within 2–3 business days. You will be notified when the status changes.
              </p>

              <div className="payout-modal-actions">
                <button type="submit" disabled={payoutMutation.isPending}>
                  {payoutMutation.isPending ? "Submitting..." : "Submit Request"}
                </button>
                <button type="button" className="cancel" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function EarningsPage() {
  return (
    <PrivateRoute>
      <Earnings />
    </PrivateRoute>
  );
}
