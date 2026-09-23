"use client";

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';
import { Loader } from '@/components';

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
<h2>3. Data Security & Storage</h2>
<p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.</p>
`;

const PrivacyPolicy = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: async () => {
      try {
        const res = await adminAxios.get('/system/policies/privacy');
        const content = res.data?.data?.privacyPolicy || res.data?.privacyPolicy || res.data?.content || '';
        const updatedAt = res.data?.data?.updatedAt || res.data?.updatedAt || null;
        if (content) return { content, updatedAt };
      } catch (err) {
        console.warn('Failed to fetch from /system/policies/privacy, trying /system/settings:', err);
      }

      try {
        const res = await adminAxios.get('/system/settings');
        return {
          content: res.data?.data?.privacyPolicy || res.data?.privacyPolicy || res.data?.settings?.privacyPolicy || '',
          updatedAt: res.data?.data?.updatedAt || res.data?.updatedAt || null,
        };
      } catch (err) {
        console.warn('Failed to fetch from /system/settings:', err);
        return { content: '', updatedAt: null };
      }
    }
  });

  const formattedDate = useMemo(() => {
    if (!data?.updatedAt) return 'July 2026';
    try {
      return new Date(data.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'July 2026';
    }
  }, [data?.updatedAt]);

  const displayContent = (data?.content && data.content.trim().length > 0)
    ? data.content
    : defaultPrivacyPolicy;

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased">
      {/* Page Container */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-12 pb-0">
        {/* 1. Header Section */}
        <header className="flex flex-col items-start">
          {/* Last Updated Badge */}
          <div className="mt-3.5 sm:mt-4 md:mt-5 inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#F4F4F5] border border-[#E4E4E7] text-[11px] sm:text-[12px] font-normal text-[#6E6E6E]">
            Last Updated: {formattedDate}
          </div>

          {/* Title */}
          <h1 className="mt-3 sm:mt-4 font-sf-pro font-normal text-[#292929] text-2xl sm:text-3xl md:text-4xl lg:text-[44px] tracking-tight leading-tight">
            Privacy &amp; Data Security
          </h1>

          {/* Subtitle */}
          <p className="mt-2 sm:mt-2.5 font-inter font-normal text-[#6E6E6E] text-xs sm:text-[13.5px] md:text-[14px] leading-relaxed max-w-4xl">
            Protecting your data is at the core of how we build products. This policy explains how we collect, use, and protect your personal information within the Workvence ecosystem.
          </p>
        </header>

        {/* 2. Hero Banner Image */}
        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 w-full aspect-[16/8] sm:aspect-[2.2/1] md:aspect-[44/15] rounded-[6px] overflow-hidden bg-gray-100 shadow-xs border border-black/[0.04] shrink-0">
          <img
            src="/media/privacypolicy.png"
            alt="Privacy and Data Security Banner"
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        </div>

        {/* 3. Real Dynamic Rich Text Policy Content */}
        <div className="mt-8 sm:mt-10 md:mt-12 pb-[80px] min-[1400px]:pb-[100px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader size={40} />
              <span className="font-inter text-xs sm:text-sm font-semibold text-gray-400">Loading Privacy Policy...</span>
            </div>
          ) : (
            <div
              className="quill-content-display font-inter text-sm sm:text-base text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
