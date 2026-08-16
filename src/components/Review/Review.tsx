// @ts-nocheck
"use client";

import React, { useState } from 'react';
import moment from 'moment';
import { getCountryFlag } from '@/utils';

const Review = (props: any) => {
  const { review } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const country = getCountryFlag(review?.userID?.country);
  const countryName = review?.userID?.country || "Unknown Country";
  const avatar = review?.userID?.image || "/media/noavatar.png";
  const username = review?.userID?.username || "Anonymous User";
  
  // Strict binding from API payload
  const rating = typeof review?.star === 'number' && review.star >= 0 && review.star <= 5 ? review.star : 0;
  const rawText = review?.description || "No description provided.";
  
  const formattedDate = review?.createdAt
    ? moment(review.createdAt).isValid()
      ? moment(review.createdAt).fromNow()
      : String(review.createdAt)
    : null;

  const isLong = rawText.length > 180;
  const displayDesc = isExpanded || !isLong ? rawText : `${rawText.slice(0, 180)}...`;
  
  const price = review?.gigID?.price !== undefined ? `$${review.gigID.price}` : (review?.price ? (String(review.price).startsWith('$') ? review.price : `$${review.price}`) : null);
  const gigTitle = review?.gigID?.title || null;
  const duration = review?.duration || null;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between h-full w-full overflow-hidden">
      <div>
        {/* User profile and stars header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-1">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <img
              src={avatar}
              alt={username}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-[15px] font-extrabold text-gray-900 leading-tight truncate">
                {username}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-400 mt-1">
                {country?.normal ? (
                  <img src={country.normal} alt="" className="w-3.5 h-2.5 rounded-2xs object-cover shrink-0" />
                ) : (
                  <span className="text-[12px]">{countryName.slice(0, 2).toUpperCase()}</span>
                )}
                <span className="truncate max-w-[110px] sm:max-w-none">{countryName}</span>
                {formattedDate && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 whitespace-nowrap">{formattedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {rating > 0 && (
            <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs sm:text-sm shrink-0 self-start sm:self-auto pt-0.5 sm:pt-0">
              <div className="flex items-center text-amber-400 gap-0.5">
                {new Array(5).fill(0).map((_, i) => (
                  <svg key={`star-${i}`} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${i < rating ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-0.5 text-xs sm:text-sm font-extrabold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Review body paragraph */}
        <p className="text-gray-600 text-[14px] leading-relaxed mb-4 font-normal">
          {displayDesc}
          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-brand-green hover:text-brand-green font-bold ml-1.5 transition-colors cursor-pointer inline-block"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}
        </p>

        {gigTitle && (
          <p className="text-xs text-gray-400 italic mb-4 truncate">
            Service: {gigTitle}
          </p>
        )}
      </div>

      {/* Footer Specs: Price & Duration */}
      {(price || duration) && (
        <div className="flex items-center gap-6 pt-3.5 border-t border-gray-100 mt-auto">
          {price && (
            <div>
              <span className="block text-xs text-gray-400 font-normal mb-0.5">Price</span>
              <span className="text-[14px] font-bold text-gray-900">{price}</span>
            </div>
          )}
          {price && duration && <div className="w-[1px] h-7 bg-gray-200"></div>}
          {duration && (
            <div>
              <span className="block text-xs text-gray-400 font-normal mb-0.5">Duration</span>
              <span className="text-[14px] font-bold text-gray-900">{duration}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Review;