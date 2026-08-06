// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { CategoryBrowser, Loader } from "@/components";

export default function BrowseCategoryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <CategoryBrowser />
    </Suspense>
  );
}
