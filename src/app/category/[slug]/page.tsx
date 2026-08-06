// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { CategoryBrowser, Loader } from "@/components";

const CategorySlugContent = () => {
  const params = useParams();
  const slug = params?.slug ? decodeURIComponent(params.slug as string).replace(/-/g, ' ') : "Technology & Programming";

  // Map common slugs to category titles
  let title = "Technology & Programming";
  if (slug.toLowerCase().includes("design")) title = "Design";
  else if (slug.toLowerCase().includes("tech") || slug.toLowerCase().includes("programming")) title = "Technology & Programming";
  else if (slug.toLowerCase().includes("writing") || slug.toLowerCase().includes("translation")) title = "Writing & Translation";
  else if (slug.toLowerCase().includes("marketing") || slug.toLowerCase().includes("social")) title = "Digital Marketing";

  return <CategoryBrowser defaultCategory={title} />;
};

export default function CategorySlugPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <CategorySlugContent />
    </Suspense>
  );
}
