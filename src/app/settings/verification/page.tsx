"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import KycVerificationForm from "@/components/KycVerificationForm/KycVerificationForm";

export default function SettingsVerificationPage() {
  return (
    <PrivateRoute>
      <div className="w-full min-h-screen bg-gray-50/70 py-10 md:py-16">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Profile Settings</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs">
              <Lock size={13} className="text-brand-green" />
              <span>Identity & Security</span>
            </div>
          </div>

          <KycVerificationForm />
        </div>
      </div>
    </PrivateRoute>
  );
}
