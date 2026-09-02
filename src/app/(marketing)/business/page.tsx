"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  FileCheck,
  Headphones,
  Lock,
  Send,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const enterpriseFeatures = [
  {
    icon: Users,
    title: "Multi-Seat Team Workspace",
    desc: "Invite your entire department. Set granular spending limits, assign project permissions, and collaborate across teams seamlessly."
  },
  {
    icon: CreditCard,
    title: "Consolidated Monthly Invoicing",
    desc: "Streamline accounts payable with a single monthly invoice, Net-30 payment terms, and automated corporate expense categorization."
  },
  {
    icon: Headphones,
    title: "Dedicated Account Concierge",
    desc: "Your dedicated talent specialist matches custom project briefs with pre-vetted specialists within 2 business hours."
  },
  {
    icon: Lock,
    title: "Custom NDAs & IP Protection",
    desc: "Ensure enterprise legal compliance with custom Master Services Agreements (MSA), strict confidentiality clauses, and automated IP transfer."
  }
];

export default function BusinessSolutionsPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    company: "",
    workEmail: "",
    teamSize: "20-50 employees",
    projectScope: ""
  });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.workEmail || !demoForm.company) {
      toast.error("Please fill in the required fields.");
      return;
    }
    toast.success("Demo request received! An enterprise account executive will contact you to schedule a consultation.");
    setIsDemoOpen(false);
    setDemoForm({ name: "", company: "", workEmail: "", teamSize: "20-50 employees", projectScope: "" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Building2 className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Enterprise & Business</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Enterprise Talent Solutions for <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Scaling Modern Teams</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Empower your team with vetted freelancers, centralized corporate billing, custom Master Service Agreements, and dedicated talent curation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsDemoOpen(true)}
                className="px-8 py-4 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Book an Enterprise Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/pro"
                className="px-8 py-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Explore Pro Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Enterprise Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Built for Scale, Security & Control
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enterpriseFeatures.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200/90 rounded-3xl p-8 space-y-4 shadow-xs hover:border-[#327C73] hover:shadow-md transition duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a]">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-normal">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Booking Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsDemoOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-xl font-bold text-[#0f172a]">Book an Enterprise Demo</h3>
              <p className="text-xs text-gray-500">Discover how Workvence Business powers your organization.</p>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={demoForm.company}
                    onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={demoForm.workEmail}
                    onChange={(e) => setDemoForm({ ...demoForm, workEmail: e.target.value })}
                    placeholder="rachel@acmecorp.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company Size</label>
                  <select
                    value={demoForm.teamSize}
                    onChange={(e) => setDemoForm({ ...demoForm, teamSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="1-20 employees">1-20 employees</option>
                    <option value="20-50 employees">20-50 employees</option>
                    <option value="50-250 employees">50-250 employees</option>
                    <option value="250+ employees">250+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hiring Needs / Project Scope</label>
                <textarea
                  rows={3}
                  value={demoForm.projectScope}
                  onChange={(e) => setDemoForm({ ...demoForm, projectScope: e.target.value })}
                  placeholder="Tell us what talent you're looking to hire (e.g. AI engineers, brand design, video editing)..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Schedule Consultation Call</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
