"use client";

import React from "react";
import Link from "next/link";
import { KycVerificationForm } from "@/components";
import { useUserStore } from "@/store/userStore";

import { ArrowLeft, Lock, Sparkles } from "lucide-react";

export default function SettingsVerificationPage() {
  const user = useUserStore((state) => state.user);

  return (
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

          {user && !user.isSeller ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-green mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Seller Verification</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Identity verification (KYC) is required for sellers to receive client payouts and activate instant withdrawals.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/register?seller=true"
                  className="px-6 py-2.5 bg-brand-green hover:bg-[#389115] text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                  Become a Seller
                </Link>
                <Link
                  href="/profile"
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-all"
                >
                  Back to Profile
                </Link>
              </div>
            </div>
          ) : (
            <KycVerificationForm />
          )}
        </div>
      </div>
  );
}
