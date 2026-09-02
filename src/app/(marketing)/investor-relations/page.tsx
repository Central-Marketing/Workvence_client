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
import toast from "react-hot-toast";

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
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Investor Relations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Powering the Global <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Independent Economy</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Discover our financial disclosures, governance frameworks, operational performance, and long-term shareholder value creation strategy.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <a
                href="#filings"
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Financial Disclosures</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Investor Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Highlights Grid */}
      <section className="py-16 bg-[#0f172a] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">{h.label}</span>
                    <Icon className="w-4 h-4 text-[#6ad724]" />
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
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Financial Reporting</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
                Reports & Shareholder Letters
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialReports.map((report, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#327C73] hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-[#10b981]/10 text-[#327C73]">
                      {report.period}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{report.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a] group-hover:text-[#327C73] transition-colors">
                    {report.title}
                  </h3>
                  <span className="text-xs text-gray-400">{report.size} • {report.type}</span>
                </div>

                <button
                  onClick={() => handleDownload(report.title)}
                  className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#327C73] group-hover:text-white text-gray-700 flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor FAQ & Contact Section */}
      <section id="contact" className="py-20 bg-[#f8fafc] border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* FAQ Accordion (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Investor FAQ</span>
                <h3 className="text-2xl font-bold text-[#0f172a]">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                {investorFaqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200/90 rounded-2xl p-5 cursor-pointer"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#0f172a]">{faq.q}</h4>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          openFaq === i ? "rotate-180 text-[#327C73]" : ""
                        }`}
                      />
                    </div>
                    {openFaq === i && (
                      <p className="text-xs text-gray-600 pt-3 mt-3 border-t border-gray-100 leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Investor Inquiry Form (6 cols) */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#0f172a]">Investor Inquiries</h3>
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
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Fund / Institution</label>
                      <input
                        type="text"
                        value={irForm.fund}
                        onChange={(e) => setIrForm({ ...irForm, fund: e.target.value })}
                        placeholder="e.g. Apex Ventures"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
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
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Inquiry Type</label>
                      <select
                        value={irForm.inquiryType}
                        onChange={(e) => setIrForm({ ...irForm, inquiryType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                      >
                        <option value="Institutional Investor">Institutional Investor</option>
                        <option value="Sell-Side Analyst">Sell-Side Analyst</option>
                        <option value="Individual Shareholder">Individual Shareholder</option>
                        <option value="M&A / Partnership">Strategic M&A</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={irForm.message}
                      onChange={(e) => setIrForm({ ...irForm, message: e.target.value })}
                      placeholder="Brief description of your inquiry..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send IR Inquiry</span>
                  </button>
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
