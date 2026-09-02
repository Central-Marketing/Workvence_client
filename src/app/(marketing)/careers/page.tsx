"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Zap,
  Globe2,
  Shield,
  Users,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  UploadCloud,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  description: string;
  requirements: string[];
}

const jobOpenings: JobOpening[] = [
  {
    id: "eng-1",
    title: "Senior Full Stack Engineer (Next.js & Node.js)",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-Time",
    level: "Senior",
    description: "Lead the development of core marketplace workflows, real-time messaging, and high-volume transaction processing systems.",
    requirements: [
      "5+ years of production experience with TypeScript, React/Next.js, Node.js",
      "Proven track record scaling high-traffic e-commerce or marketplace applications",
      "Deep understanding of distributed systems, WebSockets, and database indexing"
    ]
  },
  {
    id: "eng-2",
    title: "Staff AI/ML Infrastructure Engineer",
    department: "Engineering",
    location: "Remote / Hybrid",
    type: "Full-Time",
    level: "Staff",
    description: "Design and implement smart recommendation engines, semantic search, and AI-powered gig matching pipelines.",
    requirements: [
      "Expertise in vector embeddings, vector databases (Pinecone, pgvector), and LLM fine-tuning",
      "Experience deploying robust inference pipelines with low latency",
      "Strong background in Python, PyTorch, and cloud containerization (K8s)"
    ]
  },
  {
    id: "prod-1",
    title: "Principal Product Manager - Marketplace Trust & Payments",
    department: "Product",
    location: "Remote",
    type: "Full-Time",
    level: "Principal",
    description: "Own the end-to-end buyer checkout experience, escrow milestones, multi-currency payouts, and anti-fraud mechanisms.",
    requirements: [
      "6+ years of product leadership in fintech, marketplace escrow, or payment gateways",
      "Data-obsessed mindset with proven experimentation and conversion optimization outcomes",
      "Exceptional communication skills across engineering, compliance, and executive teams"
    ]
  },
  {
    id: "des-1",
    title: "Senior Product Designer (Design Systems & UX)",
    department: "Design",
    location: "Remote",
    type: "Full-Time",
    level: "Senior",
    description: "Craft modern, accessible, and delightful design components across web and mobile web surfaces.",
    requirements: [
      "Portfolio showcasing end-to-end design systems for complex SaaS or consumer marketplaces",
      "Mastery of Figma, micro-interactions, prototyping, and modern typographic hierarchy",
      "Strong collaboration skills with frontend engineers"
    ]
  },
  {
    id: "mkt-1",
    title: "Growth Marketing Lead (Freelancer Community & SEO)",
    department: "Marketing",
    location: "Remote",
    type: "Full-Time",
    level: "Lead",
    description: "Drive organic creator acquisition, launch viral referral campaigns, and manage international search visibility.",
    requirements: [
      "Deep expertise in technical SEO, content loops, and affiliate growth channels",
      "Track record of scaling a two-sided marketplace user base 3x+",
      "Proficiency with analytics tools (Mixpanel, GA4, SQL)"
    ]
  },
  {
    id: "ops-1",
    title: "Global Customer Operations & Dispute Specialist",
    department: "Operations",
    location: "Remote (24/7 Coverage)",
    type: "Full-Time",
    level: "Mid-Senior",
    description: "Ensure fair mediation, resolve complex buyer-seller disputes, and maintain platform security and satisfaction.",
    requirements: [
      "3+ years experience in marketplace mediation, support operations, or trust & safety",
      "Empathetic, clear communicator with high attention to detail and sound judgment",
      "Fluency in English (additional languages are a strong plus)"
    ]
  }
];

