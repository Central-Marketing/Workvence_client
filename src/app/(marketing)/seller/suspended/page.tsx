import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SuspendedSeller, Loader } from "@/components";

export const metadata: Metadata = {
  title: "Seller Unavailable | Workvence",
  description: "This seller profile is temporarily unavailable.",
};

export default function SellerSuspendedRoute() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <SuspendedSeller username="Alex Mercer" />
    </Suspense>
  );
}
