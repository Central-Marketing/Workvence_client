// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Reviews } from '@/components';

const categories = [
  "All services",
  "Technology & Programming",
  "Writing & Translation",
  "Design",
  "Digital Marketing",
  "Video, Photo & Image",
  "Business",
  "Music & Audio",
  "Social Media",
];

const portfolioProjects = [
  {
    title: "Email Marketing Automation",
    date: "From April 2026",
    desc: "My online course client needed automated email sequences to nurture leads and increase enrollment rates.",
    tags: ["Email Marketing", "3+"],
    cost: "$200-$400",
    duration: "7-10 days",
    thumb: "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=600",
    mainImage: "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "YouTube SEO & Video Growth",
    date: "From March 2026",
    desc: "Optimized video metadata, high-CTR thumbnails, and keyword ranking strategy for a SaaS tech channel.",
    tags: ["YouTube SEO", "Video Ads"],
    cost: "$300-$600",
    duration: "10-14 days",
    thumb: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600",
    mainImage: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Facebook & Instagram Lead Ads",
    date: "From February 2026",
    desc: "Built targeted conversion campaigns with custom audience retargeting, resulting in a 4.2x ROAS within two weeks.",
    tags: ["Meta Ads", "Lead Generation"],
    cost: "$450-$800",
    duration: "2 Weeks",
    thumb: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600",
    mainImage: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Google Ads Search Campaign",
    date: "From January 2026",
    desc: "Comprehensive keyword research, landing page optimization, and smart bidding strategy for an e-commerce brand.",
    tags: ["Google Ads", "SEM"],
    cost: "$500-$900",
    duration: "3 Weeks",
    thumb: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
    mainImage: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Full Stack Social Growth Strategy",
    date: "From December 2025",
    desc: "End-to-end multi-channel branding, viral hook frameworks, and community engagement for a personal branding coach.",
    tags: ["Social Media", "Growth"],
    cost: "$700-$1200",
    duration: "1 Month",
    thumb: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600",
    mainImage: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200",
  }
];

