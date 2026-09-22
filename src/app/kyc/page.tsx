"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import moment from "moment";
import { KycVerificationForm, Loader } from "@/components";
import { useUserStore } from "@/store/userStore";
import kycService from "@/utils/kycService";

export default function KycPage() {
  const user = useUserStore((state) => state.user);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => kycService.getKycStatus(),
    staleTime: 30000,
  });

  const kyc = statusData?.kyc;
  const isKycVerified = Boolean(
    statusData?.isKycVerified || kyc?.status === "approved"
  );
  const isPending = kyc?.status === "pending";

  const docTypeLabel =
    kyc?.documentType === "passport"
      ? "Passport"
      : kyc?.documentType === "nid"
        ? "National ID"
        : kyc?.documentType === "driving_license"
          ? "Driver's License"
          : kyc?.documentType
            ? kyc.documentType.charAt(0).toUpperCase() + kyc.documentType.slice(1)
            : "Passport";

  const lastDigits = kyc?.documentNumber
    ? kyc.documentNumber.slice(-4)
    : "9023";
  const docMasked = `${docTypeLabel}*****${lastDigits}`;

  const legalName =
    kyc?.legalFullName || user?.name || user?.username || "Jamshed Mojumder";
  const countryName = kyc?.country || user?.country || "United States";
  const verifiedDateStr = kyc?.reviewedAt
    ? moment(kyc.reviewedAt).format("MMM D, YYYY")
    : kyc?.updatedAt
      ? moment(kyc.updatedAt).format("MMM D, YYYY")
      : "Aug 22, 2026";

  const submittedDateStr = kyc?.createdAt
    ? moment(kyc.createdAt).format("MMM D, YYYY")
    : moment().format("MMM D, YYYY");

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      <div className="container mx-auto px-4 md:px-6 space-y-7">

        {/* 2. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-inter font-medium text-[#292929]">
              ID Verification
            </h1>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1 max-w-2xl font-inter">
              Update your personal information, professional details, and portfolio.
            </p>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <span className="border border-gray-200 text-gray-800 text-xs font-semibold px-4 py-1.5 rounded-full bg-white shadow-2xs inline-flex items-center">
              256-Bit Encryption Verification
            </span>
          </div>
        </div>

        {/* 3. Main Content Area */}
        {isLoading ? (
          <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-12 flex flex-col items-center justify-center min-h-[320px]">
            <Loader size={40} />
            <p className="mt-4 text-xs font-medium text-gray-500">
              Checking verification status...
            </p>
          </div>
        ) : isKycVerified ? (
          /* ── STATE A: VERIFIED (Design Screenshot Match) ── */
          <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-4 pb-2">
              <div className="flex items-baseline flex-wrap gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
                  Identity Verified
                </h2>
                <span className="text-xs font-medium text-gray-500">
                  Verified on {verifiedDateStr}
                </span>
              </div>

              <span className="bg-[#E6F7F3] text-[#0D6D5F] text-xs font-semibold px-4 py-1 rounded-full shrink-0">
                Verified
              </span>
            </div>

            {/* 3-Column Info Box */}
            <div className="border border-gray-200/90 rounded-[6px] p-5 sm:p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-5 md:gap-0">
                {/* Legal Name */}
                <div className="md:pr-6 space-y-1">
                  <span className="text-xs font-medium text-gray-500 block">
                    Legal Name
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                    {legalName}
                  </p>
                </div>

                {/* Verified Document */}
                <div className="pt-4 md:pt-0 md:px-6 space-y-1">
                  <span className="text-xs font-medium text-gray-500 block">
                    Verified Document
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                    {docMasked}
                  </p>
                </div>

                {/* Issuing Country */}
                <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
                  <span className="text-xs font-medium text-gray-500 block">
                    Issuing Country
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                    {countryName}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Privilege Box */}
            <div className="bg-[#F4FBF9] border border-[#D5EFEA] rounded-[6px] p-5 space-y-1">
              <div className="flex items-center gap-2 text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-[#0D6D5F] shrink-0 stroke-[2.2]" />
                <h4 className="text-xs sm:text-sm font-bold">
                  Full Seller Privileges Active
                </h4>
              </div>
              <p className="text-xs text-gray-500 pl-6 leading-relaxed">
                Your account has full seller privileges instant payout access.
              </p>
            </div>
          </div>
        ) : isPending ? (
          /* ── STATE B: PENDING REVIEW ── */
          <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-2">
              <div className="flex items-baseline flex-wrap gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
                  Verification In Progress
                </h2>
                <span className="text-xs font-medium text-gray-500">
                  Submitted on {submittedDateStr}
                </span>
              </div>

              <span className="bg-[#FEF6E7] text-[#D97706] text-xs font-semibold px-4 py-1 rounded-full shrink-0">
                Pending Review
              </span>
            </div>

            {/* 3-Column Info Box */}
            <div className="border border-gray-200/90 rounded-[6px] p-5 sm:p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-5 md:gap-0">
                <div className="md:pr-6 space-y-1">
                  <span className="text-xs font-medium text-gray-500 block">
                    Legal Name
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                    {legalName}
                  </p>
                </div>
                <div className="pt-4 md:pt-0 md:px-6 space-y-1">
                  <span className="text-xs font-medium text-gray-500 block">
                    Document Submitted
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                    {docMasked}
                  </p>
                </div>
                <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
                  <span className="text-xs font-medium text-gray-500 block">
                    Issuing Country
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                    {countryName}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Alert Box */}
            <div className="bg-[#FFFBF2] border border-[#FDE6B8] rounded-[6px] p-5 space-y-1">
              <div className="flex items-center gap-2 text-gray-900">
                <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold">
                  Under Review by Workvence Compliance
                </h4>
              </div>
              <p className="text-xs text-gray-500 pl-6 leading-relaxed">
                Your submission is currently being reviewed. Reviews typically take 24–48 hours. You will be notified as soon as your identity is verified.
              </p>
            </div>
          </div>
        ) : user && !user.isSeller ? (
          /* ── STATE C: BUYER ONLY PROMPT ── */
          <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-[6px] bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0D6D5F] mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Seller Verification</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Identity verification (KYC) is required for sellers to receive client payouts and activate instant withdrawals.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/register?seller=true"
                className="px-6 py-2.5 bg-black hover:bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-[6px] transition-all shadow-2xs"
              >
                Become a Seller
              </Link>
              <Link
                href="/profile"
                className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold rounded-[6px] transition-all"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        ) : (
          /* ── STATE D: UNVERIFIED / REJECTED FORM ── */
          <div className="bg-white rounded-[6px] border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            <KycVerificationForm />
          </div>
        )}
      </div>
    </div>
  );
}
