"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { Loader } from "@/components";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import moment from "moment";
import toast from "react-hot-toast";

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
    <div className="min-h-[80vh] bg-slate-50 py-10 flex justify-center font-sans">
      <div className="w-[95%] md:w-[90%] max-w-[1100px] flex flex-col gap-7 mx-auto">

        {/* ── Balance Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-[26px] font-extrabold text-slate-900 mb-1">Seller Earnings</h1>
            <p className="text-sm text-slate-500">Track your income, awaiting clearance, and request payouts</p>
          </div>
          <button
            className="w-full md:w-auto bg-brand-green text-white py-3 px-6 rounded-lg text-[14.5px] font-bold transition-all hover:brightness-95 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed whitespace-nowrap"
            onClick={() => setShowPayoutModal(true)}
            disabled={availableBalance <= 0}
          >
            Request Payout
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
            <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 bg-emerald-50">💰</div>
            <div>
              <span className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Net Income (Cleared)</span>
              <h2 className="text-[28px] font-extrabold text-slate-900 m-0 mb-1">{netIncome.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>
              <p className="text-[12.5px] text-slate-400 m-0">{completedOrders.length} completed orders</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
            <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 bg-amber-50">⏳</div>
            <div>
              <span className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Awaiting Clearance</span>
              <h2 className="text-[28px] font-extrabold text-slate-900 m-0 mb-1">{awaitingClearance.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>
              <p className="text-[12.5px] text-slate-400 m-0">{awaitingOrders.length} active orders in escrow</p>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
            <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 bg-blue-50">🏦</div>
            <div>
              <span className="text-[12.5px] font-bold text-emerald-800 uppercase tracking-wide block mb-1.5">Available Balance</span>
              <h2 className="text-[28px] font-extrabold text-emerald-700 m-0 mb-1">
                {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h2>
              <p className="text-[12.5px] text-slate-400 m-0">Ready to withdraw</p>
            </div>
          </div>
        </div>

        {/* ── Payout Request History ── */}
        {payouts.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 md:px-7 md:py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Payout Requests</h2>
              <p className="text-[13.5px] text-slate-500">Your submitted withdrawal requests</p>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[850px] whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Date</th>
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Amount</th>
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Note</th>
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => {
                    const sc = statusColor(p.status);
                    return (
                      <tr key={p._id}>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-600 whitespace-nowrap">{moment(p.createdAt).format("MMM DD, YYYY")}</td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-[15px] font-bold text-emerald-700">
                          {p.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-800 min-w-[300px] whitespace-nowrap">{p.note || "—"}</td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm text-slate-700">
                          <span
                            className="text-[11px] font-bold py-1 px-3 rounded-full uppercase tracking-wide inline-block"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 md:px-7 md:py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Financial Statement History</h2>
            <p className="text-[13.5px] text-slate-500">Complete transaction ledger for all your orders</p>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1000px]">
              <thead>
                <tr>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Date</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Order Reference</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Description</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Amount</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Status</th>
                </tr>
              </thead>
              <tbody>
                {sellerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-slate-400 font-medium">
                      No financial transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sellerOrders.map((order: any) => (
                    <tr key={order._id}>
                      <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-600 whitespace-nowrap">{moment(order.createdAt).format("MMM DD, YYYY")}</td>
                      <td className="py-4 px-6 border-b border-slate-100 align-middle text-[11.5px] font-mono text-slate-500">{order._id?.slice(-8)}</td>
                      <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-800 min-w-[350px] whitespace-nowrap">Payment for: {order.title}</td>
                      <td className="py-4 px-6 border-b border-slate-100 align-middle text-[15px] font-bold text-emerald-700">
                        +{order.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </td>
                      <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm text-slate-700">
                        <span className={`text-[11px] font-bold py-1 px-3 rounded-full uppercase tracking-wide inline-block ${order.status === "completed" ? "bg-emerald-50 text-emerald-600" : order.status === "delivered" ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-600"}`}>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200" onClick={() => setShowPayoutModal(false)}>
          <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center py-4 px-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[17px] font-bold text-slate-900 m-0">Request Payout</h3>
              <button className="text-2xl text-slate-400 hover:text-slate-900 leading-none" onClick={() => setShowPayoutModal(false)}>&times;</button>
            </div>
            <form onSubmit={handlePayoutSubmit} className="p-5 flex flex-col gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg py-3 px-4 flex justify-between items-center text-sm">
                <span className="text-emerald-800 font-semibold">Available Balance</span>
                <strong className="text-lg font-extrabold text-emerald-700">
                  {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </strong>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Amount to Withdraw (USD)</label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-brand-green">
                  <span className="px-3 bg-slate-50 text-slate-600 font-bold text-base border-r border-slate-200 flex items-center h-[42px]">$</span>
                  <input
                    type="number"
                    className="border-none flex-1 p-2.5 text-sm text-slate-800 outline-none"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-slate-600">Note (Optional)</label>
                <input
                  type="text"
                  className="p-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-green w-full"
                  placeholder="e.g. Monthly withdrawal"
                  value={payoutNote}
                  onChange={e => setPayoutNote(e.target.value)}
                />
              </div>

              <p className="text-[12.5px] text-slate-400 bg-slate-50 rounded-lg py-2.5 px-3.5 m-0 leading-relaxed">
                ⚡ Payout requests are reviewed and processed within 2–3 business days. You will be notified when the status changes.
              </p>

              <div className="flex gap-2.5 mt-2">
                <button type="submit" disabled={payoutMutation.isPending} className="flex-1 py-3 px-4 bg-brand-green text-white rounded-lg text-sm font-bold transition-all hover:brightness-95 disabled:bg-slate-300 disabled:cursor-not-allowed">
                  {payoutMutation.isPending ? "Submitting..." : "Submit Request"}
                </button>
                <button type="button" className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold transition-all hover:bg-slate-200" onClick={() => setShowPayoutModal(false)}>
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
