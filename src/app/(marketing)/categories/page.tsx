"use client";

import React, { Suspense } from "react";
import { CategoryHubDirectory } from "@/components";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-800 pt-5 sm:pt-7 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-8" role="status">
              <span className="sr-only">Loading categories</span>
              <div className="w-full max-w-[1760px] mx-auto aspect-[1760/500] max-h-[500px] min-h-[220px] rounded-[6px] bg-gray-200" />
              <div className="h-10 w-full bg-gray-200/80 rounded-[6px]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-[86px] bg-gray-200/80 rounded-[6px]" />
                ))}
              </div>
            </div>
          }
        >
          <CategoryHubDirectory mode="categories" />
        </Suspense>
      </div>
    </div>
  );
}
