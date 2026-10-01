"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Globe2,
  Users,
  ShieldCheck,
  FileText,
  Download,
  Mail,
  ChevronDown,
  ArrowRight,
  PieChart,
  BarChart3,
  Send,
  Building
} from "lucide-react";
import { Button, Breadcrumb } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";
import { toast } from "sonner";

const INQUIRY_TYPE_OPTIONS: CustomSelectOption[] = [
  { value: "Institutional Investor", label: "Institutional Investor" },
  { value: "Sell-Side Analyst", label: "Sell-Side Analyst" },
  { value: "Individual Shareholder", label: "Individual Shareholder" },
  { value: "M&A / Partnership", label: "Strategic M&A" },
];

const financialReports = [
  {
    title: "Q2 2026 Shareholder Letter & Operational Metrics",
    date: "July 28, 2026",
    period: "Q2 2026",
    size: "1.8 MB",
    type: "PDF"
  },
  {
    title: "Q1 2026 Financial Highlights & Business Review",
    date: "April 24, 2026",
    period: "Q1 2026",
    size: "2.1 MB",
    type: "PDF"
  },
  {
    title: "FY 2025 Annual Report & Audited Financial Statements",
    date: "February 12, 2026",
    period: "FY 2025",
    size: "4.5 MB",
    type: "PDF"
  },
  {
    title: "Corporate Governance & Board Charter",
    date: "January 15, 2026",
    period: "Governance",
    size: "1.2 MB",
    type: "PDF"
  }
];

const highlights = [
  {
    label: "Gross Merchandise Value (GMV)",
    value: "$185M+",
    growth: "+48% YoY",
    icon: TrendingUp
  },
  {
    label: "Active Buyers Worldwide",
    value: "620,000+",
    growth: "+35% YoY",
    icon: Users
  },
  {
    label: "Verified Global Freelancers",
    value: "1.5M+",
    growth: "180+ Countries",
    icon: Globe2
  },
  {
    label: "Take Rate & Gross Margin",
    value: "84.2%",
    growth: "+220 bps YoY",
    icon: PieChart
  }
];

const investorFaqs = [
  {
    q: "What is Workvence's primary revenue model?",
    a: "Workvence operates a high-trust marketplace model generating revenue through buyer service fees, seller success tiers, premium subscription upgrades (Workvence Pro and Workvence Select), and value-added enterprise workspace management tools."
  },
  {
    q: "How does Workvence maintain higher retention than traditional freelance platforms?",
    a: "Our proprietary automated escrow system, zero-latency payment rails, transparent review verification, and multi-tier seller leveling provide superior trust and economic incentives for repeat business transactions."
  },
  {
    q: "How is Workvence approaching artificial intelligence?",
    a: "We leverage AI to empower freelancers rather than displace them—providing AI-assisted package creation, semantic buyer-seller matching, and automated quality assurance."
  }
];

