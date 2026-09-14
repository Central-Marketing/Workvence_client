import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & Safety | Workvence",
  description: "Work safely. Build trust. Stay informed.",
};

const IMG_HERO = "/trust&safety/bg_removal [Background removed].png";
const IMG_COMMUNITY = "/trust&safety/1884482e872b3c8a657f004c91f6e80d794d34b0.jpg";
const IMG_POLICIES = "/trust&safety/ChatGPT Image Jul 7, 2026, 10_47_00 AM.png";
const IMG_SERVICES = "/trust&safety/8674d26b00b286e82436990f9025aae6f770121c.jpg";
const IMG_COMMITMENT = "/trust&safety/ChatGPT Image Jul 7, 2026, 11_03_31 AM.png";

const TrustSafetyPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* 1. HERO SECTION */}
      <section className="bg-[#f6f5ef] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-lg">
            <span className="text-[12px] font-bold tracking-widest text-gray-500 uppercase">Trust & Safety</span>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.1] text-gray-900 tracking-tight">
              Work safely<br />Build trust<br />Stay informed
            </h1>
            <p className="text-[15px] md:text-base text-gray-700 leading-relaxed font-medium">
              Workvence is built on buying and selling with trust. We ensure our community maintains a safe and inclusive environment by complying with our strict standards and robust policies.
            </p>
            <p className="text-[15px] md:text-base text-gray-700 leading-relaxed font-medium">
              Our secure escrow systems, buyer protections and identity verification (KYC) help safeguard every transaction. This is our operational cornerstone ensuring your work while we help keep the marketplace safe and trustworthy.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img src={IMG_HERO} alt="Trust Shield" className="w-full max-w-[480px] drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY STANDARDS */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src={IMG_COMMUNITY}
              alt="Community Standards Plant"
              className="w-full rounded-[32px] object-cover aspect-[4/3] shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-[36px] font-bold text-gray-900 mb-6 tracking-tight">
              Community Standards
            </h2>
            <p className="text-gray-600 text-[15px] md:text-base leading-relaxed mb-10">
              We believe that professional excellence starts with mutual respect. Our community standards govern interactions aimed at nurturing a safe and productive environment for everyone.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Professional Conduct</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Maintain clear, communicative and inclusive standards at all times.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="3"></circle></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Ethical Collaboration</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Assure intent of transparency, fairness and non-discriminatory motives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY POLICIES */}
      <section className="py-20 md:py-32 bg-[#faf9f7]">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-[36px] font-bold text-gray-900 mb-12 tracking-tight">
              Key Policies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">

              <div>
                <h4 className="font-bold text-gray-900 text-[17px] mb-2">Escrow Systems</h4>
                <p className="text-gray-500 text-[14px] leading-relaxed">Our environment uses industry standard security ensuring you remain protected when buying services.</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-[17px] mb-2">Refund Policy</h4>
                <p className="text-gray-500 text-[14px] leading-relaxed">Clear paths for mediation and resolution when projects do not meet criteria.</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-[17px] mb-2">Buyer Protection</h4>
                <p className="text-gray-500 text-[14px] leading-relaxed">Comprehensive coverage for every milestone of your project.</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-[17px] mb-2">Privacy & KYC</h4>
                <p className="text-gray-500 text-[14px] leading-relaxed">Personalized data identity verification ensuring authentic business records.</p>
              </div>

            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="bg-[#e7e7e5] rounded-[40px] w-full max-w-[440px] aspect-square flex items-center justify-center p-8 overflow-hidden">
              <img src={IMG_POLICIES} alt="Key Policies Folder" className="w-full h-auto object-contain hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. REGULATED SERVICES */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src={IMG_SERVICES}
              alt="Regulated Services Laptop"
              className="w-full rounded-[32px] object-cover aspect-[4/3] shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-[36px] font-bold text-gray-900 mb-6 tracking-tight">
              Regulated Services
            </h2>
            <p className="text-gray-600 text-[15px] md:text-base leading-relaxed mb-8">
              Certain services covering specialized domains (medical, legal, financial, etc.) will have constraints to verify regulatory standards ensuring that buyers receive completely qualified and certified professional assistance.
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-gray-900 font-semibold text-[15px]">License Verification</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-gray-900 font-semibold text-[15px]">Credential Authentication</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-gray-900 font-semibold text-[15px]">Professional Insurance Tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. OUR COMMITMENT */}
      <section className="py-20 md:py-32 bg-[#faf9f7]">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 max-w-xl">
            <h2 className="text-3xl md:text-[36px] font-bold text-gray-900 mb-12 tracking-tight">
              Our Commitment
            </h2>

            <div className="space-y-10">

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0 text-[#16a34a] mt-1 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Security & Privacy</h4>
                  <p className="text-gray-500 text-[14.5px] leading-relaxed">Protecting personal profile data, messages, and files with 256-bit AES encryption standard.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0 text-[#16a34a] mt-1 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Transparency First</h4>
                  <p className="text-gray-500 text-[14.5px] leading-relaxed">Detailed transparent terms mapping conditions, clearly identifying the flow of your pipeline.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0 text-[#16a34a] mt-1 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">KYC & Escrow</h4>
                  <p className="text-gray-500 text-[14.5px] leading-relaxed">Important milestones tied down with strict identity protections before any financial payouts are initiated.</p>
                </div>
              </div>

            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="bg-[#e5e7eb] rounded-[40px] w-full max-w-[480px] aspect-[4/3] flex items-center justify-center overflow-hidden">
              <img src={IMG_COMMITMENT} alt="Our Commitment floating cards" className="w-[85%] h-auto object-contain hover:scale-110 transition-transform duration-700 drop-shadow-xl" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default TrustSafetyPage;
