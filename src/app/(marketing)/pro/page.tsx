"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Crown,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Code2,
  PenTool,
  Cpu,
  BarChart,
  Video,
  Send,
  X
} from "lucide-react";
import { Button } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";
import toast from "react-hot-toast";

const DISCIPLINE_OPTIONS: CustomSelectOption[] = [
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "UI/UX & Product Design", label: "UI/UX & Product Design" },
  { value: "3D Motion & Video", label: "3D Motion & Video" },
  { value: "Growth & Copywriting", label: "Growth & Copywriting" },
];

const EXPERIENCE_OPTIONS: CustomSelectOption[] = [
  { value: "3-5 years", label: "3 - 5 Years" },
  { value: "5-8 years", label: "5 - 8 Years" },
  { value: "8+ years", label: "8+ Years (Principal/Lead)" },
];

const vettingSteps = [
  {
    step: "01",
    title: "Portfolio & Track Record Audit",
    desc: "Rigorous review of previous client work, live projects, and verified references from established organizations."
  },
  {
    step: "02",
    title: "Technical & Craft Assessment",
    desc: "Domain-specific coding tests, design system audits, or strategic case study reviews evaluated by senior peer leads."
  },
  {
    step: "03",
    title: "Communication & Reliability Screening",
    desc: "Live video interview assessing English fluency, collaborative maturity, and milestone management rigor."
  },
  {
    step: "04",
    title: "Continuous Quality Monitoring",
    desc: "Pro status is maintained through ongoing 4.9+ rating averages and zero-defect delivery standards."
  }
];

const proCategories = [
  {
    icon: Code2,
    title: "Senior Full Stack & AI Engineers",
    desc: "React/Next.js, Node.js, Python, vector search embeddings, cloud DevOps architecture."
  },
  {
    icon: PenTool,
    title: "Brand Identity & Product Designers",
    desc: "Figma design systems, UI/UX interaction architecture, 3D motion graphics, brand guidelines."
  },
  {
    icon: BarChart,
    title: "Growth & Performance Marketers",
    desc: "Paid acquisition, SEO technical audits, high-converting copywriting, Klaviyo lifecycle email."
  },
  {
    icon: Video,
    title: "High-End Video & 3D Animators",
    desc: "Commercial 3D rendering, Blender/Cinema4D motion, product launch trailers, VFX post-production."
  }
];

export default function ProTalentPage() {
  const [isApplyingPro, setIsApplyingPro] = useState(false);
  const [proForm, setProForm] = useState({
    name: "",
    email: "",
    portfolio: "",
    primarySkill: "Software Engineering",
    experienceYears: "5+ years",
    notes: ""
  });

  const handleProSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proForm.name || !proForm.email || !proForm.portfolio) {
      toast.error("Please fill in required fields.");
      return;
    }
    toast.success("Workvence Pro application submitted! Our editorial vetting panel will review within 3-5 business days.");
    setIsApplyingPro(false);
    setProForm({ name: "", email: "", portfolio: "", primarySkill: "Software Engineering", experienceYears: "5+ years", notes: "" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0f172a] via-[#112131] to-[#0f172a] text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] text-xs font-semibold">
              <Crown className="w-3.5 h-3.5 text-[#0D6D5F]" />
              <span>Workvence Pro • Top 1% Vetted Talent</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-tight">
              Exceptional Talent for <br className="hidden sm:inline" />
              <span className="text-[#0D6D5F]">Mission-Critical Projects</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Hand-vetted specialists with proven enterprise track records. Zero guesswork, guaranteed delivery excellence, and VIP concierge matching.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/packages?pro=true"
                className="px-6 h-10 rounded-[6px] bg-[#0D6D5F] hover:bg-[#0b5c50] text-white font-semibold text-xs sm:text-sm transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Pro Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Button
                onClick={() => setIsApplyingPro(true)}
                variant="outline"
                size="md"
                radius="fiverr"
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm"
              >
                Apply as a Pro Freelancer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Vetting Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">The Vetting Standard</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Only 1 in 100 Applicants are Accepted
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Our vetting panel reviews technical skill, communication maturity, and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vettingSteps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-6 space-y-4 hover:border-[#0D6D5F]/40 shadow-xs transition duration-200"
              >
                <div className="text-2xl font-mono font-extrabold text-[#0D6D5F]">{s.step}</div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">{s.title}</h3>
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Categories Grid */}
      <section className="pt-20 pb-[80px] min-[1400px]:pb-[100px] bg-[#f8fafc] border-y border-[rgba(0,0,0,0.10)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Specialist Domains</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Vetted Across Key Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Hire hand-picked experts across software, design, marketing, and media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proCategories.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[6px] p-7 sm:p-8 space-y-4 shadow-xs hover:border-[#0D6D5F]/40 transition duration-200"
                >
                  <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#0D6D5F]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">{c.title}</h3>
                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pro Application Modal */}
      {isApplyingPro && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[6px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[rgba(0,0,0,0.10)] my-8">
            <Button
              onClick={() => setIsApplyingPro(false)}
              variant="soft"
              size="icon"
              radius="full"
              className="absolute top-5 right-5 w-8 h-8 text-gray-600 hover:text-black cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="space-y-1 mb-5">
              <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Workvence Pro</span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0f172a]">Apply for Workvence Pro</h3>
              <p className="text-xs text-gray-500">Join the top 1% vetted specialist tier.</p>
            </div>

            <form onSubmit={handleProSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={proForm.name}
                    onChange={(e) => setProForm({ ...proForm, name: e.target.value })}
                    placeholder="e.g. Thomas Becker"
                    className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={proForm.email}
                    onChange={(e) => setProForm({ ...proForm, email: e.target.value })}
                    placeholder="thomas@studio.com"
                    className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Portfolio / GitHub / Case Studies URL *</label>
                <input
                  type="url"
                  required
                  value={proForm.portfolio}
                  onChange={(e) => setProForm({ ...proForm, portfolio: e.target.value })}
                  placeholder="https://thomasbecker.design"
                  className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Discipline</label>
                  <CustomSelect
                    value={proForm.primarySkill}
                    onChange={(val) => setProForm((prev) => ({ ...prev, primarySkill: val }))}
                    options={DISCIPLINE_OPTIONS}
                    size="md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience Level</label>
                  <CustomSelect
                    value={proForm.experienceYears}
                    onChange={(val) => setProForm((prev) => ({ ...prev, experienceYears: val }))}
                    options={EXPERIENCE_OPTIONS}
                    size="md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notable Clients / Proudest Projects</label>
                <textarea
                  rows={3}
                  value={proForm.notes}
                  onChange={(e) => setProForm({ ...proForm, notes: e.target.value })}
                  placeholder="Mention any high-profile clients, enterprise brands, or open-source projects..."
                  className="w-full px-3 py-2 rounded-[6px] border border-gray-300 text-xs focus:border-[#0D6D5F] outline-none resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                size="md"
                radius="fiverr"
                fullWidth
                leftIcon={<Send className="w-4 h-4" />}
                className="font-semibold shadow-xs mt-2"
              >
                Submit Pro Application
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
