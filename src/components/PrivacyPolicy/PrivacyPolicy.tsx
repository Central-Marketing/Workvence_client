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

const defaultPrivacyPolicy = `
<h1>Platform Privacy Policy</h1>
<p>Welcome to Workvence. We are committed to protecting your personal information and your right to privacy.</p>
<h2>1. Information We Collect</h2>
<p>We collect personal information that you voluntarily provide to us when you register on the marketplace, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform, or otherwise when you contact us.</p>
<ul>
  <li><strong>Account Credentials:</strong> Passwords, email addresses, and security authentication data.</li>
  <li><strong>Payment & Escrow Information:</strong> Payout method details, transaction histories, and withdrawal requests.</li>
  <li><strong>Communication Records:</strong> Dispute resolution messages, support ticket threads, and seller-buyer gig deliverables.</li>
</ul>
<h2>2. How We Use Your Information</h2>
<p>We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.</p>
<ol>
  <li>To facilitate account creation and logon process.</li>
  <li>To process financial escrow releases and seller payout distributions.</li>
  <li>To enforce our terms, conditions, and policies for security and moderation purposes.</li>
</ol>
<blockquote>Workvence does not sell, rent, or lease customer data to third parties for marketing purposes.</blockquote>
<h2>3. Data Security & Storage dfsg</h2>
<p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.</p>
`;

const PrivacyPolicy = () => {
  const [activeCategory, setActiveCategory] = useState("All services");

  const { data: privacyPolicyContent, isLoading } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: async () => {
      try {
        const res = await adminAxios.get('/system/policies/privacy');
        const content = res.data?.data?.privacyPolicy || res.data?.privacyPolicy || res.data?.content || '';
        if (content) return content;
      } catch (err) {
        console.warn('Failed to fetch from /system/policies/privacy, trying /system/settings:', err);
      }

      try {
        const res = await adminAxios.get('/system/settings');
        return res.data?.data?.privacyPolicy || res.data?.privacyPolicy || '';
      } catch (err) {
        console.warn('Failed to fetch from /system/settings:', err);
        return '';
      }
    }
  });

  const displayContent = (privacyPolicyContent && privacyPolicyContent.trim().length > 0)
    ? privacyPolicyContent
    : defaultPrivacyPolicy;

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24 font-sans">
      {/* Top Category Tabs Bar */}
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

        {/* Hero Banner */}
        <div className="w-full bg-gradient-to-r from-[#f2fbf6] via-[#f7fdf9] to-[#e6f8ef] border border-[#ceefe0] rounded-3xl p-8 sm:p-12 mb-10 shadow-2xs relative overflow-hidden flex flex-wrap lg:flex-nowrap items-center justify-between gap-8">
          <div className="max-w-2xl relative z-10">
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight mb-2">
              Privacy & Data Security
            </h1>

            <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-green mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Updated Dynamically from Admin</span>
            </div>

            <p className="text-[15px] sm:text-[16px] text-gray-600 font-normal leading-relaxed">
              Protecting your data is at the core of how we build products. Below is our official Privacy Policy managed directly by the platform administration.
            </p>
          </div>

          {/* Shield Check Icon */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 text-[#21c074] opacity-90 relative z-10 mx-auto lg:mr-6">
            <svg viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
              <path d="M60 10L15 28.5V65C15 92.5 34.5 117.5 60 125C85.5 117.5 105 92.5 105 65V28.5L60 10Z" fill="#6ad724" fillOpacity="0.15" stroke="#6ad724" strokeWidth="7" strokeLinejoin="round" />
              <path d="M60 21L24 36V65C24 87.5 40 108 60 114C80 108 96 87.5 96 65V36L60 21Z" fill="#6ad724" fillOpacity="0.2" />
              <path d="M43 65L55 77L79 51" stroke="#6ad724" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Feature Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)]">
            <div className="w-11 h-11 rounded-xl bg-[#eaf8f0] text-brand-green flex items-center justify-center mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What We Collect</h3>
            <p className="text-[14.5px] text-gray-600 leading-relaxed font-normal">
              We collect data to provide better services—from your contact details to usage patterns on the platform.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)]">
            <div className="w-11 h-11 rounded-xl bg-[#eaf8f0] text-brand-green flex items-center justify-center mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Use Data</h3>
            <p className="text-[14.5px] text-gray-600 leading-relaxed font-normal">
              Your information is used to facilitate transactions, ensure security, and improve your user experience.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.025)]">
            <div className="w-11 h-11 rounded-xl bg-[#eaf8f0] text-brand-green flex items-center justify-center mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Protect You</h3>
            <p className="text-[14.5px] text-gray-600 leading-relaxed font-normal">
              We employ enterprise-grade encryption and secure escrow systems to keep your identity and funds safe.
            </p>
          </div>
        </div>

        {/* Dynamic Rich Text Policy Content Container */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.03)] mb-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader size={40} />
              <span className="text-sm font-semibold text-gray-400">Loading Privacy Policy...</span>
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

export default PrivacyPolicy;
