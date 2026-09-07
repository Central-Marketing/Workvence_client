import React, { Suspense } from "react";
import type { Metadata } from "next";
import { GigsGridSkeleton, Skeleton } from "@/components";
import { getInitialPackages } from "@/services/gigService.server";
import PackagesClient from "./PackagesClient";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawSearch = params?.search;
  const search = typeof rawSearch === 'string' ? rawSearch : Array.isArray(rawSearch) ? rawSearch[0] : '';
  const rawCat = params?.category || params?.cat;
  const category = typeof rawCat === 'string' ? rawCat : Array.isArray(rawCat) ? rawCat[0] : '';

  let title = "Browse Marketplace Packages | Workvence";
  if (search) {
    title = `"${search}" - Freelance Services & Packages | Workvence`;
  } else if (category && category !== 'All services' && category !== 'Results') {
    title = `${category.replace(/-/g, ' ')} Packages | Workvence`;
  }

  return {
    title,
    description: "Discover top-rated freelancers and fixed-price service packages with escrow payment protection and fast turnaround on Workvence.",
  };
}

const PackagesPageSkeleton = () => (
  <div className="min-h-screen bg-white pb-20 animate-fadeIn">
    {/* Category Bar Skeleton */}
    <div className="w-full bg-gray-50 border-b border-gray-200/80 py-3.5 px-4 md:px-6">
      <div className="container mx-auto flex items-center gap-3 overflow-hidden">
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-36 rounded-full shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
        <Skeleton className="h-8 w-32 rounded-full shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0 hidden sm:block" />
        <Skeleton className="h-8 w-32 rounded-full shrink-0 hidden md:block" />
      </div>
    </div>

    {/* Main Container Skeleton */}
    <div className="container mx-auto px-4 md:px-6 pt-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <GigsGridSkeleton count={8} />
    </div>
  </div>
);

export default async function PackagesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const initialData = await getInitialPackages(resolvedParams);

  return (
    <Suspense fallback={<PackagesPageSkeleton />}>
      <PackagesClient initialData={initialData} />
    </Suspense>
  );
}