// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { getCountryFlag } from '@/utils';

const Review = (props: any) => {
  const { review } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const country = getCountryFlag(review?.userID?.country);
  const countryName = review?.userID?.country || "Switzerland";
  const avatar = review?.userID?.image || "/media/noavatar.png";
  const username = review?.userID?.username || "Nguyen, Shane";
  const rating = typeof review?.star === 'number' && review.star > 0 ? review.star : 5;
  const rawText = review?.description || "I am extremely thankful to Boniamin for the amazing work done on the cover of my book I AM A SURVIVOR. From the very beginning, he was patient, professional, and genuinely interested in understanding the message behind my book. The final cover is up to my expectations and perfectly reflects the strength and resilience portrayed throughout the chapters.";
  
  const isLong = rawText.length > 180;
  const displayDesc = isExpanded || !isLong ? rawText : `${rawText.slice(0, 180)}...`;
  
  const price = review?.price || "$200-$400";
  const duration = review?.duration || "2 Weeks";

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between h-full">
      <div>
        {/* User profile and stars header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={avatar}
              alt={username}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs flex-shrink-0"
            />
            <div>
              <h4 className="text-[16px] font-extrabold text-gray-900 leading-tight">
                {username}
              </h4>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mt-1">
                {country?.normal ? (
                  <img src={country.normal} alt="" className="w-3.5 h-2.5 rounded-2xs object-cover" />
                ) : (
                  <span className="text-[13px]">CH</span>
                )}
                <span>{countryName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm flex-shrink-0">
            <div className="flex items-center text-gray-900 gap-0.5">
              {new Array(5).fill(0).map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-0.5 text-[15px] font-extrabold">{rating}.0</span>
          </div>
        </div>

        {/* Review body paragraph */}
        <p className="text-gray-500 text-[14px] leading-relaxed mb-6 font-normal">
          {displayDesc}
          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-900 font-bold ml-1.5 transition-colors cursor-pointer inline-block"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}
        </p>
      </div>

      {/* Footer Specs: Price & Duration */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-auto">
        <div>
          <span className="block text-xs text-gray-400 font-normal mb-0.5">Price</span>
          <span className="text-[14.5px] font-bold text-gray-900">{price}</span>
        </div>
        <div className="w-[1px] h-7 bg-gray-200"></div>
        <div>
          <span className="block text-xs text-gray-400 font-normal mb-0.5">Duration</span>
          <span className="text-[14.5px] font-bold text-gray-900">{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default Review;