export default function InvestorRelationsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [irForm, setIrForm] = useState({
    name: "",
    fund: "",
    email: "",
    inquiryType: "Institutional Investor",
    message: ""
  });

  const handleIrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!irForm.name || !irForm.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success("Investor inquiry received. Our IR team will respond shortly.");
    setIrForm({ name: "", fund: "", email: "", inquiryType: "Institutional Investor", message: "" });
  };

  const handleDownload = (title: string) => {
    toast.success(`Downloading ${title}...`);
  };

  return (
    <div className="min-h-screen text-[#112131] font-sans w-full container mx-auto px-4 md:px-6">
      {/* 1. Hero Banner Card */}
      <div className=" pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="Workvence Investor Relations Banner"
          className="relative w-full rounded-[6px] py-12 sm:py-14 md:py-16 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#013571] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/BecomeASeller.png')" }}
        >
          {/* Subtle dark overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-[#011e40]/30 backdrop-blur-[0.5px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Breadcrumb Navigation */}
            <Breadcrumb
              variant="inverted"
              className="mb-3 sm:mb-4 select-none [&>ol]:justify-center"
              items={[
                {
                  name: "Investor Relations",
                  isLast: true,
                },
              ]}
            />

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal italic tracking-tight text-[#fff] leading-[1.12] sm:leading-[1.08] select-none">
              Powering the Global <br className="hidden sm:inline" />
              <span className="text-[#6AD724]">Independent Economy</span>
            </h1>

            <p className="mt-3 sm:mt-4 text-xs sm:text-[13px] md:text-sm text-[#fff]/60 max-w-xl leading-relaxed">
              Discover our financial disclosures, governance frameworks, operational performance, and long-term shareholder value creation strategy.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 sm:pt-6">
              <a
                href="#filings"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs gap-2 cursor-pointer"
              >
                <span>Financial Disclosures</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white hover:bg-gray-100 text-[#0f172a] font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                Investor Contact
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* KPI Highlights Grid */}
      <section className="py-16 bg-[#0f172a] text-white mt-10 sm:mt-14 md:mt-16">
        <div className="px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-[6px] p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">{h.label}</span>
                    <Icon className="w-4 h-4 text-[#0D6D5F]" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{h.value}</div>
                  <div className="text-xs text-[#10b981] font-semibold">{h.growth}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Financial Reports & Disclosures */}
      <section id="filings" className="py-20 bg-white">
        <div className="px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Financial Reporting</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
                Reports & Shareholder Letters
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Access quarterly earnings, annual reports, and corporate governance materials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialReports.map((report, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200 flex items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-[6px] font-bold bg-[#0D6D5F]/10 text-[#0D6D5F] border border-[#0D6D5F]/15">
                      {report.period}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{report.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a] group-hover:text-[#0D6D5F] transition-colors">
                    {report.title}
                  </h3>
                  <span className="text-xs text-gray-400">{report.size} • {report.type}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(report.title)}
                  className="w-10 h-10 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] hover:bg-[#0D6D5F] hover:text-white flex items-center justify-center shrink-0 transition duration-150 cursor-pointer"
                  aria-label={`Download ${report.title}`}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor FAQ & Contact Section */}
      <section id="contact" className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-[#f8fafc] border-t border-[rgba(0,0,0,0.10)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* FAQ Accordion (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Investor FAQ</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">Frequently Asked Questions</h3>
                <p className="text-xs sm:text-sm text-gray-500">Key metrics and operational principles for shareholders.</p>
              </div>

              <div className="space-y-3">
                {investorFaqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-5 cursor-pointer shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#0f172a]">{faq.q}</h4>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-[#0D6D5F]" : ""
                          }`}
                      />
                    </div>
                    {openFaq === i && (
                      <p className="text-xs sm:text-[13px] text-gray-600 pt-3 mt-3 border-t border-[rgba(0,0,0,0.06)] leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Investor Inquiry Form (6 cols) */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 sm:p-8 shadow-xs space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Inquiries</span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0f172a]">Investor Inquiries</h3>
                  <p className="text-xs text-gray-500">
                    Reach out to our investor relations and corporate development team.
                  </p>
                </div>

                <form onSubmit={handleIrSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={irForm.name}
                        onChange={(e) => setIrForm({ ...irForm, name: e.target.value })}
                        placeholder="e.g. Michael Stone"
                        className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Fund / Institution</label>
                      <input
                        type="text"
                        value={irForm.fund}
                        onChange={(e) => setIrForm({ ...irForm, fund: e.target.value })}
                        placeholder="e.g. Apex Ventures"
                        className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={irForm.email}
                        onChange={(e) => setIrForm({ ...irForm, email: e.target.value })}
                        placeholder="m.stone@apex.com"
                        className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Inquiry Type</label>
                      <CustomSelect
                        value={irForm.inquiryType}
                        onChange={(val) => setIrForm((prev) => ({ ...prev, inquiryType: val }))}
                        options={INQUIRY_TYPE_OPTIONS}
                        size="md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={irForm.message}
                      onChange={(e) => setIrForm({ ...irForm, message: e.target.value })}
                      placeholder="Brief description of your inquiry..."
                      className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="brand"
                    size="md"
                    radius="fiverr"
                    fullWidth
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="font-semibold shadow-xs"
                  >
                    Send IR Inquiry
                  </Button>
                </form>

                <div className="pt-2 text-center text-[11px] text-gray-400">
                  Direct email: <span className="font-semibold text-gray-600">ir@workvence.com</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
