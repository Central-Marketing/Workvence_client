// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';

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

const recommendedSellers = [
  {
    name: "Sarah Jenkins",
    title: "Digital marketer",
    rating: "4.9",
    reviews: "124 reviews",
    img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    username: "sarah_j"
  },
  {
    name: "Albert Flores",
    title: "Digital marketer",
    rating: "4.9",
    reviews: "124 reviews",
    img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    username: "albert_f"
  },
  {
    name: "Jenny Wilson",
    title: "Digital marketer",
    rating: "4.9",
    reviews: "124 reviews",
    img: "https://images.pexels.com/photos/3777946/pexels-photo-3777946.jpeg?auto=compress&cs=tinysrgb&w=400",
    username: "jenny_w"
  },
  {
    name: "Cody Fisher",
    title: "Digital marketer",
    rating: "4.9",
    reviews: "124 reviews",
    img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
    username: "cody_fisher"
  },
  {
    name: "Kristine Watson",
    title: "Digital marketer",
    rating: "4.9",
    reviews: "124 reviews",
    img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
    username: "kristin_w"
  },
];

const SuspendedSeller = ({ username }: { username?: string }) => {
  const displayUsername = username && username !== "undefined" && username !== "null" && username !== "suspended"
    ? decodeURIComponent(username)
    : "Alex Mercer";

  const cleanHandle = displayUsername.toLowerCase().replace(/\s+/g, "").slice(0, 10);
  const handleName = `@${cleanHandle}03`;

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-28">
      {/* Sticky Category Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/packages?category=${cat === 'All services' ? '' : encodeURIComponent(cat)}`}
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
        
        {/* TOP SECTION: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Suspended Seller Card */}
          <div className="lg:col-span-4 bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.035)]">
            
            {/* Blank Gray Avatar & Name */}
            <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200/90 relative mb-3.5 flex items-center justify-center shadow-inner">
                {/* Status indicator icon in bottom right */}
                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 absolute bottom-0 right-0 flex items-center justify-center shadow-xs">
                  <svg className="w-3.5 h-3.5 text-[#1dbf73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center tracking-tight">
                {displayUsername}
              </h1>
              <p className="text-sm sm:text-[15px] text-gray-400 text-center mt-1 font-medium">
                Digital marketer
              </p>

              {/* Badges */}
              <div className="flex items-center justify-center gap-2.5 mt-3.5 flex-wrap">
                <span className="bg-gray-100 text-gray-500 font-semibold px-3.5 py-1 rounded-full text-[12px] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317-4.66-1.647-8-6.092-8-11.317 0-.68.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Level 2 Seller</span>
                </span>

                <span className="bg-gray-100 text-gray-500 font-semibold px-3.5 py-1 rounded-full text-[12px] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                  <span>1h Response</span>
                </span>
              </div>
            </div>

            {/* Seller Metadata */}
            <div className="space-y-3.5 text-[14px] pb-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-400">
                  <span className="text-base font-semibold">@</span>
                  <span>User name</span>
                </span>
                <span className="font-semibold text-gray-800">{handleName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-400">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>From</span>
                </span>
                <span className="font-semibold text-gray-800">United States</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-400">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>Member since</span>
                </span>
                <span className="font-semibold text-gray-800">2021</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-400">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                  </svg>
                  <span>Languages</span>
                </span>
                <span className="font-semibold text-gray-800">English</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-400">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span>Last delivery</span>
                </span>
                <span className="font-semibold text-gray-800">2 Days ago</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-gray-400">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Price</span>
                </span>
                <span className="font-semibold text-gray-800">$25/hr</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Unavailable Message Card */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200/90 rounded-3xl p-10 sm:p-16 shadow-[0_4px_30px_rgba(0,0,0,0.025)] text-center flex flex-col items-center justify-center min-h-[440px]">
              
              <h2 className="text-2xl sm:text-[32px] font-semibold text-gray-900 mb-3.5 tracking-tight">
                This seller is currently unavailable
              </h2>
              
              <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed font-normal mb-10">
                This seller profile is temporarily unavailable and cannot accept new orders at this time.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                <Link
                  href="/packages?category=Digital%20Marketing"
                  className="px-7 py-3.5 bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
                >
                  Browse other sellers
                </Link>
                <Link
                  href="/"
                  className="px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-200/90 rounded-xl transition-all shadow-2xs text-sm"
                >
                  Back to marketplace
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Recommended Sellers */}
        <div className="mt-14 mb-10">
          
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-xl sm:text-[22px] font-semibold text-gray-900 tracking-tight">
              Recommended sellers
            </h3>
            <Link
              href="/packages?category=Digital%20Marketing"
              className="text-sm font-semibold text-[#1dbf73] hover:underline transition-colors"
            >
              View all experts
            </Link>
          </div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {recommendedSellers.map((seller, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.025)] hover:border-gray-300 transition-all flex flex-col items-center text-center"
              >
                {/* Green bordered circular avatar */}
                <div className="w-16 h-16 rounded-full border-2 border-[#1dbf73] p-0.5 mb-3.5 overflow-hidden shadow-2xs flex-shrink-0">
                  <img
                    src={seller.img}
                    alt={seller.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <h4 className="text-base font-semibold text-gray-900 mb-0.5 tracking-tight">
                  {seller.name}
                </h4>
                <p className="text-xs text-gray-400 font-normal mb-2.5">
                  {seller.title}
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 text-[12.5px] font-semibold text-[#1dbf73] mb-5">
                  <svg className="w-3.5 h-3.5 fill-current text-[#1dbf73]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{seller.rating}</span>
                  <span className="text-gray-400 font-normal ml-0.5">({seller.reviews})</span>
                </div>

                {/* View Profile Button */}
                <Link
                  href={`/seller/${seller.name}`}
                  className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors block text-center"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default SuspendedSeller;
