"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { Loader, KycRequiredModal, StripeLogo, StripeIcon, PayoneerLogo, PayoneerIcon } from "@/components";
import { FaStripe } from "react-icons/fa";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import moment from "moment";
import toast from "react-hot-toast";
import {
  Wallet,
  CreditCard,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const Earnings = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "payoneer">("stripe");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Statement query
  const { isLoading, error, data: statementData } = useQuery({
    queryKey: ["seller-earnings-statement"],
    queryFn: () =>
      axiosFetch.get("/earnings/statement").then(({ data }) => data).catch(() => ({ orders: [], summary: {} })),
  });

  // Payouts history query
  const { data: payoutsData = [] } = useQuery({
    queryKey: ["my-payouts"],
    queryFn: () =>
      axiosFetch.get("/payouts").then(({ data }) => data).catch(() => []),
  });

  // Unified Payout Status Query (GET /api/payouts/status)
  const { data: payoutStatus } = useQuery({
    queryKey: ["payouts-status"],
    queryFn: () =>
      axiosFetch
        .get("/payouts/status")
        .then(({ data }) => data)
        .catch(async () => {
          // Fallback to legacy endpoint if /payouts/status is not yet deployed
          try {
            const fallback = await axiosFetch.get("/payouts/connect/status");
            return {
              error: false,
              availableMethods: fallback.data?.payoutsEnabled ? ["stripe"] : [],
              stripe: {
                isConnected: Boolean(fallback.data?.stripeConnectAccountId),
                payoutsEnabled: Boolean(fallback.data?.payoutsEnabled),
                accountId: fallback.data?.stripeConnectAccountId || null,
              },
              payoneer: {
                isConnected: false,
                status: "INACTIVE",
                canPayout: false,
                payeeId: null,
              },
            };
          } catch (e) {
            return null;
          }
        }),
  });

  // Derived readiness states from exact schema
  const isStripeReady = Boolean(
    payoutStatus?.stripe?.payoutsEnabled && payoutStatus?.stripe?.isConnected
  );
  const isPayoneerReady = Boolean(
    payoutStatus?.payoneer?.canPayout && payoutStatus?.payoneer?.isConnected
  );

  const availableMethods: string[] = Array.from(
    new Set([
      ...(payoutStatus?.availableMethods || []),
      ...(isStripeReady ? ["stripe"] : []),
      ...(isPayoneerReady ? ["payoneer"] : []),
    ])
  );

  const hasAnyConnected = isStripeReady || isPayoneerReady;

  // Auto-set selected method when opening modal
  useEffect(() => {
    if (availableMethods.includes("stripe") && !availableMethods.includes("payoneer")) {
      setSelectedMethod("stripe");
    } else if (availableMethods.includes("payoneer") && !availableMethods.includes("stripe")) {
      setSelectedMethod("payoneer");
    } else if (availableMethods.includes("stripe")) {
      setSelectedMethod("stripe");
    } else if (availableMethods.includes("payoneer")) {
      setSelectedMethod("payoneer");
    }
  }, [payoutStatus, showPayoutModal]);

  // Handle returning redirects back from Stripe or Payoneer onboarding
  useEffect(() => {
    const connectParam = searchParams?.get("connect");
    const stripeParam = searchParams?.get("stripe");
    const payoneerParam = searchParams?.get("payoneer");

    if (connectParam === "success" || stripeParam === "success") {
      toast.success("Stripe account successfully connected for payouts!");
      queryClient.invalidateQueries({ queryKey: ["payouts-status"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      router.replace("/earnings");
    } else if (payoneerParam === "success") {
      toast.success("Payoneer account successfully connected for payouts!");
      queryClient.invalidateQueries({ queryKey: ["payouts-status"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      router.replace("/earnings");
    }
  }, [searchParams, queryClient, router]);

  // Stripe Onboarding Mutation
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

  // Stripe Express Dashboard Link Mutation
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

  // Payoneer Onboarding Mutation
  const payoneerOnboardMutation = useMutation({
    mutationFn: () => axiosFetch.post("/payouts/payoneer/onboard"),
    onSuccess: ({ data }) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to generate Payoneer onboarding link.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to initiate Payoneer onboarding.");
    },
  });

  // Payout Request Mutation
  const payoutMutation = useMutation({
    mutationFn: (payload: { amount: number; method?: string }) => axiosFetch.post("/payouts", payload),
    onSuccess: ({ data }) => {
      toast.success(data.message || "Payout request submitted!");
      setShowPayoutModal(false);
      setPayoutAmount("");
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-statement"] });
      queryClient.invalidateQueries({ queryKey: ["payouts-status"] });
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

  // Sync Mature Clearance Mutation
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

  if (isLoading) return <div className="loader-container min-h-[70vh] flex items-center justify-center"><Loader size={50} /></div>;
  if (error) return <div className="error-container p-12 text-center text-red-500 font-bold">Something went wrong fetching statement!</div>;

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

  // Net Income
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

  // Awaiting Clearance
  const awaitingClearance = summary.awaitingClearance !== undefined
    ? Number(summary.awaitingClearance)
    : unclearedOrders.reduce((acc: number, curr: any) => {
      const net = curr.netEarnings !== undefined
        ? curr.netEarnings
        : (curr.grossPrice ? curr.grossPrice - (curr.platformFee || 0) : curr.price || 0);
      return acc + (Number(net) || 0);
    }, 0);

  // Available Balance
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
    if (!availableMethods.includes(selectedMethod)) {
      toast.error(`Please select an active, verified payout method.`);
      return;
    }

    payoutMutation.mutate({
      amount: amt,
      method: selectedMethod,
    });
  };

  const statusColor = (s: string) => ({
    pending: { bg: "#fffbeb", color: "#d97706" },
    approved: { bg: "#ecfdf5", color: "#10b981" },
    processed: { bg: "#ecfdf5", color: "#10b981" },
    rejected: { bg: "#fef2f2", color: "#ef4444" },
  }[s?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b" });

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 flex justify-center font-sans">
      <div className="w-[95%] md:w-[90%] max-w-[1280px] flex flex-col gap-7 mx-auto">

        {/* ── Balance Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-[26px] font-extrabold text-slate-900 mb-1">Seller Earnings</h1>
            <p className="text-sm text-slate-500">Track your income, awaiting clearance, and request multi-channel payouts</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            {/* Connect Wallet / Manage Payout Accounts Button */}
            <button
              type="button"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 px-5 rounded-xl text-[14px] font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              onClick={() => setShowWalletModal(true)}
              title="Manage your Stripe Connect and Payoneer withdrawal channels"
            >
              <Wallet size={17} className="text-brand-green" />
              <span>Connect Wallet</span>
              {hasAnyConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 ml-1" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-100 ml-1" />
              )}
            </button>

            {/* Sync Clearance Button */}
            <button
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 px-5 rounded-xl text-[14px] font-bold transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed whitespace-nowrap shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
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
                  <RefreshCw size={15} />
                  <span>Sync Cleared Funds</span>
                  {readyToSync > 0 && (
                    <span className="ml-1 bg-brand-green text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                      ${readyToSync.toFixed(2)} ready
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Request Payout Button */}
            <button
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-[#389115] text-white py-3 px-6 rounded-xl text-[14px] font-bold transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              onClick={() => {
                if (!hasAnyConnected) {
                  setShowWalletModal(true);
                  toast("Please connect Stripe or Payoneer before withdrawing funds.", { icon: "💳" });
                } else {
                  setShowPayoutModal(true);
                }
              }}
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
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Payout Method</th>
                    <th className="py-3.5 px-6 text-slate-500 font-semibold text-[12.5px] uppercase border-b border-slate-100 bg-slate-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => {
                    const sc = statusColor(p.status);
                    const method = (p.method || p.provider || "stripe").toLowerCase();
                    const isPayoneer = method === "payoneer";

                    return (
                      <tr key={p._id || p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm font-medium text-slate-600 whitespace-nowrap">
                          {moment(p.createdAt).format("MMM DD, YYYY")}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-[15px] font-bold text-emerald-700">
                          {p.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="py-4 px-6 border-b border-slate-100 align-middle text-sm">
                          {isPayoneer ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0eb] text-[#ff4800] border border-[#ffd8cc]">
                              <PayoneerIcon className="w-4 h-4" />
                              <span>Payoneer</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f4f3ff] text-[#635bff] border border-[#e0ddff]">
                              <FaStripe size={26} className="text-[#635bff]" />
                              <span>Connect</span>
                            </span>
                          )}
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

      {/* ── Connect Wallet / Payout Methods Modal ── */}
      {showWalletModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-white w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-5 px-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-green">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0">Payout Channels</h3>
                  <p className="text-xs text-slate-500 m-0">Connect and manage your withdrawal accounts</p>
                </div>
              </div>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => setShowWalletModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Stripe Connect Card */}
              <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2 shrink-0">
                    <FaStripe size={32} className="text-[#635bff]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">Stripe Connect</h4>
                      {isStripeReady ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Connected & Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct automated bank account deposits & card payouts
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  {isStripeReady ? (
                    <button
                      type="button"
                      onClick={() => connectDashboardMutation.mutate()}
                      disabled={connectDashboardMutation.isPending}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {connectDashboardMutation.isPending ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <ExternalLink size={13} />
                      )}
                      Express Dashboard
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => connectOnboardMutation.mutate()}
                      disabled={connectOnboardMutation.isPending}
                      className="px-5 py-2.5 bg-brand-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {connectOnboardMutation.isPending ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>Connect Stripe</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Payoneer Card */}
              <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2.5 shrink-0">
                    <PayoneerIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <PayoneerLogo className="h-4.5 w-auto" />
                      {isPayoneerReady ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Connected & Ready
                        </span>
                      ) : payoutStatus?.payoneer?.status === "PENDING" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pending Activation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Global bank transfers & Payoneer balance transfers
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  {isPayoneerReady ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 size={14} /> Ready for Payouts
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => payoneerOnboardMutation.mutate()}
                      disabled={payoneerOnboardMutation.isPending}
                      className="px-5 py-2.5 bg-brand-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {payoneerOnboardMutation.isPending ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>Connect Payoneer</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Info Note */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
                <AlertCircle size={16} className="text-brand-green mt-0.5 shrink-0" />
                <span>
                  You can connect multiple payout methods and pick your preferred channel each time you submit a withdrawal request.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                onClick={() => setShowWalletModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Multi-Channel Payout Request Modal ── */}
      {showPayoutModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setShowPayoutModal(false)}
        >
          <div
            className="bg-white w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-4 px-6 border-b border-slate-100 bg-slate-50/70">
              <div>
                <h3 className="text-lg font-bold text-slate-900 m-0">Request Balance Payout</h3>
                <p className="text-xs text-slate-500 m-0">Withdraw your cleared funds to your bank or wallet</p>
              </div>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => setShowPayoutModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="p-6 flex flex-col gap-5">
              {/* Balance Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Available Balance</span>
                  <span className="text-xs text-emerald-600">Cleared & ready for withdrawal</span>
                </div>
                <strong className="text-2xl font-extrabold text-emerald-700">
                  {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </strong>
              </div>

              {/* Payout Method Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 block">
                  Select Payout Channel <span className="text-red-500">*</span>
                </label>

                {availableMethods.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <p className="text-xs font-semibold text-amber-900 mb-2">
                      No verified payout methods connected.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPayoutModal(false);
                        setShowWalletModal(true);
                      }}
                      className="px-4 py-2 bg-brand-green hover:bg-[#389115] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      Connect Stripe or Payoneer
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Stripe Option */}
                    <div
                      onClick={() => isStripeReady && setSelectedMethod("stripe")}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        !isStripeReady
                          ? "opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed"
                          : selectedMethod === "stripe"
                          ? "border-brand-green bg-emerald-50/50 shadow-xs ring-1 ring-brand-green cursor-pointer"
                          : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs shrink-0">
                          <FaStripe size={28} className="text-[#635bff]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Stripe Connect</p>
                          <p className="text-[10px] text-slate-500">
                            {isStripeReady ? "Direct Bank Deposit" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      {selectedMethod === "stripe" && isStripeReady && (
                        <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                      )}
                    </div>

                    {/* Payoneer Option */}
                    <div
                      onClick={() => isPayoneerReady && setSelectedMethod("payoneer")}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        !isPayoneerReady
                          ? "opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed"
                          : selectedMethod === "payoneer"
                          ? "border-brand-green bg-emerald-50/50 shadow-xs ring-1 ring-brand-green cursor-pointer"
                          : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
                          <PayoneerIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Payoneer</p>
                          <p className="text-[10px] text-slate-500">
                            {isPayoneerReady ? "Global Wallet" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      {selectedMethod === "payoneer" && isPayoneerReady && (
                        <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Amount to Withdraw (USD) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-brand-green bg-white shadow-2xs">
                  <span className="px-4 bg-slate-50 text-slate-600 font-bold text-base border-r border-slate-200 flex items-center h-[46px]">
                    $
                  </span>
                  <input
                    type="number"
                    className="border-none flex-1 p-3 text-sm text-slate-900 font-bold outline-none"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    min="1"
                    max={availableBalance}
                    step="0.01"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(availableBalance))}
                    className="px-3 py-1 mr-2 text-xs font-bold text-brand-green hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-slate-500 bg-slate-50 rounded-xl p-3.5 m-0 leading-relaxed border border-slate-100">
                ⚡ Payout requests are processed within 2–3 business days via your selected channel.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  onClick={() => setShowPayoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutMutation.isPending || availableMethods.length === 0}
                  className="flex-1 py-3 px-4 bg-brand-green hover:bg-[#389115] text-white rounded-xl text-xs font-bold transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
                >
                  {payoutMutation.isPending ? "Submitting..." : "Submit Payout Request"}
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
