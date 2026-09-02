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
import toast from "react-hot-toast";

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6ad724]/10 border border-[#6ad724]/20 text-[#6ad724] text-xs font-semibold">
              <Crown className="w-4 h-4 text-[#6ad724]" />
              <span>Workvence Pro • Top 1% Vetted Talent</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Exceptional Talent for <br className="hidden sm:inline" />
              <span className="text-[#6ad724]">Mission-Critical Projects</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal">
              Hand-vetted specialists with proven enterprise track records. Zero guesswork, guaranteed delivery excellence, and VIP concierge matching.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/packages?pro=true"
                className="px-8 py-4 rounded-xl bg-[#6ad724] hover:bg-[#5ec41e] text-[#0f172a] font-bold text-sm transition shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Pro Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsApplyingPro(true)}
                className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold text-sm transition cursor-pointer"
              >
                Apply as a Pro Freelancer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Vetting Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">The Vetting Standard</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Only 1 in 100 Applicants are Accepted
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Our vetting panel reviews technical skill, communication maturity, and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vettingSteps.map((s, idx) => (
              <div
                key={idx}
                className="bg-[#f8fafc] border border-gray-200/90 rounded-3xl p-8 space-y-4 hover:border-[#327C73] transition"
              >
                <div className="text-2xl font-mono font-extrabold text-[#327C73]">{s.step}</div>
                <h3 className="text-lg font-bold text-[#0f172a]">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Categories Grid */}
      <section className="py-20 bg-[#f8fafc] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Specialist Domains</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Vetted Across Key Disciplines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proCategories.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-3xl p-8 space-y-4 shadow-xs hover:border-[#327C73] hover:shadow-md transition duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a]">{c.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-normal">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pro Application Modal */}
      {isApplyingPro && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsApplyingPro(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-xl font-bold text-[#0f172a]">Apply for Workvence Pro</h3>
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Discipline</label>
                  <select
                    value={proForm.primarySkill}
                    onChange={(e) => setProForm({ ...proForm, primarySkill: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                    <option value="3D Motion & Video">3D Motion & Video</option>
                    <option value="Growth & Copywriting">Growth & Copywriting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={proForm.experienceYears}
                    onChange={(e) => setProForm({ ...proForm, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  >
                    <option value="3-5 years">3 - 5 Years</option>
                    <option value="5-8 years">5 - 8 Years</option>
                    <option value="8+ years">8+ Years (Principal/Lead)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notable Clients / Proudest Projects</label>
                <textarea
                  rows={3}
                  value={proForm.notes}
                  onChange={(e) => setProForm({ ...proForm, notes: e.target.value })}
                  placeholder="Mention any high-profile clients, enterprise brands, or open-source projects..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Pro Application</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
