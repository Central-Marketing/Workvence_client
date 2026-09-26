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
import {
  SiStripe,
  SiFigma,
  SiGithub,
  SiNotion
} from "react-icons/si";
import {
  FaAws,
  FaSlack
} from "react-icons/fa6";
import { Button } from "@/components";
import { CustomSelect, CustomSelectOption } from "@/components/ui";
import toast from "react-hot-toast";

const PARTNER_TRACK_OPTIONS: CustomSelectOption[] = [
  { value: "Agency & Solutions Partners", label: "Agency & Solutions Partners" },
  { value: "Technology & API Partners", label: "Technology & API Partners" },
  { value: "Education & Bootcamps", label: "Education & Bootcamps" },
  { value: "Global Enterprise Resellers", label: "Global Enterprise Resellers" },
];

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
  {
    name: "Stripe",
    category: "Global Payments",
    icon: SiStripe,
    brandColor: "#635BFF",
  },
  {
    name: "AWS",
    category: "Cloud Infrastructure",
    icon: FaAws,
    brandColor: "#FF9900",
  },
  {
    name: "Slack",
    category: "Collaboration",
    icon: FaSlack,
    brandColor: "#4A154B",
  },
  {
    name: "Figma",
    category: "Design Ecosystem",
    icon: SiFigma,
    brandColor: "#F24E1E",
  },
  {
    name: "GitHub",
    category: "Code & Dev",
    icon: SiGithub,
    brandColor: "#181717",
  },
  {
    name: "Notion",
    category: "Documentation",
    icon: SiNotion,
    brandColor: "#000000",
  }
];

export default function PartnershipsClient() {
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
    <div className="min-h-screen bg-white text-[#112131] font-sans antialiased">
      {/* 1. Hero Banner */}
      <div className="w-full container mx-auto px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        <section
          aria-label="Partnerships Hero Banner"
          className="relative w-full rounded-[6px] py-14 sm:py-20 md:py-24 px-6 sm:px-10 text-center flex flex-col items-center justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/WorkwithBG.png')" }}
        >
          {/* Subtle dark overlay for perfect contrast */}
          <div className="absolute inset-0 bg-[#0c1c1b]/55 backdrop-blur-[1px]" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.12]">
              Grow Together with the <br className="hidden sm:inline" />
              <span className="text-[#6ad724]">World&apos;s Top Talent</span>
            </h1>
            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
              Whether you are an agency, technology provider, educational bootcamp, or enterprise consultancy, partnering with Workvence unlocks unprecedented scale and revenue.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                onClick={() => setIsApplying(true)}
                variant="brand"
                size="md"
                radius="fiverr"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-semibold text-sm shadow-md hover:shadow-lg bg-[#0D6D5F] hover:bg-[#0b5c50] text-white"
              >
                Become a Partner
              </Button>
              <a
                href="#tracks"
                className="px-7 h-10 inline-flex items-center justify-center rounded-[6px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition backdrop-blur-xs"
              >
                Explore Partner Tracks
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Partner Tracks Grid */}
      <section id="tracks" className="py-16 sm:py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6D5F]">Partnership Tracks</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
              Tailored Programs for Every Model
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Select the track aligned with your business goals and start building with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {partnerTracks.map((track, idx) => {
              const Icon = track.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-[6px] p-6 sm:p-8 border border-[rgba(0,0,0,0.10)] shadow-xs hover:border-[#0D6D5F]/40 hover:shadow-xs transition duration-200 space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] text-[#0D6D5F] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#0D6D5F]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0f172a]">{track.title}</h3>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">{track.desc}</p>

                    <div className="pt-2 space-y-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                        Key Benefits
                      </span>
                      {track.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedTrack(track.title);
                      setPartnerForm((prev) => ({ ...prev, track: track.title }));
                      setIsApplying(true);
                    }}
                    variant="outline"
                    size="md"
                    radius="fiverr"
                    fullWidth
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="bg-gray-50 hover:bg-[#0D6D5F] hover:text-white text-[#0f172a] font-semibold text-xs border border-[rgba(0,0,0,0.10)]"
                  >
                    Apply for this Track
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider">Integrated Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">Trusted by Leading Platforms</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Workvence integrates seamlessly with world-class tools and infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ecosystemLogos.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group bg-[#f8fafc] hover:bg-white border border-[rgba(0,0,0,0.10)] hover:border-[#0D6D5F]/40 hover:shadow-xs rounded-[6px] p-5 text-center flex flex-col items-center justify-center transition-all duration-200"
                >
                  <div className="w-12 h-12 mb-3 rounded-[6px] bg-[#fff] border border-[rgba(0,0,0,0.10)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                    <Icon className="w-6 h-6" style={{ color: item.brandColor }} />
                  </div>
                  <div className="font-semibold text-sm text-[#0f172a]">{item.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{item.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <div className="w-full container mx-auto px-4 md:px-6 pb-[80px] min-[1400px]:pb-[100px]">
        <section
          aria-label="Ready to Partner with Workvence"
          className="relative w-full rounded-[6px] py-14 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 text-left flex flex-col items-start justify-center shadow-xs overflow-hidden bg-[#102322] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/media/AFreelancerBG.png')" }}
        >
          <div className="absolute inset-0 bg-[#0c1c1b]/55 backdrop-blur-[1px]" />
          <div className="relative z-10 max-w-2xl flex flex-col items-start text-left space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white leading-tight">
              Ready to Partner with Workvence?
            </h2>
            <p className="font-inter text-xs sm:text-sm md:text-base text-gray-200 max-w-xl leading-relaxed">
              Join leading tech companies, agencies, and institutions expanding their reach with our talent network.
            </p>
            <div className="flex flex-wrap items-center justify-start gap-3 pt-2">
              <Button
                onClick={() => setIsApplying(true)}
                variant="brand"
                size="md"
                radius="fiverr"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-semibold text-sm shadow-md hover:shadow-lg bg-[#0D6D5F] hover:bg-[#0b5c50] text-white"
              >
                Become a Partner
              </Button>
              <a
                href="#tracks"
                className="px-6 h-10 inline-flex items-center justify-center rounded-[6px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition backdrop-blur-xs"
              >
                Explore Partner Tracks
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Partner Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[6px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <Button
              onClick={() => setIsApplying(false)}
              variant="soft"
              size="icon"
              radius="full"
              className="absolute top-5 right-5 w-8 h-8 text-gray-600 hover:text-black"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>

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
                <CustomSelect
                  value={partnerForm.track}
                  onChange={(val) => setPartnerForm((prev) => ({ ...prev, track: val }))}
                  options={PARTNER_TRACK_OPTIONS}
                  size="md"
                />
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
                    placeholder="Acme Corp"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none"
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
                  className="w-full px-3.5 py-2.5 rounded-[6px] border border-[rgba(0,0,0,0.10)] bg-[#F0F0F0] text-xs placeholder:text-[#868686] placeholder:font-normal focus:bg-white focus:border-[#0D6D5F] outline-none resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                size="md"
                radius="xl"
                fullWidth
                leftIcon={<Send className="w-4 h-4" />}
                className="font-semibold shadow-md mt-2"
              >
                Submit Partner Application
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
