// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { SellerPublicProfile, SuspendedSeller, Loader } from "@/components";

export default function DynamicProfilePage() {
  const params = useParams();
  const username = (params?.username as string || "Alex Mercer").toLowerCase();

  if (username === "suspended" || username === "unavailable" || username === "banned") {
    return (
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
        <SuspendedSeller username="Alex Mercer" />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <SellerPublicProfile username={params?.username as string || "Alex Mercer"} />
    </Suspense>
  );
}
