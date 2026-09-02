"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Palette,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Type,
  Maximize2
} from "lucide-react";
import toast from "react-hot-toast";

const mockups = ["All", "Business Card", "App Icon", "Storefront", "T-Shirt"];

export default function LogoMakerPage() {
  const [brandName, setBrandName] = useState("Veloce");
  const [slogan, setSlogan] = useState("Scale with speed");
  const [industry, setIndustry] = useState("Tech & AI");
  const [selectedStyle, setSelectedStyle] = useState("Modern Geometric");
  const [primaryColor, setPrimaryColor] = useState("#327C73");
  const [selectedMockup, setSelectedMockup] = useState("All");

  const logoVariations = [
    {
      id: 1,
      name: "Minimalist Geometric",
      render: (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg" style={{ backgroundColor: primaryColor }}>
            {brandName.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tight text-[#0f172a]">{brandName || "Brand"}</div>
            {slogan && <div className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">{slogan}</div>}
          </div>
        </div>
      )
    },
    {
      id: 2,
      name: "Tech Monogram",
      render: (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-mono font-black text-3xl" style={{ borderColor: primaryColor, color: primaryColor }}>
            {brandName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tracking-widest text-[#0f172a] uppercase">{brandName || "Brand"}</div>
            {slogan && <div className="text-[10px] text-gray-500 font-medium">{slogan}</div>}
          </div>
        </div>
      )
    },
    {
      id: 3,
      name: "Abstract Emblem",
      render: (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="flex items-center gap-1">
            <div className="w-4 h-10 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="w-4 h-14 rounded-full bg-[#10b981]" />
            <div className="w-4 h-8 rounded-full bg-[#6ad724]" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#0f172a]">{brandName || "Brand"}</div>
            {slogan && <div className="text-[11px] text-gray-400">{slogan}</div>}
          </div>
        </div>
      )
    },
    {
      id: 4,
      name: "Editorial Serif",
      render: (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-serif text-3xl font-bold">
            {brandName.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif font-bold text-[#0f172a] tracking-tight">{brandName || "Brand"}</div>
            {slogan && <div className="text-[11px] italic text-gray-500">{slogan}</div>}
          </div>
        </div>
      )
    },
    {
      id: 5,
      name: "Dynamic Speed Crest",
      render: (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-16 h-12 rounded-lg flex items-center justify-center text-white font-black text-xl italic tracking-tighter" style={{ backgroundColor: primaryColor }}>
            &gt;&gt;&gt;
          </div>
          <div className="text-center">
            <div className="text-2xl font-black italic uppercase tracking-wider text-[#0f172a]">{brandName || "Brand"}</div>
            {slogan && <div className="text-[10px] font-bold text-[#327C73] uppercase tracking-widest">{slogan}</div>}
          </div>
        </div>
      )
    },
    {
      id: 6,
      name: "Modern Clean Wordmark",
      render: (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-12 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          <div className="text-center">
            <div className="text-3xl font-black tracking-tight text-[#0f172a] flex items-center justify-center gap-0.5">
              <span>{brandName || "Brand"}</span>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: primaryColor }} />
            </div>
            {slogan && <div className="text-xs text-gray-400 font-medium tracking-wide mt-1">{slogan}</div>}
          </div>
        </div>
      )
    }
  ];

  const handleDownloadLogo = (id: number) => {
    toast.success(`Exporting high-res vector package for Logo Concept #${id} (.SVG & .PNG)...`);
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>AI Logo Studio & Brand Generator</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Create a Custom Logo in Seconds
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Enter your brand name, explore instant vector variations, preview real-world mockups, or hire a top logo designer for custom refinements.
            </p>
          </div>
        </div>
      </section>

      {/* Main Studio Interface */}
      <div className="container mx-auto px-4 md:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Controls Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#327C73]" />
                  <span>Logo Customizer</span>
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Veloce"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Slogan / Tagline (Optional)</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="e.g. Scale with speed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#327C73] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#327C73] outline-none"
                >
                  <option value="Tech & AI">Tech & AI</option>
                  <option value="Creative Agency">Creative Agency</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Finance & Fintech">Finance & Fintech</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Color Palette Accent</label>
                <div className="flex items-center gap-3">
                  {["#327C73", "#10b981", "#2563eb", "#7c3aed", "#e11d48", "#0f172a"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                        primaryColor === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Designer Card */}
            <div className="bg-gradient-to-r from-[#f2fbf6] to-[#e6f8ef] border border-[#ceefe0] rounded-3xl p-6 space-y-3 text-center">
              <h4 className="font-bold text-[#0f172a] text-sm">Need a 100% bespoke custom logo?</h4>
              <p className="text-xs text-gray-600">
                Work directly with top-rated branding freelancers starting at $50.
              </p>
              <Link
                href="/packages?category=graphics-and-design"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition"
              >
                <span>Browse Logo Designers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Logo Variations Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-[#0f172a]">Generated Logo Concepts</h3>
              <span className="text-xs text-gray-500 font-medium">Live Instant Preview</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {logoVariations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200/90 rounded-3xl p-6 hover:border-[#327C73] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-semibold text-gray-700">{item.name}</span>
                    <span>Concept #{item.id}</span>
                  </div>

                  <div className="min-h-[160px] flex items-center justify-center bg-[#fafafa] rounded-2xl border border-gray-100/80 group-hover:bg-white transition">
                    {item.render}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleDownloadLogo(item.id)}
                      className="text-xs font-semibold text-[#327C73] hover:text-[#28635c] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Logo Kit</span>
                    </button>

                    <Link
                      href="/packages?category=graphics-and-design"
                      className="text-[11px] text-gray-400 hover:text-gray-700 transition"
                    >
                      Customize with Designer →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
