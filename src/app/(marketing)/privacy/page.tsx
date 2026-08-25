// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { PrivacyPolicy, Loader } from "@/components";

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <PrivacyPolicy />
    </Suspense>
  );
}
