"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Cpu,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Send,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const partnerTracks = [
  {
    icon: Building2,
    title: "Agency & Solutions Partners",
    desc: "For digital agencies, consulting firms, and dev shops looking to scale their client capacity with vetted Workvence talent.",
    benefits: [
      "White-label delivery support for overflow client work",
      "Dedicated agency talent concierge & priority matching",
      "Tiered agency volume discounts and consolidated invoicing"
    ]
  },
  {
    icon: Cpu,
    title: "Technology & API Partners",
    desc: "Integrate your SaaS product, payment gateway, cloud tool, or AI service directly into the Workvence workspace.",
    benefits: [
      "Access to Workvence Open API sandbox & developer webhooks",
      "Featured placement in the Workvence App Directory",
      "Joint co-marketing campaigns and developer spotlights"
    ]
  },
  {
    icon: GraduationCap,
    title: "Education & Bootcamps",
    desc: "Equip your bootcamp graduates and university students with real-world freelancing careers and verified portfolio badges.",
    benefits: [
      "Fast-track onboarding and verified graduate profile badges",
      "Exclusive mentorship webinars hosted by top Workvence sellers",
      "Dedicated curriculum resources on freelance business management"
    ]
  },
  {
    icon: Globe2,
    title: "Global Enterprise Resellers",
    desc: "Regional software distributors and corporate procurement partners bringing Workvence Enterprise to local markets.",
    benefits: [
      "Generous recurring revenue-sharing model (up to 25%)",
      "Localized sales enablement collateral and demo environments",
      "Quarterly executive reviews and dedicated partner success lead"
    ]
  }
];

const ecosystemLogos = [
  { name: "Stripe", category: "Global Payments" },
  { name: "AWS", category: "Cloud Infrastructure" },
  { name: "Slack", category: "Collaboration" },
  { name: "Figma", category: "Design Ecosystem" },
  { name: "GitHub", category: "Code & Dev" },
  { name: "Notion", category: "Documentation" }
];

export default function PartnershipsPage() {
  const [isApplying, setIsApplying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("Agency & Solutions Partners");
  const [partnerForm, setPartnerForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    website: "",
    track: "Agency & Solutions Partners",
    message: ""
  });

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.companyName || !partnerForm.email || !partnerForm.contactName) {
      toast.error("Please fill in the required partner details.");
      return;
    }
    toast.success("Partnership application submitted! Our partner director will connect within 2 business days.");
    setIsApplying(false);
    setPartnerForm({
      companyName: "",
      contactName: "",
      email: "",
      website: "",
      track: "Agency & Solutions Partners",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Handshake className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Partner Ecosystem</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Grow Together with the <br className="hidden sm:inline" />
              <span className="text-[#327C73]">World's Top Talent</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Whether you are an agency, technology provider, educational bootcamp, or enterprise consultancy, partnering with Workvence unlocks unprecedented scale and revenue.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsApplying(true)}
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Become a Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#tracks"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition"
              >
                Explore Partner Tracks
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Tracks Grid */}
      <section id="tracks" className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Partnership Tracks</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Tailored Programs for Every Model
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Select the track aligned with your business goals and start building with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partnerTracks.map((track, idx) => {
              const Icon = track.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-xs hover:border-[#327C73] hover:shadow-md transition-all duration-300 space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0f172a]">{track.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{track.desc}</p>
                    
                    <div className="pt-2 space-y-2.5 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                        Key Benefits
                      </span>
                      {track.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTrack(track.title);
                      setPartnerForm((prev) => ({ ...prev, track: track.title }));
                      setIsApplying(true);
                    }}
                    className="w-full py-3 rounded-xl bg-gray-50 hover:bg-[#327C73] hover:text-white text-[#0f172a] font-semibold text-xs border border-gray-200 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply for this Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">Integrated Ecosystem</span>
            <h3 className="text-2xl font-bold text-[#0f172a]">Trusted by Leading Platforms</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ecosystemLogos.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#f8fafc] border border-gray-200/80 rounded-2xl p-4 text-center space-y-1 hover:bg-white hover:border-[#327C73] transition"
              >
                <div className="font-bold text-base text-[#0f172a]">{item.name}</div>
                <div className="text-[11px] text-gray-500">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setIsApplying(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">
                Partnership Inquiry
              </span>
              <h3 className="text-xl font-bold text-[#0f172a]">Join the Partner Program</h3>
              <p className="text-xs text-gray-500">
                Tell us about your organization and how we can collaborate.
              </p>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Partnership Track *
                </label>
                <select
                  value={partnerForm.track}
                  onChange={(e) => setPartnerForm({ ...partnerForm, track: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[#327C73] outline-none"
                >
                  <option value="Agency & Solutions Partners">Agency & Solutions Partners</option>
                  <option value="Technology & API Partners">Technology & API Partners</option>
                  <option value="Education & Bootcamps">Education & Bootcamps</option>
                  <option value="Global Enterprise Resellers">Global Enterprise Resellers</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.companyName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, companyName: e.target.value })}
                    placeholder="e.g. Acme Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.contactName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contactName: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="sarah@acme.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={partnerForm.website}
                    onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                    placeholder="https://acme.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Collaboration Vision / Notes
                </label>
                <textarea
                  rows={3}
                  value={partnerForm.message}
                  onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                  placeholder="How can we work together? (e.g. integrations, agency volume, graduate placement)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Partner Application</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
