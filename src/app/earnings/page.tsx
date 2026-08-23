"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { Loader, KycRequiredModal } from "@/components";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import moment from "moment";
import toast from "react-hot-toast";

const Earnings = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, error, data: statementData } = useQuery({
    queryKey: ["seller-earnings-statement"],
    queryFn: () =>
      axiosFetch.get("/earnings/statement").then(({ data }) => data).catch(() => ({ orders: [], summary: {} })),
  });

  const { data: payoutsData = [] } = useQuery({
    queryKey: ["my-payouts"],
    queryFn: () =>
      axiosFetch.get("/payouts").then(({ data }) => data).catch(() => []),
  });

  const { data: connectStatus } = useQuery({
    queryKey: ["stripe-connect-status"],
    queryFn: () =>
      axiosFetch.get("/payouts/connect/status").then(({ data }) => data).catch(() => null),
  });

  // Handle returning redirect back from Stripe onboarding (?connect=success)
  useEffect(() => {
    if (searchParams?.get("connect") === "success") {
      toast.success("Stripe account successfully connected for payouts!");
      queryClient.invalidateQueries({ queryKey: ["stripe-connect-status"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      router.replace("/earnings");
    }
  }, [searchParams, queryClient, router]);

  const connectOnboardMutation = useMutation({
    mutationFn: () => axiosFetch.post("/payouts/connect/onboard"),
    onSuccess: ({ data }) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to generate Stripe onboarding link.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to initiate Stripe onboarding.");
    },
  });

  const connectDashboardMutation = useMutation({
    mutationFn: () => axiosFetch.post("/payouts/connect/dashboard-link"),
    onSuccess: ({ data }) => {
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Failed to generate Stripe dashboard link.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to open Stripe dashboard.");
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (payload: any) => axiosFetch.post("/payouts", payload),
    onSuccess: ({ data }) => {
      toast.success(data.message || "Payout request submitted!");
      setShowPayoutModal(false);
      setPayoutAmount("");
      setPayoutNote("");
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message || "";
      if (
        status === 403 &&
        (code === "KYC_REQUIRED" ||
          message.toLowerCase().includes("kyc") ||
          message.toLowerCase().includes("identity verification"))
      ) {
        setShowPayoutModal(false);
        setShowKycRequiredModal(true);
        return;
      }
      toast.error(message || "Failed to submit payout request.");
    },
  });

  const syncClearanceMutation = useMutation({
    mutationFn: () => axiosFetch.post("/earnings/sync-clearance"),
    onSuccess: ({ data }) => {
      const msg =
        data?.message ||
        (data?.clearedAmount
          ? `Successfully cleared $${Number(data.clearedAmount).toFixed(2)} across ${data?.clearedCount ?? 1} order(s)!`
          : "Successfully synced cleared funds!");
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "You can sync once every 60 minutes. Please try again later.";
      toast.error(msg);
    },
  });

  if (isLoading) return <div className="loader-container"><Loader size={50} /></div>;
  if (error) return <div className="error-container">Something went wrong!</div>;

  // Extract orders and summary from statement response
  const orders: any[] = Array.isArray(statementData)
    ? statementData
    : (statementData?.orders || []);

  const summary = statementData?.summary || {};

  const payouts: any[] = (statementData?.payouts && statementData.payouts.length > 0)
    ? statementData.payouts
    : (Array.isArray(payoutsData) ? payoutsData : (payoutsData?.payouts || []));

  const completedOrders = orders.filter((o: any) => o.status === "completed" || o.isCompleted);
  const clearedOrders = orders.filter((o: any) => o.isCleared === true);
  const unclearedOrders = orders.filter((o: any) => !o.isCleared);

  // Net Income: From summary.lifetimeTotalIncome (or summary.clearedIncome or calculated)
  const netIncome = summary.lifetimeTotalIncome !== undefined
    ? Number(summary.lifetimeTotalIncome)
    : (summary.clearedIncome !== undefined
      ? Number(summary.clearedIncome)
      : completedOrders.reduce((acc: number, curr: any) => {
        const net = curr.netEarnings !== undefined
          ? curr.netEarnings
          : (curr.grossPrice ? curr.grossPrice - (curr.platformFee || 0) : curr.price || 0);
        return acc + (Number(net) || 0);
      }, 0));

  // Awaiting Clearance: From summary.awaitingClearance or calculated
  const awaitingClearance = summary.awaitingClearance !== undefined
    ? Number(summary.awaitingClearance)
    : unclearedOrders.reduce((acc: number, curr: any) => {
      const net = curr.netEarnings !== undefined
        ? curr.netEarnings
        : (curr.grossPrice ? curr.grossPrice - (curr.platformFee || 0) : curr.price || 0);
      return acc + (Number(net) || 0);
    }, 0);

  // Available Balance: From summary.availableBalance, user store, or computed
  const totalRequested = payouts
    .filter((p: any) => p.status === "pending" || p.status === "approved")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const availableBalance = summary.availableBalance !== undefined
    ? Number(summary.availableBalance)
    : (user?.earningsBalance !== undefined
      ? Number(user.earningsBalance)
      : Math.max(netIncome - totalRequested, 0));

  const readyToSync = summary?.readyToSyncAmount ? Number(summary.readyToSyncAmount) : 0;

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
    payoutMutation.mutate({ amount: amt });
  };

  const statusColor = (s: string) => ({
    pending: { bg: "#fffbeb", color: "#d97706" },
    approved: { bg: "#ecfdf5", color: "#10b981" },
    rejected: { bg: "#fef2f2", color: "#ef4444" },
  }[s] || { bg: "#f1f5f9", color: "#64748b" });

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 flex justify-center font-sans">
      <div className="w-[95%] md:w-[90%] max-w-[1280px] flex flex-col gap-7 mx-auto">

        {/* ── Balance Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-[26px] font-extrabold text-slate-900 mb-1">Seller Earnings</h1>
            <p className="text-sm text-slate-500">Track your income, awaiting clearance, and request payouts</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            {/* Stripe Connect Action Button */}
            {!connectStatus?.payoutsEnabled ? (
              <button
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-brand-black hover:bg-slate-800 text-white py-3 px-5 rounded-xl text-[14px] font-bold transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed whitespace-nowrap shadow-sm active:scale-[0.98]"
                onClick={() => connectOnboardMutation.mutate()}
                disabled={connectOnboardMutation.isPending}
                title="Connect your Stripe account to enable automated direct payouts"
              >
                {connectOnboardMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base leading-none">🔗</span>
                    <span>Connect Stripe Express</span>
                  </>
                )}
              </button>
            ) : (
              <button
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 px-5 rounded-xl text-[14px] font-bold transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed whitespace-nowrap shadow-sm active:scale-[0.98]"
                onClick={() => connectDashboardMutation.mutate()}
                disabled={connectDashboardMutation.isPending}
                title="View your Stripe Express account, bank details, and transfer history"
              >
                {connectDashboardMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin inline-block" />
                    <span>Opening Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base leading-none">💳</span>
                    <span>Express Dashboard</span>
                  </>
                )}
              </button>
            )}

            <button
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 px-5 rounded-xl text-[14px] font-bold transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed whitespace-nowrap shadow-sm active:scale-[0.98]"
              onClick={() => syncClearanceMutation.mutate()}
              disabled={syncClearanceMutation.isPending}
              title="Sync all mature completed orders into your available balance"
            >
              {syncClearanceMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin inline-block" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span className="text-base leading-none">🔄</span>
                  <span>Sync Cleared Funds</span>
                  {readyToSync > 0 && (
                    <span className="ml-1 bg-brand-green text-brand-black text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                      ${readyToSync.toFixed(2)} ready
                    </span>
                  )}
                </>
              )}
            </button>
            <button
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-brand-green hover:brightness-95 text-white py-3 px-6 rounded-xl text-[14px] font-bold transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed whitespace-nowrap shadow-sm active:scale-[0.98]"
              onClick={() => setShowPayoutModal(true)}
              disabled={availableBalance <= 0}
            >
              <span className="text-base leading-none">💸</span>
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
            <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 bg-emerald-50">💰</div>
            <div>
              <span className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Net Income</span>
              <h2 className="text-[28px] font-extrabold text-slate-900 m-0 mb-1">
                {netIncome.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h2>
              <p className="text-[12.5px] text-slate-400 m-0">
                {summary.completedOrdersCount !== undefined ? `${summary.completedOrdersCount} completed orders` : `${completedOrders.length} completed orders`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
            <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 bg-amber-50">⏳</div>
            <div>
              <span className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Awaiting Clearance</span>
              <h2 className="text-[28px] font-extrabold text-slate-900 m-0 mb-1">
                {awaitingClearance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h2>
              <p className="text-[12.5px] text-slate-400 m-0">
                {summary.unclearedOrdersCount !== undefined ? `${summary.unclearedOrdersCount} order(s) pending clearance` : `${unclearedOrders.length} order(s) pending clearance`}
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
            <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0 bg-blue-50">🏦</div>
            <div>
              <span className="text-[12.5px] font-bold text-emerald-800 uppercase tracking-wide block mb-1.5">Available Balance</span>
              <h2 className="text-[28px] font-extrabold text-emerald-700 m-0 mb-1">
                {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h2>
              <p className="text-[12.5px] text-slate-500 m-0">
                Ready to withdraw
                {readyToSync > 0 && ` • $${readyToSync.toFixed(2)} ready to sync`}
              </p>
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
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => {
                    const sc = statusColor(p.status);
                    return (
                      <tr key={p._id || p.id}>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-600 whitespace-nowrap">{moment(p.createdAt).format("MMM DD, YYYY")}</td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-[15px] font-bold text-emerald-700">
                          {p.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
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
          <div className="p-5 md:px-7 md:py-5 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Financial Statement History</h2>
              <p className="text-[13.5px] text-slate-500">Complete transaction ledger and clearance schedule for all your orders</p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[950px]">
              <thead>
                <tr>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Date</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Order Reference</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Description</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Gross Price</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Net Earnings</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Clearance Date</th>
                  <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Clearance Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-12 text-slate-400 font-medium">
                      No financial transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => {
                    const gross = Number(order.grossPrice ?? order.price ?? 0);
                    const net = Number(
                      order.netEarnings !== undefined
                        ? order.netEarnings
                        : (order.grossPrice ? order.grossPrice - (order.platformFee || 0) : order.price || 0)
                    );
                    const orderRef = order.orderNumber || (order._id || order.id ? `#${(order._id || order.id).slice(-8)}` : "—");

                    return (
                      <tr key={order._id || order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-600 whitespace-nowrap">
                          {moment(order.createdAt).format("MMM DD, YYYY")}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-[12px] font-mono font-semibold text-slate-700 whitespace-nowrap">
                          {orderRef}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-800 min-w-[260px]">
                          {order.title}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {gross.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-[15px] font-bold text-emerald-700 whitespace-nowrap">
                          +{net.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm text-slate-600 whitespace-nowrap">
                          {order.clearedAt ? (
                            <span className="font-medium text-emerald-700" title="Date cleared into wallet">
                              {moment(order.clearedAt).format("MMM DD, YYYY")}
                            </span>
                          ) : order.clearsAt ? (
                            <span className="font-medium text-slate-700" title="Scheduled clearance date">
                              {moment(order.clearsAt).format("MMM DD, YYYY")}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm whitespace-nowrap">
                          {order.isCleared ? (
                            <span className="text-[11px] font-bold py-1 px-3 rounded-full uppercase tracking-wide inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Cleared
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold py-1 px-3 rounded-full uppercase tracking-wide inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending
                            </span>
                          )}
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

      {/* ── Payout Request Modal ── */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200" onClick={() => setShowPayoutModal(false)}>
          <div className="bg-white w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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



              <p className="text-[12.5px] text-slate-400 bg-slate-50 rounded-lg py-2.5 px-3.5 m-0 leading-relaxed">
                ⚡ Payout requests are reviewed and processed within 2–3 business days. You will be notified when the status changes.
              </p>

              <div className="flex gap-2.5 mt-2">
                <button type="submit" disabled={payoutMutation.isPending} className="flex-1 py-3 px-4 bg-brand-green hover:brightness-95 text-white rounded-xl text-sm font-bold transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xs">
                  {payoutMutation.isPending ? "Submitting..." : "Submit Request"}
                </button>
                <button type="button" className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all hover:bg-slate-200 shadow-xs" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KYC Required 403 Interceptor Modal ── */}
      <KycRequiredModal
        isOpen={showKycRequiredModal}
        onClose={() => setShowKycRequiredModal(false)}
        title="Identity Verification Required"
        description="To withdraw your earnings, you must complete a one-time identity verification."
      />
    </div>
  );
};

export default function EarningsPage() {
  return (
    <PrivateRoute>
      <Suspense fallback={<div className="loader-container min-h-[80vh] flex items-center justify-center"><Loader size={50} /></div>}>
        <Earnings />
      </Suspense>
    </PrivateRoute>
  );
}


