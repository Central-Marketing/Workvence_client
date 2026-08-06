// @ts-nocheck
"use client";

import React, { Suspense } from "react";
import { TermsAndConditions, Loader } from "@/components";

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white"><Loader size={45} /></div>}>
      <TermsAndConditions />
    </Suspense>
  );
}
