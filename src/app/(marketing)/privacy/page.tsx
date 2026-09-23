import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PrivacyPolicy, Loader } from "@/components";

export const metadata: Metadata = {
  title: "Privacy & Data Security | Workvence",
  description:
    "Protecting your data is at the core of how we build products. This policy explains how we collect, use, and protect your personal information within the Workvence ecosystem.",
};

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <PrivacyPolicy />
    </Suspense>
  );
}