const perks = [
  {
    icon: Globe2,
    title: "100% Remote-First",
    desc: "Work from anywhere in the world. We embrace asynchronous flexibility and focus on high-impact results."
  },
  {
    icon: Zap,
    title: "Competitive Compensation & Equity",
    desc: "Top-of-market salary packages, performance bonuses, and stock option grants so you share in our collective success."
  },
  {
    icon: Heart,
    title: "Comprehensive Health & Wellness",
    desc: "Premium medical, dental, vision coverage for you and your dependents, plus monthly wellness stipends."
  },
  {
    icon: Sparkles,
    title: "Continuous Learning Budget",
    desc: "$2,500 annual budget for conferences, courses, books, and professional coaching to accelerate your craft."
  },
  {
    icon: Users,
    title: "Bi-Annual Global Retreats",
    desc: "All-expenses-paid company summits in inspiring destinations around the globe to connect, strategize, and celebrate."
  },
  {
    icon: Shield,
    title: "Flexible Time Off & Parental Leave",
    desc: "Generous open PTO policy, paid sabbatical after 3 years, and 16 weeks of fully paid parental leave."
  }
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    fullName: "",
    email: "",
    portfolio: "",
    linkedin: "",
    notes: ""
  });

  const departments = ["All", "Engineering", "Product", "Design", "Marketing", "Operations"];

  const filteredJobs = jobOpenings.filter(
    (job) => selectedDept === "All" || job.department === selectedDept
  );

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantForm.fullName || !applicantForm.email) {
      toast.error("Please fill in required name and email.");
      return;
    }
    toast.success(`Application received for ${selectedJob?.title}! Our talent team will review within 48h.`);
    setIsApplying(false);
    setSelectedJob(null);
    setApplicantForm({ fullName: "", email: "", portfolio: "", linkedin: "", notes: "" });
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>We're Hiring Globally</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-[1.15]">
              Build the Future of <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Independent Work</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Join a high-caliber team empowering millions of skilled creators, developers, and businesses across 180+ countries to thrive on their own terms.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="#open-roles"
                className="px-7 py-3.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View Open Positions</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#values"
                className="px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] font-semibold text-sm transition-all"
              >
                Our Values & Culture
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 bg-[#0f172a] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#6ad724]">180+</div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">Countries Represented</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#10b981]">100%</div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">Distributed & Remote</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">4.9/5</div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">Employee Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#6ad724]">$2M+</div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">Annual Learning Grants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks & Benefits Section */}
      <section id="values" className="py-20 lg:py-28 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Perks & Benefits</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Designed for You to Do Your Best Work
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              We invest in our people so you can build a meaningful career without compromising your health, family, or life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs hover:border-[#327C73] hover:shadow-md transition-all duration-300 space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a]">{perk.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Roles Job Board */}
      <section id="open-roles" className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#327C73]">Join Our Team</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
                Current Openings ({filteredJobs.length})
              </h2>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedDept === dept
                      ? "bg-[#327C73] text-white shadow-xs"
                      : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Job List Cards */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 hover:border-[#327C73] hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#10b981]/10 text-[#327C73]">
                      {job.department}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600">
                      {job.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-[#327C73] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplying(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-xs transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* General Application Callout */}
          <div className="mt-12 bg-gradient-to-r from-[#f2fbf6] to-[#e6f8ef] border border-[#ceefe0] rounded-2xl p-8 text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-[#0f172a]">Don't see your role?</h3>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              We're always looking for exceptional engineers, designers, and operators. Send us your portfolio and tell us how you can make an impact.
            </p>
            <button
              onClick={() => {
                setSelectedJob({
                  id: "general",
                  title: "General Open Application",
                  department: "Any",
                  location: "Remote",
                  type: "Full-Time / Contract",
                  level: "Any Level",
                  description: "Send us your profile and tell us what you'd love to build with Workvence.",
                  requirements: ["Passion for independent work economy", "High ownership and proven track record"]
                });
                setIsApplying(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-black text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
            >
              Submit Open Application
            </button>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {isApplying && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => {
                setIsApplying(false);
                setSelectedJob(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-[#327C73] uppercase tracking-wider">
                Application Form
              </span>
              <h3 className="text-xl font-bold text-[#0f172a]">{selectedJob.title}</h3>
              <p className="text-xs text-gray-500">
                {selectedJob.department} • {selectedJob.location}
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={applicantForm.fullName}
                  onChange={(e) => setApplicantForm({ ...applicantForm, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[#327C73] focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={applicantForm.email}
                  onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                  placeholder="e.g. jane@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[#327C73] focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    LinkedIn / GitHub
                  </label>
                  <input
                    type="url"
                    value={applicantForm.linkedin}
                    onChange={(e) => setApplicantForm({ ...applicantForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[#327C73] focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Portfolio / Website
                  </label>
                  <input
                    type="url"
                    value={applicantForm.portfolio}
                    onChange={(e) => setApplicantForm({ ...applicantForm, portfolio: e.target.value })}
                    placeholder="https://yourwork.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[#327C73] focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Why Workvence? (Short note)
                </label>
                <textarea
                  rows={3}
                  value={applicantForm.notes}
                  onChange={(e) => setApplicantForm({ ...applicantForm, notes: e.target.value })}
                  placeholder="Tell us what excites you about this role..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[#327C73] focus:ring-2 focus:ring-[#10b981]/20 outline-none resize-none"
                />
              </div>

              <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer">
                <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-gray-700 block">Attach Resume (PDF, DOCX)</span>
                <span className="text-[11px] text-gray-400">Max size 10MB</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Application</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
