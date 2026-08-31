import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SuspendedSeller, Loader } from "@/components";

export const metadata: Metadata = {
  title: "Seller Suspended | Workvence",
  description: "This seller profile is currently unavailable.",
};

export default function SuspendedSellerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <SuspendedSeller username="Alex Mercer" />
    </Suspense>
  );
}
