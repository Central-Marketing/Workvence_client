"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { SellerPublicProfile, SuspendedSeller } from "@/components";
import { SellerProfileSkeleton } from "@/components/ui";

export default function DynamicSellerPage() {
  const params = useParams();
  const username = (params?.username as string || "Alex Mercer").toLowerCase();

  if (username === "suspended" || username === "unavailable" || username === "banned") {
    return (
      <Suspense fallback={<SellerProfileSkeleton />}>
        <SuspendedSeller username="Alex Mercer" />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<SellerProfileSkeleton />}>
      <SellerPublicProfile username={params?.username as string || "Alex Mercer"} />
    </Suspense>
  );
}
