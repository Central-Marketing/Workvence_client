"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileCheck,
  CreditCard,
  Clock,
  PieChart,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  FolderOpen
} from "lucide-react";
import toast from "react-hot-toast";

const workspaceTabs = [
  {
    id: "invoicing",
    name: "Automated Invoicing",
    icon: CreditCard,
    title: "Get Paid Faster with Multi-Currency Invoicing",
    desc: "Generate professional recurring and milestone invoices with automatic payment reminders, Stripe/PayPal checkout links, and tax calculation.",
    mockup: (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <span className="font-bold text-gray-900 block text-sm">Invoice #WV-2026-89</span>
            <span className="text-gray-400">Billed to: Acme SaaS Inc.</span>
          </div>
          <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700">Paid • $3,400.00</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>Next.js 16 Web Application Frontend Milestone</span>
            <span className="font-semibold text-gray-900">$2,400.00</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Stripe & Escrow Webhooks Integration</span>
            <span className="font-semibold text-gray-900">$1,000.00</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "contracts",
    name: "Smart Contracts & E-Sign",
    icon: FileCheck,
    title: "Ironclad Standard Contracts in Seconds",
    desc: "Protect your IP and payment rights with legally vetted freelancer agreements, custom milestones, and one-click digital e-signatures.",
    mockup: (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="font-bold text-gray-900 text-sm">Independent Contractor Agreement</span>
          <span className="px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700">E-Signed by Both Parties</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-gray-600">
          <p>• Full intellectual property transfer upon final escrow milestone payout.</p>
          <p>• Standard 2-round revision window with 48h turnaround.</p>
        </div>
      </div>
    )
  },
  {
    id: "tracking",
    name: "Time & Task Tracking",
    icon: Clock,
    title: "Track Hours & Milestone Deliverables",
    desc: "Log project hours with our lightweight desktop and web timer. Attach work logs directly to invoices for instant client verification.",
    mockup: (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">Active Session: Brand UI Sprint</span>
          <span className="font-mono font-bold text-emerald-600 text-base">03:42:18</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className="bg-[#327C73] h-full w-3/4 rounded-full" />
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Logged Today: 5.8 hrs</span>
          <span>Target: 7.5 hrs</span>
        </div>
      </div>
    )
  }
];

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState(workspaceTabs[0].id);

  const currentTab = workspaceTabs.find((t) => t.id === activeTab) || workspaceTabs[0];

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Briefcase className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Workspace Suite</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              The All-in-One Business Tool for <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Independent Professionals</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Invoicing, smart contracts, time tracking, expense management, and client portal—all built directly into your Workvence account.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Get Workspace Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Tour Tabs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#327C73] text-white shadow-md"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-xs">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">
                {currentTab.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] leading-tight">
                {currentTab.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {currentTab.desc}
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#327C73] hover:text-[#28635c]"
                >
                  <span>Start using {currentTab.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div>{currentTab.mockup}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
