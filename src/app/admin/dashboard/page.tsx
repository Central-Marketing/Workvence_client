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
import { Loader } from "@/components";
import "./AdminDashboard.scss";

/* ═══════════════════════════════════════════
   KPI Cards Section
   ═══════════════════════════════════════════ */

const KPI_META = [
  { key: "gmv", className: "kpi-gmv" },
  { key: "activeOrders", className: "kpi-orders" },
  { key: "newUsers", className: "kpi-users" },
  { key: "openDisputes", className: "kpi-disputes" },
];

function KPICards() {
  const { isLoading, data } = useQuery({
    queryKey: ["admin-kpi"],
    queryFn: () =>
      adminAxios.get("/analytics/kpi").then((res) => res.data?.data),
  });

  if (isLoading || !data) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-skeleton">
            <div className="skel-line short" />
            <div className="skel-line tall" />
            <div className="skel-line tiny" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-grid">
      {KPI_META.map(({ key, className }) => {
        const kpi = data[key];
        if (!kpi) return null;
        const isPositive = kpi.change >= 0;

        return (
          <div key={key} className={`kpi-card ${className}`}>
            <span className="kpi-title">{kpi.title}</span>
            <span className="kpi-value">{kpi.value}</span>
            <span
              className={`kpi-change ${isPositive ? "positive" : "negative"}`}
            >
              <span className="arrow">{isPositive ? "↑" : "↓"}</span>
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
    <div className="chart-card">
      <div className="chart-header">
        <h3>Revenue Trend</h3>
        <div className="period-tabs">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={period === opt.value ? "active" : ""}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
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
    <div className="chart-card pie-card">
      <div className="chart-header">
        <h3>Order Breakdown</h3>
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
          <div className="pie-container">
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

          <div className="pie-total">
            Total Orders: <strong>{total.toLocaleString()}</strong>
          </div>

          <div className="pie-legend">
            {pieData.map((item: any) => (
              <div key={item.name} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: item.color }}
                />
                <span className="legend-name">{item.name}</span>
                <span className="legend-val">
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
      <div className="section-loader">
        <Loader size={35} />
      </div>
    );
  }

  return (
    <div className="actions-section">
      <div className="actions-header">
        <h2>Pending Actions</h2>
        {summary && (
          <div className="summary-pills">
            {summary.totalPendingDisputes > 0 && (
              <span className="pill disputes">
                {summary.totalPendingDisputes} disputes
              </span>
            )}
            {summary.totalPendingPayoutsCount > 0 && (
              <span className="pill payouts">
                {summary.totalPendingPayoutsCount} payouts
              </span>
            )}
            {summary.totalUnrespondedTickets > 0 && (
              <span className="pill tickets">
                {summary.totalUnrespondedTickets} tickets
              </span>
            )}
          </div>
        )}
      </div>

      {actions.length === 0 ? (
        <div
          className="section-loader"
          style={{ minHeight: 120, color: "#64748b", fontSize: 15 }}
        >
          ✅ No pending actions — you're all caught up!
        </div>
      ) : (
        <div className="actions-grid">
          {actions.map((action: any) => (
            <Link
              key={action.id}
              href={action.link || "#"}
              className="action-card"
            >
              <div className={`action-icon ${action.type}`}>
                {(ACTION_ICONS as Record<string, string>)[action.type] || "📋"}
              </div>
              <div className="action-content">
                <div className="action-title">{action.title}</div>
                <div className="action-desc">{action.description}</div>
                {action.oldestCreatedAt && (
                  <div
                    className="action-desc"
                    style={{ marginTop: 4, fontSize: 12 }}
                  >
                    Oldest: {moment(action.oldestCreatedAt).fromNow()}
                  </div>
                )}
              </div>
              <span className={`action-badge ${action.type}`}>
                {action.badge}
              </span>
            </Link>
          ))}
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
    <div className="admin-dashboard">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <p>Real-time analytics and metrics overview</p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Charts Row */}
      <div className="charts-row">
        <RevenueTrendChart />
        <OrderBreakdownChart />
      </div>

      {/* Pending Actions */}
      <PendingActions />
    </div>
  );
}
