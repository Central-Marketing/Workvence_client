import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PrivacyPolicy, Loader } from "@/components";

export const metadata: Metadata = {
  title: "Privacy Policy | Workvence",
  description: "Privacy policy and data protection on Workvence.",
};

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <PrivacyPolicy />
    </Suspense>
  );
}