const SellerPublicProfile = ({ username }: { username?: string }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const displayUsername = username && username !== "undefined" && username !== "null"
    ? decodeURIComponent(username)
    : "Alex Mercer";

  const cleanHandle = displayUsername.toLowerCase().replace(/\s+/g, "").slice(0, 10);
  const handleName = `@${cleanHandle}03`;

  const activeProject = portfolioProjects[selectedIdx] || portfolioProjects[0];

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-28">
      {/* Sticky Category Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/gigs?category=${cat === 'All services' ? '' : encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-4 py-4 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-gray-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Seller Card */}
          <div className="lg:col-span-4 bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.035)] lg:sticky lg:top-24 transition-all">
            
            {/* Avatar & Name */}
            <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 relative mb-3.5 p-1 border border-gray-200 shadow-2xs flex-shrink-0">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt={displayUsername}
                  className="w-full h-full rounded-full object-cover"
                />
                {/* Online Dot */}
                <span className="w-4 h-4 rounded-full bg-[#1dbf73] border-2 border-white absolute bottom-1 right-1 shadow-xs" title="Online now"></span>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center tracking-tight">
                {displayUsername}
              </h1>
              <p className="text-sm sm:text-[15px] text-gray-500 text-center mt-1 font-normal">
                Digital marketer
              </p>

              {/* Badges */}
              <div className="flex items-center justify-center gap-2.5 mt-3.5 flex-wrap">
                <span className="bg-gray-100 text-gray-700 font-semibold px-3.5 py-1 rounded-full text-[12px] flex items-center gap-1.5 shadow-2xs">
                  <svg className="w-3.5 h-3.5 text-gray-600 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317-4.66-1.647-8-6.092-8-11.317 0-.68.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Level 2 Seller</span>
                </span>

                <span className="bg-gray-100 text-gray-700 font-semibold px-3.5 py-1 rounded-full text-[12px] flex items-center gap-1.5 shadow-2xs">
                  <svg className="w-3.5 h-3.5 text-gray-600 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                  <span>1h Response</span>
                </span>
              </div>
            </div>

            {/* Seller Metadata */}
            <div className="space-y-3 text-[14px] pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-500">
                  <span className="text-base font-semibold">@</span>
                  <span>User name</span>
                </span>
                <span className="font-semibold text-gray-900">{handleName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>From</span>
                </span>
                <span className="font-semibold text-gray-900">United States</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>Member since</span>
                </span>
                <span className="font-semibold text-gray-900">2021</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                  </svg>
                  <span>Languages</span>
                </span>
                <span className="font-semibold text-gray-900">English</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span>Last delivery</span>
                </span>
                <span className="font-semibold text-gray-900">2 Days ago</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Price</span>
                </span>
                <span className="font-semibold text-gray-900">$25/hr</span>
              </div>
            </div>

            {/* SKILLS */}
            <div className="py-5 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold tracking-wider text-gray-900 uppercase mb-3">
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {["Google Ads", "Content Marketing", "Email Marketing", "Lead Generation"].map((skill) => (
                  <span key={skill} className="bg-[#eaf8f0] text-[#169c5e] hover:bg-[#d5f1e1] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* SELLER PERFORMANCE */}
            <div className="py-5 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold tracking-wider text-gray-900 uppercase mb-4">
                SELLER PERFORMANCE
              </h2>

              {/* Bar 1 */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-[13px] mb-1.5">
                  <span className="font-semibold text-gray-900">Job Success Rate</span>
                  <span className="font-semibold text-[#1dbf73]">100%</span>
                </div>
                <div className="h-2 w-full bg-gray-900 rounded-full"></div>
              </div>

              {/* Bar 2 */}
              <div className="mb-2">
                <div className="flex justify-between items-center text-[13px] mb-1.5">
                  <span className="font-semibold text-gray-900">On-Time Delivery</span>
                  <span className="font-semibold text-[#1dbf73]">98%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-gray-900 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 py-6 border-b border-gray-100 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">4.9</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">248 Reviews</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">320</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Orders Completed</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <Link
                href={`/message/new?user=${displayUsername}`}
                className="flex-1 bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold py-3 px-4 rounded-xl text-sm text-center transition-all shadow-sm cursor-pointer"
              >
                Contact Seller
              </Link>
              
              <button
                type="button"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`w-11 h-11 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer shadow-2xs ${
                  isFavorited ? "text-red-500 bg-red-50/50 border-red-200" : "text-gray-400 bg-white hover:bg-gray-50"
                }`}
                title={isFavorited ? "Saved" : "Save seller"}
              >
                <svg className={`w-5 h-5 ${isFavorited ? "fill-current" : "fill-none stroke-current"}`} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Main Content Sections */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* SECTION 1: About me */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              <h2 className="text-xl sm:text-[24px] font-semibold text-gray-900 mb-4 tracking-tight">
                About me
              </h2>
              <div className="text-gray-600 text-[14.5px] sm:text-[15px] leading-relaxed font-normal space-y-4">
                <p>Hello!</p>
                <p>
                  I&apos;m Samuel Morgan, a Professional Digital Marketer specializing in YouTube SEO, Facebook Ads Manager, Google Ads Campaigns, and Social Media Management.
                </p>
                <p>
                  I partner with startups, personal brands, and businesses to boost online visibility, drive meaningful engagement, and maximize conversions through data-driven marketing strategies.
                </p>
                <div>
                  <p className="font-semibold text-gray-800 mb-1.5">My Expertise:</p>
                  <ul className="space-y-1 pl-1">
                    <li>• YouTube video ranking &amp; SEO optimization</li>
                    <li>• Facebook &amp; Instagram ad campaigns (lead generation &amp; sales)</li>
                    <li>• Google Ads (Search, Display, YouTube advertising)</li>
                    <li>• End-to-end social media management &amp; growth strategies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 2: Seller Portfolio */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              
              {/* Portfolio Header */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-xl sm:text-[24px] font-semibold text-gray-900 tracking-tight">
                  Seller Portfolio
                </h2>
                <button type="button" className="text-gray-400 hover:text-gray-900 transition-colors p-1" title="View all projects">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails Row (5 images + +15 Projects box) */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                {portfolioProjects.map((proj, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`aspect-square rounded-2xl p-1 overflow-hidden transition-all relative group cursor-pointer ${
                      selectedIdx === idx
                        ? "border-2 border-[#1dbf73] ring-2 ring-[#1dbf73]/10 bg-[#eaf8f0]/30 shadow-xs"
                        : "border border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <img src={proj.thumb} alt={proj.title} className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-105" />
                  </button>
                ))}
                
                {/* +15 Projects Card */}
                <Link
                  href={`/gigs?search=${displayUsername}`}
                  className="aspect-square bg-white border border-gray-200 hover:border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center p-2 shadow-2xs hover:bg-gray-50 transition-all group"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-[#1dbf73] transition-colors">+15</span>
                  <span className="text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5">Projects</span>
                </Link>
              </div>

              {/* Featured Project Case Study Card */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)] grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                
                {/* Left details */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block mb-1.5">
                      {activeProject.date}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2.5 tracking-tight">
                      {activeProject.title}
                    </h3>
                    <p className="text-[14px] sm:text-[14.5px] text-gray-500 leading-relaxed font-normal mb-5">
                      {activeProject.desc}
                    </p>

                    {/* Pill Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      {activeProject.tags.map((tag) => (
                        <span key={tag} className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 shadow-2xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cost & Duration footer */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">Project Cost</p>
                      <p className="text-base font-semibold text-gray-900">{activeProject.cost}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">Project duration</p>
                      <p className="text-base font-semibold text-gray-900">{activeProject.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Right image screen */}
                <div className="lg:col-span-6">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-200/80 shadow-xs relative group">
                    <img
                      src={activeProject.mainImage}
                      alt={activeProject.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* SECTION 3: Reviews */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-7 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.025)]">
              <Reviews gigID={username || "66bb31018991206112f45511"} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerPublicProfile;
