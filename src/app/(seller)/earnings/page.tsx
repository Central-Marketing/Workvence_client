"use client";
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import { Loader, KycRequiredModal, PayoneerLogo, PayoneerIcon, Button } from "@/components";
import { FaStripe } from "react-icons/fa";
import moment from "moment";
import toast from "react-hot-toast";
import {
  Home,
  RefreshCw,
  Calendar as CalendarIcon,
  Search,
  ArrowUpRight,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";

type EarningsTab = "payout" | "clearance";

// Minimum payout request threshold ($25 USD)
const MIN_PAYOUT_AMOUNT = 25;

const Earnings = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<EarningsTab>("payout");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "payoneer">("stripe");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Statement query (Orders and Summary)
  const { isLoading, error, data: statementData } = useQuery({
    queryKey: ["seller-earnings-statement"],
    queryFn: () =>
      axiosFetch.get("/earnings/statement").then(({ data }) => data).catch(() => ({ orders: [], summary: {} })),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Payouts history query
  const { data: payoutsData = [] } = useQuery({
    queryKey: ["my-payouts"],
    queryFn: () =>
      axiosFetch.get("/payouts").then(({ data }) => data).catch(() => []),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Unified Payout Status Query (GET /api/payouts/status)
  const { data: payoutStatus } = useQuery({
    queryKey: ["payouts-status"],
    queryFn: () =>
      axiosFetch
        .get("/payouts/status")
        .then(({ data }) => data)
        .catch(async () => {
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
          } catch {
            return null;
          }
        }),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Readiness & Connection states
  const isStripeConnected = Boolean(
    payoutStatus?.stripe?.isConnected ||
    payoutStatus?.stripe?.connected ||
    Boolean(payoutStatus?.stripe?.accountId) ||
    payoutStatus?.availableMethods?.includes("stripe")
  );

  const isStripeReady = Boolean(
    isStripeConnected &&
    (payoutStatus?.stripe?.payoutsEnabled !== false)
  );

  const isPayoneerConnected = Boolean(
    payoutStatus?.payoneer?.isConnected ||
    payoutStatus?.payoneer?.connected ||
    payoutStatus?.payoneer?.canPayout ||
    payoutStatus?.payoneer?.status === "ACTIVE" ||
    payoutStatus?.availableMethods?.includes("payoneer") ||
    Boolean(payoutStatus?.payoneer?.payeeId)
  );

  const isPayoneerReady = Boolean(
    isPayoneerConnected &&
    (payoutStatus?.payoneer?.canPayout !== false) &&
    (payoutStatus?.payoneer?.status !== "INACTIVE")
  );

  const availableMethods: string[] = Array.from(
    new Set([
      ...(payoutStatus?.availableMethods || []),
      ...(isStripeReady ? ["stripe"] : []),
      ...(isPayoneerReady ? ["payoneer"] : []),
    ])
  );

  const hasAnyConnected = isStripeConnected || isPayoneerConnected;

  // Auto-set selected method when opening modal
  useEffect(() => {
    if (isStripeReady && !isPayoneerReady) {
      setSelectedMethod("stripe");
    } else if (isPayoneerReady && !isStripeReady) {
      setSelectedMethod("payoneer");
    } else if (isStripeReady) {
      setSelectedMethod("stripe");
    } else if (isPayoneerReady) {
      setSelectedMethod("payoneer");
    }
  }, [payoutStatus, showPayoutModal, isStripeReady, isPayoneerReady]);

  // Handle returning redirects back from Stripe or Payoneer onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const connectParam = urlParams.get("connect");
    const stripeParam = urlParams.get("stripe");
    const payoneerParam = urlParams.get("payoneer");

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
  }, [queryClient, router]);

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
    mutationFn: (payload: { amount: number; payoutMethod?: string }) => axiosFetch.post("/payouts", payload),
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

  if (isLoading) {
    return (
      <div className="loader-container min-h-[70vh] flex items-center justify-center">
        <Loader size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container p-12 text-center text-red-500 font-bold">
        Something went wrong fetching statement!
      </div>
    );
  }

  // Extract orders and summary
  const orders: any[] = Array.isArray(statementData)
    ? statementData
    : statementData?.orders || [];

  const summary = statementData?.summary || {};

  const payouts: any[] = (statementData?.payouts && statementData.payouts.length > 0)
    ? statementData.payouts
    : Array.isArray(payoutsData)
      ? payoutsData
      : payoutsData?.payouts || [];

  const completedOrders = orders.filter((o: any) => o.status === "completed" || o.isCompleted);
  const clearedOrders = orders.filter((o: any) => o.isCleared === true);
  const unclearedOrders = orders.filter((o: any) => !o.isCleared);

  // Net Income
  const netIncome =
    summary.lifetimeTotalIncome !== undefined
      ? Number(summary.lifetimeTotalIncome)
      : summary.clearedIncome !== undefined
        ? Number(summary.clearedIncome)
        : completedOrders.reduce((acc: number, curr: any) => {
          const net =
            curr.netEarnings !== undefined
              ? curr.netEarnings
              : curr.grossPrice
                ? curr.grossPrice - (curr.platformFee || 0)
                : curr.price || 0;
          return acc + (Number(net) || 0);
        }, 0);

  // Awaiting Clearance
  const awaitingClearance =
    summary.awaitingClearance !== undefined
      ? Number(summary.awaitingClearance)
      : unclearedOrders.reduce((acc: number, curr: any) => {
        const net =
          curr.netEarnings !== undefined
            ? curr.netEarnings
            : curr.grossPrice
              ? curr.grossPrice - (curr.platformFee || 0)
              : curr.price || 0;
        return acc + (Number(net) || 0);
      }, 0);

  // Available Balance
  const totalRequested = payouts
    .filter((p: any) => p.status === "pending" || p.status === "approved")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const availableBalance =
    summary.availableBalance !== undefined
      ? Number(summary.availableBalance)
      : user?.earningsBalance !== undefined
        ? Number(user.earningsBalance)
        : Math.max(netIncome - totalRequested, 0);

  const readyToSync = summary?.readyToSyncAmount ? Number(summary.readyToSyncAmount) : 0;

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || isNaN(amt) || amt < MIN_PAYOUT_AMOUNT) {
      toast.error(`Minimum payout request amount is $${MIN_PAYOUT_AMOUNT}.00.`);
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
      payoutMethod: selectedMethod,
    });
  };

  // CSV Exporter for Order Clearance
  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      toast.error("No orders to export");
      return;
    }
    const headers = ["Date", "Order ID", "Gross Price", "Net Earnings", "Clearance Date", "Status"];
    const rows = orders.map((o: any) => [
      moment(o.createdAt).format("YYYY-MM-DD"),
      o.orderNumber || (o._id ? `#${o._id.slice(-8).toUpperCase()}` : "—"),
      Number(o.grossPrice ?? o.price ?? 0).toFixed(2),
      Number(
        o.netEarnings !== undefined
          ? o.netEarnings
          : o.grossPrice
            ? o.grossPrice - (o.platformFee || 0)
            : o.price || 0
      ).toFixed(2),
      o.clearedAt
        ? moment(o.clearedAt).format("YYYY-MM-DD")
        : o.clearsAt
          ? moment(o.clearsAt).format("YYYY-MM-DD")
          : "Pending",
      o.isCleared ? "Cleared" : o.status === "cancelled" ? "Failed" : "Pending",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `order-clearance-${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to CSV!");
  };

  // Search filtering for payouts
  const filteredPayouts = payouts.filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const dateStr = moment(p.createdAt).format("DD MMM, YYYY").toLowerCase();
    const amountStr = String(p.amount);
    const methodStr = String(p.method || p.provider || "").toLowerCase();
    const statusStr = String(p.status || "").toLowerCase();
    return (
      dateStr.includes(q) ||
      amountStr.includes(q) ||
      methodStr.includes(q) ||
      statusStr.includes(q)
    );
  });

  // Search filtering for orders
  const filteredOrders = orders.filter((o: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const dateStr = moment(o.createdAt).format("DD MMM, YYYY").toLowerCase();
    const orderRef = (o.orderNumber || (o._id ? `#${o._id.slice(-8)}` : "")).toLowerCase();
    const grossStr = String(o.grossPrice ?? o.price ?? "");
    const statusStr = (o.isCleared ? "cleared" : o.status || "").toLowerCase();
    return (
      dateStr.includes(q) ||
      orderRef.includes(q) ||
      grossStr.includes(q) ||
      statusStr.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-7">

        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600 flex items-center">
            <Home className="w-3.5 h-3.5 text-[#0D6D5F]" />
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Earnings</span>
          <span>/</span>
          <span className="text-gray-400 capitalize">
            {activeTab === "payout" ? "Payout" : "Order Clearance"}
          </span>
        </div>

        {/* 2. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-[10px]">
            <h1 className="text-[28px]
  sm:text-[30px]
  md:text-[36px]
  lg:text-[40px]
  xl:text-[44px]
  2xl:text-[48px]
  font-normal
  font-sf-pro
  leading-none
  tracking-normal
  text-[#292929]">
              My Earnings
            </h1>
            <p className="text-[14px]
  sm:text-[14px]
  md:text-[15px]
  lg:text-[16px]
  font-normal
  font-inter
  leading-[22px]
  tracking-normal
  text-[#6E6E6E]">
              Track your income, awaiting clearance and multi channel payout
            </p>
          </div>

          {/* Action Buttons: Sync funds, Connect Wallet, Request Payout */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            <Button
              type="button"
              onClick={() => syncClearanceMutation.mutate()}
              disabled={syncClearanceMutation.isPending}
              variant="outline"
              size="md"
              radius="fiverr"
              className="bg-[rgb(239_252_250_/_50%)] hover:bg-gray-50 border border-black/10 text-gray-800 shadow-2xs"
              title="Sync mature completed orders into your available balance"
              leftIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`w-3.5 h-3.5 shrink-0 ${syncClearanceMutation.isPending ? "animate-spin text-gray-500" : "text-[#292929]"
                    }`}
                >
                  <path
                    d="M16.5 8H18C19.4142 8 20.1213 8 20.5607 7.56066C21 7.12132 21 6.41421 21 5V3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 12C3 7.02943 7.0293 3 12 3C15.571 3 18.0948 4.73053 20 7.08371M21 12C21 16.9705 16.9707 21 12 21C8.42904 21 5.90524 19.2694 4 16.9162"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 16H6C4.58579 16 3.87868 16 3.43934 16.4393C3 16.8786 3 17.5857 3 19V20.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              <span>{syncClearanceMutation.isPending ? "Syncing..." : "Sync funds"}</span>
              {readyToSync > 0 && !syncClearanceMutation.isPending && (
                <span className="ml-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  ${readyToSync.toFixed(2)}
                </span>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => setShowWalletModal(true)}
              variant="soft"
              size="md"
              radius="fiverr"
              className="bg-[#F1F3F5] hover:bg-gray-200 text-gray-800 shadow-2xs"
              leftIcon={
                hasAnyConnected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                ) : undefined
              }
            >
              {hasAnyConnected ? "Payout Channels" : "Connect Wallet"}
            </Button>

            <Button
              type="button"
              onClick={() => {
                if (!hasAnyConnected) {
                  setShowWalletModal(true);
                  toast("Please connect Stripe or Payoneer before withdrawing funds.", { icon: "💳" });
                } else if (availableBalance < MIN_PAYOUT_AMOUNT) {
                  toast.error(`Minimum payout request amount is $${MIN_PAYOUT_AMOUNT}.00. Your available balance is $${availableBalance.toFixed(2)}.`);
                } else {
                  setShowPayoutModal(true);
                }
              }}
              disabled={availableBalance <= 0}
              variant="dark"
              size="md"
              radius="fiverr"
            >
              Request Payout
            </Button>
          </div>
        </div>

        {/* 3. Stat Cards: Next Income, Awaiting Clearance, Available Balance */}
        <div className="bg-white rounded-[10px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Next Income */}
            <div className="p-6">
              <span className="text-sm md:text-[15px] lg:text-[16px] font-bold font-sf-pro leading-none text-[#6E6E6E] block">
                Next Income
              </span>
              <h3 className="text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight leading-none mt-[10px] mb-[30px]">
                {netIncome.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h3>
              <p className="text-xs text-gray-400">
                Cleared earning from{" "}
                <strong className="text-gray-700 font-semibold">
                  {summary.completedOrdersCount !== undefined
                    ? summary.completedOrdersCount
                    : completedOrders.length}
                </strong>{" "}
                packages
              </p>
            </div>

            {/* Awaiting Clearance */}
            <div className="p-6">
              <span className="text-sm md:text-[15px] lg:text-[16px] font-bold font-sf-pro leading-none text-[#6E6E6E] block">
                Awaiting Clearance
              </span>
              <h3 className="text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight leading-none mt-[10px] mb-[30px]">
                {awaitingClearance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h3>
              <p className="text-xs text-gray-400">Currently in progress</p>
            </div>

            {/* Available Balance */}
            <div className="p-6">
              <span className="text-sm md:text-[15px] lg:text-[16px] font-bold font-sf-pro leading-none text-[#6E6E6E] block">
                Available Balance
              </span>
              <h3 className="text-2xl sm:text-[30px] font-bold text-gray-950 tracking-tight leading-none mt-[10px] mb-[30px]">
                {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </h3>
              <p className="text-xs text-gray-400">
                Ready to withdraw
                {readyToSync > 0 && ` • $${readyToSync.toFixed(2)} ready to sync`}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Tab Navigation Pills */}
        <div className="bg-[#F1F3F5] rounded-xl p-1 inline-flex items-center gap-1 shadow-2xs">
          <Button
            type="button"
            onClick={() => setActiveTab("payout")}
            size="sm"
            radius="fiverr"
            variant={activeTab === "payout" ? "brand" : "ghost"}
            className={
              activeTab === "payout"
                ? "bg-[#0B3A33] hover:bg-[#0B3A33] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            Payout Request
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab("clearance")}
            size="sm"
            radius="fiverr"
            variant={activeTab === "clearance" ? "brand" : "ghost"}
            className={
              activeTab === "clearance"
                ? "bg-[#0B3A33] hover:bg-[#0B3A33] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            Order Clearance
          </Button>
        </div>

        {/* 5. Main Card for Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">

          {/* Tab Header with Search & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              {activeTab === "payout" ? "Payout Request" : "Order Clearance"}
            </h2>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Calendar Filter Icon */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                radius="lg"
                className="w-9 h-9 border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 shrink-0"
                title="Filter by date"
                icon={<CalendarIcon className="w-4 h-4" />}
              />

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for"
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Export CSV (Visible on Order Clearance tab) */}
              {activeTab === "clearance" && (
                <Button
                  type="button"
                  onClick={handleExportCSV}
                  variant="dark"
                  size="sm"
                  radius="fiverr"
                  className="shrink-0"
                >
                  Export CSV
                </Button>
              )}
            </div>
          </div>

          {/* TAB 1: Payout Request Table */}
          {activeTab === "payout" && (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Date</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Payment Menthod</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Amount</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/90">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-gray-400">
                        No payout requests recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p: any) => {
                      const method = (p.payoutMethod || p.method || p.provider || "stripe").toLowerCase();
                      const isPayoneer = method === "payoneer";
                      const status = (p.status || "pending").toLowerCase();

                      return (
                        <tr key={p._id || p.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-4 text-xs sm:text-[13px] font-medium text-gray-700 whitespace-nowrap">
                            {moment(p.createdAt).format("DD MMM, YYYY")}
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            {isPayoneer ? (
                              <PayoneerLogo className="h-5" />
                            ) : (
                              <div className="flex items-center">
                                <FaStripe size={36} className="text-[#635bff]" />
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-[13px] font-bold text-gray-900 whitespace-nowrap">
                            {Number(p.amount).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            {status === "approved" || status === "processed" || status === "cleared" ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E6F7F3] text-[#0D6D5F]">
                                Approved
                              </span>
                            ) : status === "rejected" || status === "failed" ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FDE8E8] text-[#E02424]">
                                Reject
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF6E7] text-[#D97706]">
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
          )}

          {/* TAB 2: Order Clearance Table */}
          {activeTab === "clearance" && (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Date</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Order Id</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Gross Price</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Net Earning</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Clearance Date</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/90">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-gray-400">
                        No financial orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order: any) => {
                      const gross = Number(order.grossPrice ?? order.price ?? 0);
                      const net = Number(
                        order.netEarnings !== undefined
                          ? order.netEarnings
                          : order.grossPrice
                            ? order.grossPrice - (order.platformFee || 0)
                            : order.price || 0
                      );
                      const orderRef =
                        order.orderNumber ||
                        (order._id ? `#${order._id.slice(-8).toUpperCase()}` : "—");
                      const clearanceDate = order.clearedAt
                        ? moment(order.clearedAt).format("DD MMM, YYYY")
                        : order.clearsAt
                          ? moment(order.clearsAt).format("DD MMM, YYYY")
                          : "14 days from delivery";

                      const isFailed = order.status === "cancelled" || order.status === "failed";
                      const isCleared = order.isCleared === true;

                      return (
                        <tr key={order._id || order.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-4 text-xs sm:text-[13px] font-medium text-gray-700 whitespace-nowrap">
                            {moment(order.createdAt).format("DD MMM, YYYY")}
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-[13px] font-mono text-gray-800 whitespace-nowrap">
                            {orderRef}
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-[13px] font-semibold text-gray-800 whitespace-nowrap">
                            {gross.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-[13px] font-bold text-[#0D6D5F] whitespace-nowrap">
                            +{net.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-[13px] text-gray-700 whitespace-nowrap">
                            {clearanceDate}
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            {isCleared ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E6F7F3] text-[#0D6D5F]">
                                Cleared
                              </span>
                            ) : isFailed ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FDE8E8] text-[#E02424]">
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF6E7] text-[#D97706]">
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
          )}

        </div>

      </div>

      {/* ── MODAL 1: Payout Channel (Image 3) ── */}
      {showWalletModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-white w-full max-w-[480px] sm:max-w-[500px] rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-950">Payout Channel</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                className="text-gray-400 hover:text-gray-700 w-8 h-8 min-h-[32px] p-0"
                onClick={() => setShowWalletModal(false)}
                icon={<X className="w-5 h-5" />}
              />
            </div>

            {/* Channels List */}
            <div className="space-y-3.5">
              {/* Stripe Option */}
              {isStripeConnected ? (
                <div
                  onClick={() => connectDashboardMutation.mutate()}
                  className="bg-[#F7F4FF] hover:bg-[#F2EDFF] border border-purple-200/90 rounded-2xl p-4 sm:p-5 flex items-start justify-between cursor-pointer transition-all group shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="flex items-center gap-2.5">
                      <FaStripe size={38} className="text-[#635bff]" />
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Connected
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">
                        Stripe Dashboard
                      </h4>
                      {payoutStatus?.stripe?.accountId && (
                        <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                          Account: {payoutStatus.stripe.accountId}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Access your Stripe Express dashboard to manage payouts, bank accounts, and view transfer history.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#635bff] group-hover:translate-x-0.5 transition-transform pt-1">
                    <span>{connectDashboardMutation.isPending ? "Opening..." : "Open"}</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => connectOnboardMutation.mutate()}
                  className="bg-[#F7F4FF] hover:bg-[#F2EDFF] border border-purple-100 rounded-2xl p-4 sm:p-5 flex items-start justify-between cursor-pointer transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <FaStripe size={36} className="text-[#635bff]" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-950 pt-0.5">Stripe Connect</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Direct automated bank account deposits & card payouts
                    </p>
                  </div>
                  <div className="shrink-0 text-[#635bff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform pt-1">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              )}

              {/* Payoneer Option */}
              {isPayoneerConnected ? (
                <div
                  onClick={() => {
                    toast.success("Payoneer is connected and ready for payouts!");
                  }}
                  className="bg-[#FAFCFB] border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start justify-between transition-all shadow-2xs cursor-default"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="flex items-center gap-2.5">
                      <PayoneerLogo className="h-6" />
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Connected
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">
                        Payoneer Connected
                      </h4>
                      {payoutStatus?.payoneer?.email && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Linked email: {payoutStatus.payoneer.email}
                        </p>
                      )}
                      {payoutStatus?.payoneer?.payeeId && (
                        <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                          Payee ID: {payoutStatus.payoneer.payeeId}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your Payoneer account is linked and ready to receive withdrawals.
                    </p>
                  </div>
                  <div className="shrink-0 text-emerald-600 pt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => payoneerOnboardMutation.mutate()}
                  className="bg-[#FAFCFB] hover:bg-[#F4F9F7] border border-gray-100 rounded-2xl p-4 sm:p-5 flex items-start justify-between cursor-pointer transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <PayoneerLogo className="h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-950 pt-0.5">Payoneer</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Global bank transfer and payoneer balance transfer
                    </p>
                  </div>
                  <div className="shrink-0 text-teal-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform pt-1">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Request Balance Payout (Image 4) ── */}
      {showPayoutModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setShowPayoutModal(false)}
        >
          <div
            className="bg-white w-full max-w-[480px] sm:max-w-[500px] rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-950">Request Balance Payout</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                className="text-gray-400 hover:text-gray-700 w-8 h-8 min-h-[32px] p-0"
                onClick={() => setShowPayoutModal(false)}
                icon={<X className="w-5 h-5" />}
              />
            </div>

            {/* Available Balance Box */}
            <div className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between bg-white shadow-2xs">
              <div>
                <span className="text-xs sm:text-sm font-bold text-gray-950 block">Available Balance</span>
                <span className="text-xs text-gray-400">Clear and ready for withdraw</span>
              </div>
              <strong className="text-base sm:text-lg font-bold text-[#0D6D5F]">
                {availableBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </strong>
            </div>

            {/* Channels Selectable */}
            <div className="space-y-3">
              {/* Stripe Option */}
              <div
                onClick={() => {
                  if (isStripeReady) {
                    setSelectedMethod("stripe");
                  } else {
                    toast.error("Please connect Stripe in Payout Channels first.");
                  }
                }}
                className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${selectedMethod === "stripe"
                  ? "bg-[#F7F4FF] border-2 border-[#635bff] shadow-2xs"
                  : "bg-white border border-gray-200 hover:border-gray-300"
                  } ${!isStripeReady ? "opacity-60" : ""}`}
              >
                <div className="space-y-1 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <FaStripe size={36} className="text-[#635bff]" />
                    {isStripeConnected ? (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-950">
                    {isStripeConnected ? "Stripe Dashboard" : "Stripe Connect"}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Direct automated bank account deposits & card payouts
                  </p>
                </div>
                <div className="shrink-0 pl-3">
                  {selectedMethod === "stripe" ? (
                    <CheckCircle2 className="w-5 h-5 text-[#635bff]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>

              {/* Payoneer Option */}
              <div
                onClick={() => {
                  if (isPayoneerReady) {
                    setSelectedMethod("payoneer");
                  } else {
                    toast.error("Please connect Payoneer in Payout Channels first.");
                  }
                }}
                className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${selectedMethod === "payoneer"
                  ? "bg-[#F4F9F7] border-2 border-[#327C73] shadow-2xs"
                  : "bg-white border border-gray-200 hover:border-gray-300"
                  } ${!isPayoneerReady ? "opacity-60" : ""}`}
              >
                <div className="space-y-1 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <PayoneerLogo className="h-6" />
                    {isPayoneerConnected ? (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-950">
                    {isPayoneerConnected ? "Payoneer Connected" : "Payoneer"}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Global bank transfer and payoneer balance transfer
                  </p>
                </div>
                <div className="shrink-0 pl-3">
                  {selectedMethod === "payoneer" ? (
                    <CheckCircle2 className="w-5 h-5 text-[#327C73]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Amount to withdraw Input */}
            <form onSubmit={handlePayoutSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Amount to withdraw in <strong className="text-gray-900">USD</strong>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Button
                      type="button"
                      variant="soft"
                      size="xs"
                      radius="md"
                      onClick={() => setPayoutAmount(String(MIN_PAYOUT_AMOUNT))}
                      className="!px-2 !py-0.5 !min-h-0 !h-auto text-[11px] font-medium"
                    >
                      Min (${MIN_PAYOUT_AMOUNT})
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="xs"
                      radius="md"
                      onClick={() => setPayoutAmount(availableBalance.toFixed(2))}
                      className="!px-2 !py-0.5 !min-h-0 !h-auto text-[11px] font-medium !bg-emerald-50 hover:!bg-emerald-100 !text-emerald-700 !border-transparent shadow-none"
                    >
                      All (${availableBalance.toFixed(2)})
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs sm:text-sm">$</span>
                  <input
                    type="number"
                    min={MIN_PAYOUT_AMOUNT}
                    max={availableBalance}
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder={`Min $${MIN_PAYOUT_AMOUNT}.00`}
                    className="w-full bg-[#F4F5F7] border border-transparent focus:border-[#327C73] focus:bg-white rounded-xl pl-7 pr-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition-all font-medium"
                    required
                  />
                </div>

                {/* Validation message and min requirement note */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-gray-500">
                    Minimum request: <strong className="text-gray-800 font-semibold">${MIN_PAYOUT_AMOUNT}.00</strong>
                  </span>
                  {payoutAmount && Number(payoutAmount) > 0 && Number(payoutAmount) < MIN_PAYOUT_AMOUNT && (
                    <span className="text-rose-600 font-medium">
                      Must be at least ${MIN_PAYOUT_AMOUNT}.00
                    </span>
                  )}
                  {payoutAmount && Number(payoutAmount) > availableBalance && (
                    <span className="text-rose-600 font-medium">
                      Exceeds available balance
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Cancel Request, Submit Payout Request */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  variant="soft"
                  size="md"
                  radius="fiverr"
                  className="flex-1"
                >
                  Cancel Request
                </Button>
                <Button
                  type="submit"
                  disabled={
                    payoutMutation.isPending ||
                    !payoutAmount ||
                    Number(payoutAmount) < MIN_PAYOUT_AMOUNT ||
                    Number(payoutAmount) > availableBalance
                  }
                  isLoading={payoutMutation.isPending}
                  variant="brand"
                  size="md"
                  radius="fiverr"
                  rightIcon={<span>→</span>}
                  className="flex-1"
                >
                  Submit Payout Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KYC Required Modal ── */}
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
    <Suspense
      fallback={
        <div className="loader-container min-h-[80vh] flex items-center justify-center">
          <Loader size={50} />
        </div>
      }
    >
      <Earnings />
    </Suspense>
  );
}
