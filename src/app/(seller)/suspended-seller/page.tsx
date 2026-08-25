"use client";

import React, { Suspense } from "react";
import { SuspendedSeller, Loader } from "@/components";

export default function SuspendedSellerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <SuspendedSeller username="Alex Mercer" />
    </Suspense>
  );
}
