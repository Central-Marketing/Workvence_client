import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldAlert,
  FileCheck,
  Scale,
  AlertTriangle,
  HelpCircle,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import IpClaimForm from "./IpClaimForm";

export const metadata: Metadata = {
  title: "Intellectual Property & Copyright Policy | Workvence",
  description: "Workvence strictly respects the intellectual property rights of creators and brands worldwide. Review our IP guidelines or submit an official DMCA / Trademark claim.",
};

export default function IntellectualPropertyPage() {

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Scale className="w-4 h-4 text-[#10b981]" />
              <span>Trust & Legal Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Intellectual Property & Copyright Policy
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Workvence strictly respects the intellectual property rights of creators and brands worldwide. Review our IP guidelines or submit an official DMCA / Trademark claim.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles Cards */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Commercial Rights Transfer</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Unless explicitly specified otherwise in custom gig terms, once an order is marked complete and funds released from escrow, the buyer owns all intellectual property rights to the final deliverable.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Zero Tolerance for Piracy</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sellers are strictly forbidden from selling unlicensed third-party assets, cracked software, pirated code, or unauthorized copyrighted materials. Violations result in immediate suspension.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#327C73] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Fair Counter-Notice Process</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We provide a transparent counter-notification procedure compliant with Section 512(g) of the Digital Millennium Copyright Act (DMCA) in case of wrongful takedowns.
              </p>
            </div>
          </div>

          {/* Form & Guidelines Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Guidelines & FAQ (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-[#0f172a]">DMCA Notice Guidelines</h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  To file a legally binding notice of claimed infringement, please ensure you provide all required statutory information.
                </p>
              </div>

              <div className="space-y-4 text-xs text-gray-700 bg-[#f8fafc] p-6 rounded-2xl border border-gray-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#327C73] shrink-0 mt-0.5" />
                  <span>Exact URL(s) of the gig, package, or user profile on Workvence hosting the disputed material.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#327C73] shrink-0 mt-0.5" />
                  <span>Proof of copyright ownership, registration number, or authorized agency documentation.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#327C73] shrink-0 mt-0.5" />
                  <span>Valid physical or electronic signature of the copyright owner or authorized representative.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#327C73] shrink-0 mt-0.5" />
                  <span>Statement under penalty of perjury asserting the accuracy of the claim.</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2 text-xs text-amber-800">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Important Legal Notice</span>
                </div>
                <p className="leading-relaxed">
                  Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages, including attorney fees.
                </p>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700">Designated Copyright Agent Contact:</p>
                <p>Workvence Legal & Compliance Dept.</p>
                <p>Email: <span className="text-[#327C73] font-medium">copyright@workvence.com</span></p>
              </div>
            </div>

            {/* Right Column: Claim Submission Form (7 cols) */}
            <IpClaimForm />

          </div>
        </div>
      </section>
    </div>
  );
}
