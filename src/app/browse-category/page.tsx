// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { CategoryBrowser, RecommendedSellers, Loader } from "@/components";

export default function BrowseCategoryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <CategoryBrowser />
      <div className="bg-[#fcfcfc] min-h-screen">
        <RecommendedSellers />
      </div>
    </Suspense>
  );
}
