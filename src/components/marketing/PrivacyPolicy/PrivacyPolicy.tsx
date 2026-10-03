"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminAxios from '@/utils/adminAxios';

interface ParsedSection {
  id: string;
  title: string;
  contentHtml: string;
}

const FALLBACK_POLICY_SECTIONS: ParsedSection[] = [
  {
    id: "section-1",
    title: "1. Information We Collect",
    contentHtml: "<p>We collect information that you provide directly to us, information generated when you use the Platform, and information received from third-party services.</p>",
  },
  {
    id: "section-2",
    title: "2. Communications and Messages",
    contentHtml: "<p>When you communicate with other users or Workvence through messages, orders, or support channels, we process the contents of those communications.</p>",
  },
  {
    id: "section-3",
    title: "3. Payment Information",
    contentHtml: "<p>We process transaction data, payment method references, escrow records, earnings, and withdrawal information through licensed payment processors.</p>",
  },
  {
    id: "section-4",
    title: "4. Identity Verification and KYC",
    contentHtml: "<p>To comply with legal obligations and safeguard marketplace integrity, we verify user identity using official government identification documents.</p>",
  },
  {
    id: "section-5",
    title: "5. Automatically Collected Information",
    contentHtml: "<p>When you access or use the Platform, we automatically collect technical details such as IP address, browser type, device information, and activity logs.</p>",
  },
  {
    id: "section-6",
    title: "6. Cookies and Similar Technologies",
    contentHtml: "<p>We use essential and functional cookies to ensure platform authentication, session stability, and customized preferences.</p>",
  },
  {
    id: "section-7",
    title: "7. How We Use Your Information",
    contentHtml: "<p>We use collected data to deliver marketplace services, execute orders, prevent fraud, fulfill legal requirements, and resolve customer support inquiries.</p>",
  },
  {
    id: "section-8",
    title: "8. How We Share Information",
    contentHtml: "<p>We share information with project counterparties, verified payment and infrastructure partners, and regulatory authorities when legally required.</p>",
  },
  {
    id: "section-9",
    title: "9. Data Security",
    contentHtml: "<p>We implement industry-standard TLS encryption in transit, AES encryption at rest, and strict role-based access controls to safeguard your data.</p>",
  },
  {
    id: "section-10",
    title: "10. Contact Us",
    contentHtml: "<p>If you have questions or requests regarding this Privacy Policy or your personal information, contact us at privacy@workvence.com.</p>",
  },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parsePrivacyPolicyHtml(rawHtml: string): { preamble: string; sections: ParsedSection[] } {
  if (!rawHtml || !rawHtml.trim()) {
    return { preamble: '', sections: [] };
  }

  const parts = rawHtml.split(/(?=<h2[\s>])/i);
  const sections: ParsedSection[] = [];
  let preamble = '';
  let startIndex = 0;

  if (parts.length > 0 && !parts[0].trim().toLowerCase().startsWith('<h2')) {
    preamble = parts[0]
      .replace(/<h1[\s\S]*?<\/h1>/gi, '')
      .replace(/<p>\s*<strong>\s*Last\s*Updated[\s\S]*?<\/p>/gi, '')
      .trim();
    startIndex = 1;
  }

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];
    const h2Match = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!h2Match) continue;

    const rawTitle = h2Match[1];
    const cleanTitle = decodeHtmlEntities(rawTitle.replace(/<[^>]+>/g, '')).trim();
    const contentHtml = part.substring(h2Match[0].length).trim();
    const id = `section-${sections.length + 1}`;

    sections.push({
      id,
      title: cleanTitle,
      contentHtml,
    });
  }

  return { preamble, sections };
}

const PrivacyPolicy = () => {
  const { data } = useQuery({
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

  const { preamble, sections } = useMemo(() => {
    if (data?.content) {
      const parsed = parsePrivacyPolicyHtml(data.content);
      if (parsed.sections.length > 0) {
        return parsed;
      }
    }
    return { preamble: '', sections: FALLBACK_POLICY_SECTIONS };
  }, [data?.content]);

  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || 'section-1'
  );

  const formattedDate = useMemo(() => {
    if (!data?.updatedAt) return 'September 2026';
    try {
      return new Date(data.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'September 2026';
    }
  }, [data]);

  // Scroll spy to highlight active section in TOC
  useEffect(() => {
    if (sections.length === 0) return;

    if (!sections.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const sorted = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveSectionId(sorted[0].target.id);
        }
      },
      {
        rootMargin: "-90px 0px -60% 0px",
        threshold: [0, 0.1, 0.3],
      }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, activeSectionId]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSectionId(id);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased">
      {/* Page Container */}
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-12 pb-0">
        {/* 1. Header Section */}
        <header className="flex flex-col items-start">
          {/* Last Updated Badge */}
          <div className="mt-3.5 sm:mt-4 md:mt-5 inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#F4F4F5] border border-[rgba(0,0,0,0.10)] text-[11px] sm:text-[12px] font-normal text-[#6E6E6E]">
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

        {/* 3. Main Policy Section with Sticky TOC + Content Grid */}
        <div className="mt-10 sm:mt-12 md:mt-16 pb-[80px] min-[1400px]:pb-[100px]">
          {/* Optional Intro / Preamble from Backend */}
          {preamble && (
            <div
              className="mb-8 sm:mb-12 font-inter text-[14px] text-[#475569] leading-relaxed max-w-4xl space-y-2.5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-[#112131]"
              dangerouslySetInnerHTML={{ __html: preamble }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-20 items-start">
            {/* Left Column: Sticky Section Navigation */}
            <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[90px] lg:self-start">
              <nav className="flex flex-col space-y-3.5 sm:space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-none py-0 pt-0.5">
                {sections.map((section) => {
                  const isActive = activeSectionId === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleScrollTo(section.id)}
                      className={`text-left text-[13px] sm:text-[13.5px] leading-snug transition-colors ${isActive
                        ? "text-[#112131] font-medium"
                        : "text-[#64748b] hover:text-[#112131] font-normal"
                        }`}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Right Column: Sections Content */}
            <main className="lg:col-span-8 xl:col-span-9 flex flex-col">
              {sections.map((section, idx) => (
                <article
                  key={section.id}
                  id={section.id}
                  className={`scroll-mt-24 ${idx === 0
                    ? "pt-0 border-t-0"
                    : "pt-8 sm:pt-10 border-t border-gray-200 mt-8 sm:mt-10"
                    }`}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#112131] tracking-tight mb-4 font-sf-pro mt-0">
                    {section.title}
                  </h2>

                  <div
                    className="font-inter text-[14px] text-[#475569] leading-relaxed
                      [&_p]:mb-3.5 [&_p]:leading-relaxed
                      [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#112131] [&_h3]:mt-6 [&_h3]:mb-2.5 [&_h3]:font-sf-pro
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:marker:text-slate-400
                      [&_li]:pl-1
                      [&_strong]:font-semibold [&_strong]:text-[#112131]
                      [&_a]:text-[#0D6D5F] [&_a]:underline hover:[&_a]:text-[#0b5c50]"
                    dangerouslySetInnerHTML={{ __html: section.contentHtml }}
                  />
                </article>
              ))}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

