"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import moment from "moment";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import adminAxios from "@/utils/adminAxios";
import { Loader, Button } from "@/components";

/* ═══════════════════════════════════════════
   KPI Cards Section
   ═══════════════════════════════════════════ */

const KPI_META = [
  { key: "gmv", borderGradient: "before:bg-gradient-to-r before:from-[#10b981] before:to-[#34d399]" },
  { key: "activeOrders", borderGradient: "before:bg-gradient-to-r before:from-[#3b82f6] before:to-[#60a5fa]" },
  { key: "newUsers", borderGradient: "before:bg-gradient-to-r before:from-[#8b5cf6] before:to-[#a78bfa]" },
  { key: "openDisputes", borderGradient: "before:bg-gradient-to-r before:from-[#ef4444] before:to-[#f87171]" },
];

function KPICards() {
  const { isLoading, data } = useQuery({
    queryKey: ["admin-kpi"],
    queryFn: () =>
      adminAxios.get("/analytics/kpi").then((res) => res.data?.data),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 min-[1101px]:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[12px] p-6 border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <div className="h-3.5 w-[60%] rounded bg-slate-100 animate-pulse" />
            <div className="h-8 w-[45%] rounded bg-slate-100 animate-pulse" />
            <div className="h-5 w-[30%] rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 min-[1101px]:grid-cols-4 gap-5">
      {KPI_META.map(({ key, borderGradient }) => {
        const kpi = data[key];
        if (!kpi) return null;
        const isPositive = kpi.change >= 0;

        return (
          <div
            key={key}
            className={`bg-white rounded-[12px] p-6 border border-[#e2e8f0] shadow-xs flex flex-col gap-2 transition-all duration-250 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[3px] before:rounded-t-[12px] ${borderGradient}`}
          >
            <span className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.5px]">
              {kpi.title}
            </span>
            <span className="text-[30px] font-extrabold text-[#0f172a] leading-[1.1]">
              {kpi.value}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-[3px] rounded-[6px] w-fit ${
                isPositive ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#ef4444]/10 text-[#ef4444]"
              }`}
            >
              <span className="text-[12px]">{isPositive ? "↑" : "↓"}</span>
              {Math.abs(kpi.change)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Revenue Trend Chart
   ═══════════════════════════════════════════ */

const PERIOD_OPTIONS = [
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
];

function RevenueTrendChart() {
  const [period, setPeriod] = useState("30d");

  const { isLoading, data: chartData = [] } = useQuery({
    queryKey: ["admin-revenue", period],
    queryFn: () =>
      adminAxios
        .get(`/analytics/revenue-trend?period=${period}`)
        .then((res) => res.data?.data ?? []),
  });

  return (
    <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xs p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[16px] font-bold text-[#0f172a]">Revenue Trend</h3>
        <div className="flex gap-1 bg-[#f1f5f9] rounded-[8px] p-[3px]">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant="ghost"
              size="xs"
              className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all duration-200 cursor-pointer !p-[6px_14px] !min-h-0 !h-auto ${
                period === opt.value
                  ? "!bg-white !text-[#0f172a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "!bg-transparent !text-[#64748b] hover:!text-[#334155]"
              }`}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full h-[280px] max-sm:h-[220px]">
        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Loader size={35} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "none",
                  borderRadius: 8,
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontWeight: 600,
                }}
                itemStyle={{ color: "#10b981" }}
                formatter={(val: any) => [
                  `$${Number(val || 0).toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 5, stroke: "#10b981", fill: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Order Breakdown Pie Chart
   ═══════════════════════════════════════════ */

function OrderBreakdownChart() {
  const { isLoading, data } = useQuery({
    queryKey: ["admin-order-breakdown"],
    queryFn: () =>
      adminAxios
        .get("/analytics/order-breakdown")
        .then((res) => res.data?.data),
  });

  const pieData = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xs p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[16px] font-bold text-[#0f172a]">Order Breakdown</h3>
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 220,
          }}
        >
          <Loader size={35} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  formatter={(val: any, name: any) => [Number(val || 0).toLocaleString(), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center mt-1 text-[13px] text-[#94a3b8]">
            Total Orders: <strong className="text-[#0f172a] text-[15px]">{total.toLocaleString()}</strong>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            {pieData.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2.5 text-[14px]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="flex-1 text-[#64748b] font-medium">{item.name}</span>
                <span className="font-bold text-[#0f172a]">
                  {item.value} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Pending Actions
   ═══════════════════════════════════════════ */

const ACTION_ICONS = {
  dispute: "⚖️",
  payout: "💰",
  ticket: "🎧",
};

function PendingActions() {
  const { isLoading, data } = useQuery({
    queryKey: ["admin-pending-actions"],
    queryFn: () =>
      adminAxios
        .get("/analytics/pending-actions")
        .then((res) => res.data?.data),
  });

  const summary = data?.summary;
  const actions = data?.actions ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white rounded-[12px] border border-[#e2e8f0]">
        <Loader size={35} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-bold text-[#0f172a]">Pending Actions</h2>
        {summary && (
          <div className="flex gap-2.5 flex-wrap">
            {summary.totalPendingDisputes > 0 && (
              <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#ef4444]/10 text-[#ef4444]">
                {summary.totalPendingDisputes} disputes
              </span>
            )}
            {summary.totalPendingPayoutsCount > 0 && (
              <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#10b981]/10 text-[#10b981]">
                {summary.totalPendingPayoutsCount} payouts
              </span>
            )}
            {summary.totalUnrespondedTickets > 0 && (
              <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#f97316]/10 text-[#f97316]">
                {summary.totalUnrespondedTickets} tickets
              </span>
            )}
          </div>
        )}
      </div>

      {actions.length === 0 ? (
        <div
          className="flex justify-center items-center min-h-[120px] bg-white rounded-[12px] border border-[#e2e8f0] text-[#64748b] text-[15px]"
        >
          ✅ No pending actions — you're all caught up!
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {actions.map((action: any) => {
            const isDispute = action.type === "dispute";
            const isPayout = action.type === "payout";
            const isTicket = action.type === "ticket";

            const iconBg = isDispute
              ? "bg-[#ef4444]/[0.08]"
              : isPayout
              ? "bg-[#10b981]/[0.08]"
              : isTicket
              ? "bg-[#f97316]/[0.08]"
              : "bg-gray-100";

            const badgeBg = isDispute
              ? "bg-[#ef4444]/10 text-[#ef4444]"
              : isPayout
              ? "bg-[#10b981]/10 text-[#10b981]"
              : isTicket
              ? "bg-[#f97316]/10 text-[#f97316]"
              : "bg-gray-100 text-gray-700";

            return (
              <Link
                key={action.id}
                href={action.link || "#"}
                className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xs p-5 sm:px-6 flex items-center gap-4 cursor-pointer transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md hover:border-[#10b981]/25 text-inherit no-underline"
              >
                <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px] shrink-0 ${iconBg}`}>
                  {(ACTION_ICONS as Record<string, string>)[action.type] || "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-bold text-[#0f172a] mb-0.5">{action.title}</div>
                  <div className="text-[13px] text-[#64748b] leading-[1.4]">{action.description}</div>
                  {action.oldestCreatedAt && (
                    <div
                      className="text-[#64748b] leading-[1.4]"
                      style={{ marginTop: 4, fontSize: 12 }}
                    >
                      Oldest: {moment(action.oldestCreatedAt).fromNow()}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-[14px] font-extrabold shrink-0 ${badgeBg}`}>
                  {action.badge}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Dashboard Page
   ═══════════════════════════════════════════ */

export default function AdminDashboardPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col gap-7">
      <div className="mb-1">
        <h1 className="text-[26px] font-extrabold text-[#0f172a] mb-1">Dashboard</h1>
        <p className="text-[15px] text-[#64748b]">Real-time analytics and metrics overview</p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[2fr_1fr] gap-5">
        <RevenueTrendChart />
        <OrderBreakdownChart />
      </div>

      {/* Pending Actions */}
      <PendingActions />
    </div>
  );
}
