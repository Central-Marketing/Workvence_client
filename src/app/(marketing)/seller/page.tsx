"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiHome } from "react-icons/fi";
import { MOCK_SELLERS, MockSeller } from "@/data/mockSellers";
import { SellerCard } from "@/features/profile";
import { axiosFetch } from "@/utils";

export default function AllSellersPage() {
  const [sellers, setSellers] = useState<MockSeller[]>(MOCK_SELLERS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch dynamic sellers from backend if available, fallback smoothly to MOCK_SELLERS
    axiosFetch
      .get("/users/sellers")
      .catch(() => axiosFetch.get("/users?role=seller"))
      .then(({ data }) => {
        const rawList = Array.isArray(data)
          ? data
          : data?.sellers || data?.users || data?.data || [];

        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: MockSeller[] = rawList.map((u: any, idx: number) => {
            const fallbackItem = MOCK_SELLERS[idx % MOCK_SELLERS.length];
            return {
              id: u._id || u.id || `seller-${idx}`,
              username: u.username || fallbackItem.username,
              name: u.name || (u.username ? u.username.replace(/[_-]/g, " ") : fallbackItem.name),
              role: u.role || u.shortTitle || fallbackItem.role,
              avatar: u.image || u.avatar || fallbackItem.avatar,
              rating: Number(u.rating || u.starRating || fallbackItem.rating),
              reviewCount: Number(u.reviewCount || u.totalStars || fallbackItem.reviewCount),
              badge: u.isPro ? "Pro" : fallbackItem.badge,
            };
          });
          setSellers(mapped);
        }
      })
      .catch(() => {
        // Fallback to MOCK_SELLERS
        setSellers(MOCK_SELLERS);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 pb-28 pt-4 sm:pt-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-gray-500 mb-6">
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 transition-colors flex items-center"
            title="Home"
          >
            <FiHome className="w-4 h-4" />
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 font-normal">sellers</span>
        </nav>

        {/* 2. Header Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-sf-pro text-gray-900 tracking-tight mb-1.5">
            All Seller
          </h1>
          <p className="text-sm text-gray-500 font-normal font-sf-pro">
            Find all seller in one place and select your preferred one.
          </p>
        </div>

        {/* 3. 6-Column Grid of Seller Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
          {sellers.map((seller, idx) => (
            <SellerCard key={`${seller.id}-${idx}`} seller={seller} />
          ))}
        </div>
      </div>
    </div>
  );
}
