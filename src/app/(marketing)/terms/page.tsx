import React, { Suspense } from "react";
import type { Metadata } from "next";
import { TermsAndConditions, Loader } from "@/components";

export const metadata: Metadata = {
  title: "Terms & Conditions | Workvence",
  description: "Terms and conditions of service for Workvence platform.",
};

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <TermsAndConditions />
    </Suspense>
  );
}
