// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

const categoriesList = [
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

const categorySubData: Record<string, { title: string; subtitle: string; cards: Array<{ title: string; image: string; items: string[] }> }> = {
  "Technology & Programming": {
    title: "Technology & Programming",
    subtitle: "Transform your ideas into powerful digital solutions with expert developers and cutting-edge technologies.",
    cards: [
      {
        title: "Websites",
        image: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: [
          "Website Development",
          "Website Maintenance",
          "WordPress",
          "Shopify",
          "Custom Websites"
        ]
      },
      {
        title: "Application Development",
        image: "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: [
          "Full Stack Web Apps",
          "Desktop Applications",
          "Game Development",
          "Chatbot Development",
          "Browser Extensions"
        ]
      },
      {
        title: "Software Development",
        image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: [
          "Software Development",
          "AI Development",
          "APIs & Integrations",
          "Scripting",
          "Plugins Development"
        ]
      },
      {
        title: "Website Platforms",
        image: "https://images.pexels.com/photos/196659/pexels-photo-196659.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: [
          "Wix",
          "Webflow",
          "GoDaddy",
          "Squarespace",
          "WooCommerce"
        ]
      },
      {
        title: "Vibe Coding",
        image: "https://images.pexels.com/photos/7988086/pexels-photo-7988086.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: [
          "Development & MVP",
          "Troubleshooting & Improvements",
          "Deployments & DevOps",
          "Consultation & Training"
        ]
      },
      {
        title: "Support & Cybersecurity",
        image: "https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: [
          "Support & IT",
          "Cloud Computing",
          "DevOps Engineering",
          "Cybersecurity",
          "Development for Streamers"
        ]
      }
    ]
  },
  "Design": {
    title: "Design & Creative Studio",
    subtitle: "Bring your vision to life with award-winning UI/UX brand identities, illustrations, and digital crafts.",
    cards: [
      {
        title: "Brand & Logo Design",
        image: "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: ["Logo Design", "Brand Guidelines", "Business Cards", "Typography & Fonts", "Complete Branding Suite"]
      },
      {
        title: "UI & UX Prototyping",
        image: "https://images.pexels.com/photos/196659/pexels-photo-196659.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: ["Mobile App Design", "Website UI Design", "Interactive Figma Prototypes", "Wireframe Systems", "Design Audits"]
      },
      {
        title: "Digital Illustration",
        image: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=800",
        items: ["Custom Characters", "Book Covers & Editorial", "Storyboards & Comics", "Vector Artworks", "NFT & Crypto Art"]
      }
    ]
  }
};

const CategoryBrowser = ({ defaultCategory = "Technology & Programming" }: { defaultCategory?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCat = searchParams?.get("cat") || defaultCategory;

  const [activeCategory, setActiveCategory] = useState(paramCat);
  const [currentPage, setCurrentPage] = useState(1);

  const activeData = categorySubData[activeCategory] || {
    ...categorySubData["Technology & Programming"],
    title: activeCategory === "All services" ? "All Marketplace Categories" : activeCategory,
    subtitle: `Explore verified talent, freelance professionals, and high-quality services across ${activeCategory}.`
  };

  const handleSubitemClick = (sub: string) => {
    router.push(`/gigs?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(sub)}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24">
      {/* Sticky Category Tabs Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categoriesList.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-4 text-[13.5px] font-semibold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                    isSelected 
                      ? "text-gray-900 border-gray-900 font-extrabold" 
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-10">
        
        {/* Hero Category Banner */}
        <div className="w-full bg-gradient-to-r from-[#f2fbf6] via-[#f7fdf9] to-[#e6f8ef] border border-[#ceefe0] rounded-3xl p-8 sm:p-12 mb-14 shadow-2xs relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight mb-3">
              {activeData.title}
            </h1>
            <p className="text-[15px] sm:text-[17px] text-gray-600 font-normal leading-relaxed mb-8 max-w-2xl">
              {activeData.subtitle}
            </p>

            <button
              type="button"
              onClick={() => router.push('/gigs')}
              className="bg-white border border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 rounded-xl px-5 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] inline-flex items-center gap-3 font-extrabold text-gray-800 text-sm transition-all cursor-pointer group"
            >
              <span className="w-7 h-7 rounded-lg bg-[#1dbf73] flex items-center justify-center text-white text-xs font-bold group-hover:bg-[#19a463] transition-colors shadow-xs">
                ▷
              </span>
              <span>How workvence works</span>
            </button>
          </div>
        </div>

        {/* Subcategories Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-semibold text-gray-900 tracking-tight">
            Explore our {activeData.title}
          </h2>
          <button 
            type="button"
            onClick={() => router.push(`/gigs?category=${encodeURIComponent(activeCategory)}`)}
            className="font-extrabold text-gray-800 text-sm hover:text-[#1dbf73] transition-colors border-b-2 border-gray-800 hover:border-[#1dbf73] pb-0.5 cursor-pointer"
          >
            Show All
          </button>
        </div>

        {/* 3-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-16">
          {activeData.cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-[0_2px_18px_rgba(0,0,0,0.03)] hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header Image */}
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100 mb-5 relative group">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3.5 tracking-tight">
                  {card.title}
                </h3>

                {/* Subcategory List Items */}
                <ul className="space-y-2.5 mb-6">
                  {card.items.map((sub, sIdx) => {
                    const isLast = sIdx === card.items.length - 1;
                    return (
                      <li key={sIdx}>
                        <button
                          type="button"
                          onClick={() => handleSubitemClick(sub)}
                          className="w-full text-left text-[14px] sm:text-[14.5px] text-gray-500 hover:text-gray-900 hover:font-semibold transition-all flex items-center justify-between group/item cursor-pointer py-0.5"
                        >
                          <span className="truncate pr-2">{sub}</span>
                          {isLast ? (
                            <span className="text-gray-300 group-hover/item:text-gray-900 font-bold text-base transition-colors flex-shrink-0">
                              ➔
                            </span>
                          ) : (
                            <span className="text-transparent group-hover/item:text-gray-400 font-bold text-xs transition-colors flex-shrink-0">
                              ➔
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination & Display Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-gray-100 pt-8 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>Showing</span>
            <span className="bg-gray-100 border border-gray-200/80 rounded-lg px-3 py-1 font-extrabold text-gray-800 shadow-2xs select-none">
              11 ⌄
            </span>
            <span>Out of 1,450</span>
          </div>

          <div className="flex items-center gap-2 select-none">
            <button 
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="font-semibold text-gray-400 hover:text-gray-800 disabled:opacity-40 transition-colors mr-3 cursor-pointer disabled:cursor-default flex items-center gap-1"
            >
              <span>&lt;</span> Previous
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                  currentPage === page 
                    ? "bg-[#1dbf73] text-white shadow-xs" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <span className="text-gray-400 px-1">...</span>

            <button
              onClick={() => setCurrentPage(16)}
              className={`w-9 h-9 rounded-lg font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                currentPage === 16 
                  ? "bg-[#1dbf73] text-white shadow-xs" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              16
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(16, p + 1))}
              className="font-extrabold text-gray-800 hover:text-[#1dbf73] transition-colors ml-3 cursor-pointer flex items-center gap-1"
            >
              Next <span>&gt;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryBrowser;
