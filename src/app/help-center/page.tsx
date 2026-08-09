"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const freelancerTopics = [
  {
    title: "Getting Started",
    desc: "Profile setup, identity verification, and first steps.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 2H19v5.5"></path>
        <path d="M19 2l-9.5 9.5"></path>
        <path d="M22 11.5V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"></path>
      </svg>
    )
  },
  {
    title: "Find Work",
    desc: "Searching for jobs, submitting proposals, and interviews.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    )
  },
  {
    title: "Payments & Earnings",
    desc: "Withdrawal methods, service fees, and invoices.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    )
  },
  {
    title: "Account & Settings",
    desc: "Security settings, notifications, and profile visibility.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )
  },
  {
    title: "Trust & Safety",
    desc: "Dispute resolution, site policies, and safety tips.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )
  },
];

const clientTopics = [
  {
    title: "Post a Project",
    desc: "Writing descriptions, setting budgets, and categories.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    )
  },
  {
    title: "Hire Talent",
    desc: "Reviewing proposals, interviewing, and offers.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: "Manage Projects",
    desc: "Tracking milestones, work logs, and communication.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
    )
  },
  {
    title: "Payments & Escrow",
    desc: "Funding projects, approving milestones, and refunds.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    )
  },
  {
    title: "Client Account",
    desc: "Team management, billing history, and preferences.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    )
  }
];

const popularArticles = [
  "Creating a Professional Profile",
  "How Escrow Payments Work",
  "Account Security Best Practices",
  "Finding the Right Freelancers",
  "Managing Dispute Resolutions",
  "Verification Requirements",
  "Posting Your First Project",
  "Requesting a Refund",
  "Service Fee Structure",
];

const HelpCenter = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7] font-sans">
      <Head>
        <title>Help Center | Workvence</title>
      </Head>

      {/* 1. HERO SEARCH SECTION */}
      <section className="bg-white pt-16 pb-20 border-b border-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              How can we help you?
            </h1>
            <p className="text-[15.5px] text-gray-600 mb-8 max-w-md leading-relaxed">
              Search our knowledge base or browse support categories to quickly find answers.
            </p>

            <div className="relative max-w-xl mb-6 flex">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                className="w-full pl-12 pr-[100px] py-4 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green text-[15px] shadow-sm transition-all"
              />
              <button className="absolute right-2.5 top-2.5 bottom-2.5 bg-brand-green hover:bg-brand-green text-white px-6 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                Search
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold">
              <span className="text-gray-400 uppercase tracking-widest mr-1">Popular Searches:</span>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full transition-colors">Payment & Billing</button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full transition-colors">Escrow & Security</button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full transition-colors">Project Delivery</button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full transition-colors">Refunds</button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full transition-colors">Account Verification</button>
            </div>
          </div>

          {/* Placeholder Graphic imitating screenshot */}
          <div className="lg:col-span-5 hidden lg:flex justify-center md:justify-end">
            <div className="relative w-full max-w-[420px] aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
              <div className="absolute inset-8 bg-white rounded-xl shadow-xs border border-gray-100 p-6 flex flex-col gap-4">
                <div className="w-full h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center px-4 gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-200"></div>
                  <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                  <div className="ml-auto w-6 h-6 rounded-md bg-gray-200"></div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-2.5 w-[60%] bg-gray-200 rounded-full"></div>
                    <div className="h-2 w-[40%] bg-gray-100 rounded-full"></div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex-shrink-0 flex items-center justify-center border border-green-100"><div className="w-4 h-4 bg-brand-green rounded-full opacity-50"></div></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-2.5 w-[75%] bg-gray-200 rounded-full"></div>
                    <div className="h-2 w-[50%] bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-6 w-32 h-40 bg-green-100 rounded-t-full opacity-60 mix-blend-multiply blur-xl"></div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. MAIN CATEGORIES & SIDEBAR */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* For Freelancers Column */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">For Freelancers</h2>
                <p className="text-[14px] text-gray-500">Resources to help you build your business and manage your projects.</p>
              </div>

              <div className="flex-1">
                {freelancerTopics.map((topic, i) => (
                  <Link href="#" key={i} className="flex items-center gap-4 p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">{topic.title}</h4>
                      <p className="text-[13px] text-gray-500 line-clamp-1">{topic.desc}</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-brand-green transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-6 text-center">
                <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-[14px] hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
                  Browse Freelancer Help
                </button>
              </div>
            </div>

            {/* For Clients Column */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">For Clients</h2>
                <p className="text-[14px] text-gray-500">Tools and guides to help you find talent and scale your team.</p>
              </div>

              <div className="flex-1">
                {clientTopics.map((topic, i) => (
                  <Link href="#" key={i} className="flex items-center gap-4 p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">{topic.title}</h4>
                      <p className="text-[13px] text-gray-500 line-clamp-1">{topic.desc}</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-brand-green transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-6 text-center">
                <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-[14px] hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
                  Browse Client Help
                </button>
              </div>
            </div>

          </div>

          {/* Right Sidebar - Need More Help? */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest pl-2">Need More Help?</h3>

            <Link href="#" className="block bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 text-[15px] mb-1">Contact Support</h4>
              <p className="text-gray-500 text-[13px]">Email our expert team</p>
            </Link>

            <Link href="#" className="block bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6ad724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 text-[15px] mb-1">Live Chat</h4>
              <p className="text-gray-500 text-[13px]">Instant 1-on-1 support</p>
            </Link>
          </div>

        </div>
      </section>

      {/* 3. POPULAR ARTICLES */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-12">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Popular Articles</h2>
              <Link href="#" className="text-brand-green font-semibold text-[14px] hover:underline flex items-center gap-1.5">
                View All Articles <span className="text-lg leading-none">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
              {popularArticles.map((article, i) => (
                <Link href="#" key={i} className="text-[14.5px] text-gray-600 hover:text-brand-green font-medium transition-colors block">
                  {article}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HelpCenter;
