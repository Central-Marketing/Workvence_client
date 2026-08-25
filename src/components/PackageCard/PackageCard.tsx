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
  const sellerId = userObj._id || data.userId?._id || data.userId || data._id;
  const coverImg = data.cover || data.img || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80";

  // Rating calculation
  const rawRating = data.starNumber > 0 ? (data.totalStars / data.starNumber).toFixed(1) : (data.star || 4.9);
  const rating = data.gigRating || rawRating;
  const sales = data.sales || 0;
  const reviewCount = data.starNumber || data.reviews || 0;
  const level = userObj.sellerLevel || data.user?.sellerLevel || userObj.level || "Level 1";

  // Price formatting
  const formattedPrice = typeof data.price === "number" ? `$${data.price}` : (data.price ? `$${data.price}` : "$75");

  // Slug or fallback ID for details URL
  const packageUrl = `/package/${data.slug || data._id || data.id}`;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/seller/${username}`);
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
          <Image
            src={coverImg}
            alt={data.title || data.desc || "Package Cover"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            loading={priority ? "eager" : undefined}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            unoptimized
          />
          <div
            className="absolute top-3 right-3 z-10 flex items-center justify-center"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer overflow-hidden">
              <FavoriteButton
                gigId={data._id || data.id}
                initialIsFavorited={data.isFavorited}
                initialFavoriteCount={data.favoriteCount}
                currentUser={user}
                className="w-full h-full flex items-center justify-center"
                iconClassName="w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-6">
          <div className="flex flex-col gap-3">
            {/* Rating & Seller Level Row */}
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-normal">({sales})</span>
                <span className="text-gray-900 font-bold ml-1">{rating}</span>
                <svg className="w-4 h-4 text-amber-400 fill-amber-400 -mt-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              {/* Level Badge */}
              <div className="bg-gray-100 text-gray-700 text-[11.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-gray-200/60">
                <span>{level}</span>
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
              <Image
                src={userImg}
                width={28}
                height={28}
                alt={username}
                className="w-7 h-7 rounded-full object-cover border border-gray-200"
                unoptimized
              />
              <span className="text-[14px] font-semibold text-gray-800 group-hover/user:text-brand-green transition-colors">
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