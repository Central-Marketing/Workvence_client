"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useUserStore } from "@/store/userStore";
import { FavoriteButton } from "@/components";

const PackageCard = ({ data, priority = false }: { data: any; priority?: boolean }) => {
  const router = useRouter();
  const { user } = useUserStore((state: any) => state);
  if (!data) return null;

  const userObj = data.user || data.userId || data.userID || {};
  const userImg = userObj.image || data.pp || "/media/noavatar.png";
  const username = userObj.username || data.username || "Seller";
  const coverImg = data.cover || data.img || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80";

  // Rating calculation
  const rawRating = data.starNumber > 0 ? (data.totalStars / data.starNumber).toFixed(1) : (data.star || 4.9);
  const rating = data.gigRating || rawRating;
  const reviewCount = data.starNumber || data.reviews || data.sales || 57;

  // Price formatting
  const formattedPrice =
    typeof data.price === "number"
      ? `$${data.price}`
      : data.price
      ? String(data.price).startsWith("$")
        ? data.price
        : `$${data.price}`
      : "$150";

  // Slug or fallback ID for details URL
  const packageUrl = `/package/${data.slug || data._id || data.id}`;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/seller/${username}`);
  };

  return (
    <Link
      href={packageUrl}
      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-300 transition-all duration-300"
    >
      {/* Top Image + Overlapping Avatar */}
      <div className="relative w-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={coverImg}
            alt={data.title || data.desc || "Package Cover"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            loading={priority ? "eager" : undefined}
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            unoptimized
          />

          {/* Favorite Button (Subtle & visible on hover or if already favorited) */}
          <div
            className={`absolute top-2.5 right-2.5 z-10 transition-opacity duration-200 ${
              data.isFavorited ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all cursor-pointer">
              <FavoriteButton
                gigId={data._id || data.id}
                initialIsFavorited={data.isFavorited}
                initialFavoriteCount={data.favoriteCount}
                currentUser={user}
                className="w-full h-full flex items-center justify-center"
                iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
            </div>
          </div>
        </div>

        {/* Circular Avatar Overlapping Bottom Edge */}
        <div
          onClick={handleProfileClick}
          className="absolute -bottom-4 left-3 sm:left-3.5 z-10 cursor-pointer"
          title={username}
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 hover:opacity-95 transition-opacity">
            <Image
              src={userImg}
              alt={username}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 pt-6 sm:pt-7">
        {/* Row 1: Seller Name (left) & Rating (right) */}
        <div className="flex items-center justify-between gap-2">
          <span
            onClick={handleProfileClick}
            className="font-bold text-gray-900 text-[15px] sm:text-[15.5px] hover:underline cursor-pointer truncate max-w-[65%]"
          >
            {username}
          </span>

          <div className="flex items-center gap-1 text-[13.5px] sm:text-[14px] shrink-0">
            <span className="text-gray-500 font-normal">({reviewCount})</span>
            <span className="text-gray-900 font-bold ml-0.5">{rating}</span>
            <svg
              className="w-3.5 h-3.5 text-[#F4AA1C] fill-[#F4AA1C] ml-0.5 -mt-0.5"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        {/* Row 2: Title / Description */}
        <h3 className="mt-3 text-[14.5px] sm:text-[15px] text-[#62646A] font-normal leading-[1.4] line-clamp-2 min-h-[42px] group-hover:text-gray-900 transition-colors">
          {data.title || data.desc || "I will design,redesign business wordpress website as divi expert"}
        </h3>

        {/* Row 3: Starting from $Price (Aligned to the bottom-left) */}
        <div className="flex items-baseline gap-2 mt-auto pt-6 pb-0.5">
          <span className="text-[14px] sm:text-[14.5px] text-[#62646A] font-normal">Starting from</span>
          <span className="text-[18px] sm:text-[19px] font-bold text-gray-900 leading-none">{formattedPrice}</span>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;