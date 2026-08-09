"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const PackageCard = ({ data }: { data: any }) => {
  const router = useRouter();
  if (!data) return null;

  const userImg = data.userID?.image || data.pp || "/media/noavatar.png";
  const username = data.userID?.username || data.username || "Leslie";
  const coverImg = data.cover || data.img || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80";
  
  // Rating calculation
  const rawRating = data.starNumber > 0 ? (data.totalStars / data.starNumber) : (data.star || 4.9);
  const rating = Number(rawRating).toFixed(1);
  const reviewCount = data.starNumber || data.reviews || 482;

  // Price formatting
  const formattedPrice = typeof data.price === "number" ? `$${data.price}` : (data.price ? `$${data.price}` : "$75");

  // Slug or fallback ID for details URL
  const packageUrl = `/package/${data.slug || data._id || data.id}`;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${username}`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Optional: Bookmark logic
  };

  return (
    <Link 
      href={packageUrl}
      className="block w-full bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden h-full group"
    >
      <div className="flex flex-col h-full">
        {/* Thumbnail + Bookmark Badge */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={coverImg}
            alt={data.title || data.desc || "Package Cover"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            aria-label="Bookmark package"
            onClick={handleBookmarkClick}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-6">
          <div className="flex flex-col gap-3">
            {/* Rating & Seller Level Row */}
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-normal">({reviewCount})</span>
                <span className="text-gray-900 font-bold ml-1">{rating}</span>
                <svg className="w-4 h-4 text-amber-400 fill-amber-400 -mt-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              {/* Level Badge */}
              <div className="bg-gray-100 text-gray-700 text-[11.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-gray-200/60">
                <span>Level 2</span>
                <div className="flex items-center gap-0.5 ml-0.5 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                </div>
              </div>
            </div>

            {/* Title / Description */}
            <h3 className="text-[14.5px] text-gray-600 font-normal leading-relaxed line-clamp-2 group-hover:text-gray-900 group-hover:underline transition-colors">
              {data.title || data.desc || "I will create a professional and user-friendly website design for your ..."}
            </h3>
          </div>

          {/* Card Footer: User & Price */}
          <div className="flex items-center justify-between pt-2">
            <div 
              onClick={handleProfileClick}
              className="flex items-center gap-2.5 cursor-pointer group/user"
            >
              <img
                src={userImg}
                alt={username}
                className="w-7 h-7 rounded-full object-cover border border-gray-200"
              />
              <span className="text-[14px] font-semibold text-gray-800 group-hover/user:text-[#1dbf73] transition-colors">
                {username}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[13px] text-gray-400 font-normal">From</span>
              <span className="text-[17px] font-bold text-gray-900">{formattedPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;