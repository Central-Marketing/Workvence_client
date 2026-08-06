// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { SellerPublicProfile, Loader } from "@/components";

export default function SellerRootPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <SellerPublicProfile username="Alex Mercer" />
    </Suspense>
  );
}
