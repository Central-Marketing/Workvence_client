// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';
import Loader from '../Loader/Loader';

const categories = [
  "All services",
  "Technology & Programming",
  "Writing & Translation",
  "Design",
  "Digital Marketing",
  "Video, Photo & Image",
  "Business",
  "Music & Audio",
  "Social Media",
];

const defaultTermsAndConditions = `
<h1>Terms & Conditions of Service</h1>
<p>Please read these Terms of Service carefully before using the Workvence platform operated by our team.</p>
<h2>1. Seller & Buyer Marketplace Obligations</h2>
<p>By accessing or using the platform, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
<ul>
  <li>Sellers must deliver completed gig assets strictly within the agreed timeline.</li>
  <li>Buyers must review delivered milestones within the 7-day auto-complete inspection window.</li>
  <li>Off-platform payments or sharing external contact details (WhatsApp, direct email) is strictly prohibited.</li>
</ul>
<h2>2. Dispute Resolution & Escrow Rules</h2>
<p>Workvence provides an automated dispute resolution protocol to mediate buyer refund requests and seller payout claims fairly.</p>
<ol>
  <li>Support tickets can be escalated to formal disputes after 24 hours of seller inactivity.</li>
  <li>Admin decisions regarding split payouts or full refunds are final and binding.</li>
</ol>
<blockquote>All escrow funds are securely held until milestone sign-off or official admin dispute determination.</blockquote>
`;

const TermsAndConditions = () => {
  const [activeCategory, setActiveCategory] = useState("All services");

  const { data: termsContent, isLoading } = useQuery({
    queryKey: ['terms-and-conditions'],
    queryFn: async () => {
      try {
        const res = await adminAxios.get('/system/policies/terms');
        const content = res.data?.data?.termsAndConditions || res.data?.termsAndConditions || res.data?.content || '';
        if (content) return content;
      } catch (err) {
        console.warn('Failed to fetch from /system/policies/terms, trying /system/settings:', err);
      }

      try {
        const res = await adminAxios.get('/system/settings');
        return res.data?.data?.termsAndConditions || res.data?.termsAndConditions || '';
      } catch (err) {
        console.warn('Failed to fetch from /system/settings:', err);
        return '';
      }
    }
  });

  const displayContent = (termsContent && termsContent.trim().length > 0)
    ? termsContent
    : defaultTermsAndConditions;

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24 font-sans">
      {/* Category Tabs Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/packages?category=${cat === 'All services' ? '' : encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-4 py-4 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-gray-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-10">

        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-lg relative overflow-hidden flex flex-wrap lg:flex-nowrap items-center justify-between gap-8">
          <div className="max-w-2xl relative z-10">
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold tracking-tight mb-3">
              Terms & Conditions
            </h1>

            <div className="flex items-center gap-2 text-sm font-semibold text-brand-green mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              <span>Updated Dynamically from Admin</span>
            </div>

            <p className="text-[15px] sm:text-[16px] text-slate-300 font-normal leading-relaxed">
              These terms govern your relationship with Workvence, your rights, responsibilities, and escrow project protections.
            </p>
          </div>
        </div>

        {/* Dynamic Rich Text Terms Content Container */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.03)] mb-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader size={40} />
              <span className="text-sm font-semibold text-gray-400">Loading Terms & Conditions...</span>
            </div>
          ) : (
            <div
              className="quill-content-display text-gray-700 text-[15px] sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
