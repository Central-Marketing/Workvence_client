// @ts-nocheck
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { axiosFetch, getCountryFlag } from '@/utils';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader, Reviews } from '@/components';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

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

const faqData = [
  {
    question: "How does escrow payment protection work?",
    answer: "Your payment is held securely while the seller completes the order. It is released after you review and approve the agreed delivery. This ensures both parties are protected throughout the transaction lifecycle."
  },
  {
    question: "How are sellers verified?",
    answer: "Every seller goes through a manual verification process where we check their identity, professional credentials, portfolio, and work history before they can offer services on the platform."
  },
  {
    question: "What happens if a seller does not deliver?",
    answer: "If a seller fails to deliver on time or the work doesn't meet the agreed requirements, you can open a dispute. Our mediation team will review the case and ensure a fair resolution, including a full refund if necessary."
  },
  {
    question: "Can I buy a fixed-price service and also post a project?",
    answer: "Absolutely! You can browse and purchase ready-made gig packages for quick tasks, and also post custom projects to receive competitive bids from verified professionals."
  },
  {
    question: "How do sellers receive payments?",
    answer: "Once you approve the delivery, funds are released from escrow to the seller's Workvence wallet. Sellers can then withdraw to their preferred payment method, including bank transfer and PayPal."
  },
  {
    question: "Which currencies and payout methods are supported?",
    answer: "Workvence supports major currencies including USD, EUR, and GBP. Payout methods include bank transfers, PayPal, and other regional options depending on the seller's location."
  },
  {
    question: "Is Workvence available globally?",
    answer: "Yes! Workvence is available in over 90 countries. Both buyers and sellers from around the world can join and collaborate on projects across all categories."
  }
];

const GigContent = () => {
  const params = useParams();
  const router = useRouter();
  const _id = params?._id || params?.id;

  const [activeTab, setActiveTab] = useState("Description");
  const [packageTier, setPackageTier] = useState("Basic");
  const [saved, setSaved] = useState(false);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showComparisonTable, setShowComparisonTable] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ['gig', _id],
    queryFn: () => {
      if (!_id) return null;
      if (_id.toString().startsWith("rec-")) {
        return {
          _id,
          title: "I will design a professional fantasy Website Development",
          description: "Custom WordPress Website Design | SEO-Friendly, Fast & Responsive\nLooking for a modern, professional WordPress website that looks stunning and performs? You're in the right place!\n\nFREE Consultation Lets discuss your project before you order!",
          price: 100,
          cover: "/GigImages.png",
          images: [
            "/GigImages.png",
            "/gigImg.jpg",
            "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "https://images.pexels.com/photos/4146190/pexels-photo-4146190.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "/GigImages.png"
          ],
          shortTitle: "Modern business UI/UX design within 3 Days",
          shortDesc: "BASIC(Landing Page) 1 Page (Fully Custom), Mobile Responsive, Fast load, SEO, Contact Form, Consultation",
          deliveryTime: "3-day",
          revisionNumber: "Unlimited",
          features: [
            "Functional website",
            "1 page",
            "Responsive design",
            "Content upload",
            "10 plugins/extensions",
            "Payment Integration"
          ],
          starNumber: 482,
          totalStars: 2410,
          userID: { 
            username: "Leslie Alexander", 
            image: "/media/noavatar.png", 
            country: "Canada", 
            createdAt: "2023-01-10",
            description: "Web Design | SEO | Marketing"
          }
        };
      }
      return axiosFetch.get(`/gigs/single/${_id}`)
        .then(({ data }) => {
          if (data) {
            const rawImgs = Array.isArray(data.images) ? data.images : [];
            data.images = Array.from(new Set([data.cover, ...rawImgs].filter(Boolean)));
          }
          return data || null;
        })
        .catch((err) => {
          const msg = err?.response?.data?.message || "Gig not found";
          toast.error(msg);
          throw new Error(msg);
        });
    }
  });

  const country = getCountryFlag(data?.userID?.country);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size={45} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Something went wrong!</h2>
        <p className="text-gray-500 mb-6">We could not load the requested gig details.</p>
        <Link href="/gigs">
          <button className="px-6 py-2.5 bg-[#1dbf73] text-white font-bold rounded-xl shadow-sm hover:bg-[#19a463] transition-all">
            Back to Gigs
          </button>
        </Link>
      </div>
    );
  }

  const defaultFallbacks = [
    "/GigImages.png",
    "/gigImg.jpg",
    "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/4146190/pexels-photo-4146190.jpeg?auto=compress&cs=tinysrgb&w=800",
    "/GigImages.png"
  ];
  const galleryImages = Array.from(new Set([...(data.images || []), data.cover, ...defaultFallbacks].filter(Boolean))).slice(0, 6);
  const activeHeroImg = galleryImages[selectedHeroIndex] || galleryImages[0];

  const displayPrice = packageTier === "Basic" 
    ? (typeof data?.price === 'number' ? data.price : 100)
    : packageTier === "Standard"
      ? (typeof data?.price === 'number' ? data.price * 2 : 200)
      : (typeof data?.price === 'number' ? data.price * 3.5 : 350);

  const featuresList = data?.features && data.features.length > 0 ? data.features : [
    "Functional website",
    "1 page",
    "Responsive design",
    "Content upload",
    "10 plugins/extensions",
    "Payment Integration"
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-24">
      {/* Category Navigation Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/gigs?category=${cat === 'All services' ? '' : cat}`}
                className="flex-shrink-0 px-4 py-4 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-gray-900"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb & Saved Favorites Pill */}
        <div className="flex items-center justify-between py-6">
          <p className="text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:underline">Home</Link> / 
            <Link href="/gigs" className="hover:underline">Search result</Link> / 
            <span className="text-gray-900 font-semibold">Gig Details</span>
          </p>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setSaved(!saved)} 
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              title={saved ? "Remove from saved" : "Save gig"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <span className="border border-gray-200 bg-white px-3.5 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs select-none">
              {saved ? 25 : 24}
            </span>
          </div>
        </div>

        {/* Gig Title & Seller Metadata Row */}
        <div className="mb-7">
          <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-semibold text-gray-900 leading-tight tracking-tight mb-5 max-w-4xl">
            {data?.title || "I will design a professional fantasy Website Development"}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
            <div 
              onClick={() => router.push(`/profile/${data?.userID?.username || 'Leslie'}`)}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <img 
                src={data?.userID?.image || "/media/noavatar.png"} 
                alt="Seller Avatar" 
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs" 
              />
              <div>
                <h4 className="text-base font-semibold text-gray-900 group-hover:text-[#1dbf73] transition-colors">
                  {data?.userID?.username || "Leslie Alexander"}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {data?.userID?.description ? data.userID.description.slice(0, 42) : "Web Design | SEO | Marketing"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <div className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                <svg className="w-5 h-5 text-amber-400 fill-amber-400 -mt-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{!isNaN(data?.totalStars / data?.starNumber) ? (data.totalStars / data.starNumber).toFixed(1) : "5.0"}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {data?.createdAt ? `Member since ${new Date(data?.createdAt).getFullYear()}` : "3 Days Ago"}
              </span>
            </div>
          </div>
        </div>

        {/* Asymmetrical Hero Image Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          <div className="lg:col-span-8 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[430px] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
            <img 
              src={activeHeroImg} 
              alt={data?.title || "Gig hero illustration"} 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
            />
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3.5 lg:h-[430px]">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedHeroIndex(idx)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer w-full aspect-[16/10] lg:aspect-auto h-full ${
                  selectedHeroIndex === idx 
                    ? 'border-[#1dbf73] ring-2 ring-[#1dbf73]/20 shadow-sm scale-[0.98]' 
                    : 'border-transparent opacity-80 hover:opacity-100 hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-14">
            
            {/* Tab Switching Pill Bar */}
            <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-hide border border-gray-200/60 sticky top-20 z-10 shadow-2xs">
              {[
                { name: "Description", id: "section-description" },
                { name: "Seller Portfolio", id: "section-portfolio" },
                { name: "Compare Packages", id: "section-compare" },
                { name: "FAQ", id: "section-faq" },
                { name: "Review", id: "section-reviews" }
              ].map(({ name, id }) => (
                <button
                  key={name}
                  onClick={() => scrollToSection(id, name)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === name 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* 1. Description Section */}
            <div id="section-description" className="scroll-mt-32">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                Description
              </h2>
              <div className="text-gray-600 text-[15px] sm:text-base leading-relaxed whitespace-pre-line space-y-6 font-normal">
                <p>
                  {data?.description || "Custom WordPress Website Design | SEO-Friendly, Fast & Responsive\nLooking for a modern, professional WordPress website that looks stunning and performs? You're in the right place!\n\nFREE Consultation Lets discuss your project before you order!"}
                </p>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">What Sets Us Apart:</h3>
                    <ul className="space-y-2.5 text-gray-600">
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>14 Days of Post-Delivery Support</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>Free Step-by-Step Video Tutorial (How to Edit Your Site)</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>Personalized, Friendly Communication</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Why Work With Us?</h3>
                    <ul className="space-y-2.5 text-gray-600">
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>9+ Years of Experience Trusted since 2016</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>100% Custom Design Tailored to your brand</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>Fully Responsive Optimized for all devices</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Seller Portfolio Section */}
            <div id="section-portfolio" className="pt-6 border-t border-gray-100 scroll-mt-32">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
                Seller Portfolio
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
                {galleryImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                    <img src={img} alt={`Portfolio item ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-6 p-5 sm:p-6">
                <div className="sm:col-span-5 relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-900">
                  <img src={galleryImages[0] || "/GigImages.png"} alt="Featured case study" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                    Website Design
                  </div>
                </div>

                <div className="sm:col-span-7 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      Suspenseful Thriller Website design
                    </h3>
                    <p className="text-xs font-medium text-gray-400 mb-5">Since : Jan 2023</p>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 mb-4">
                      <div>
                        <span className="block text-xs text-gray-400 font-medium mb-1">Project Cost</span>
                        <span className="text-base font-semibold text-gray-800">$200-$400</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 font-medium mb-1">Project Duration</span>
                        <span className="text-base font-semibold text-gray-800">7-10 Days</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      My publishing client required a captivating thriller website design to increase conversions and reader retention.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <img src={data?.userID?.image || "/media/noavatar.png"} alt="Seller" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    <span className="text-sm font-semibold text-gray-900">{data?.userID?.username || "Leslie Alexander"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Compare Packages Banner */}
            <div id="section-compare" className="scroll-mt-32">
              <div className="bg-gray-100 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-gray-200/60 shadow-2xs">
                <span className="text-lg sm:text-[22px] font-semibold text-gray-900 tracking-tight">
                  Compare packages
                </span>
                <button 
                  type="button"
                  onClick={() => setShowComparisonTable(!showComparisonTable)}
                  className="bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {showComparisonTable ? "Hide Comparison" : "See Comparison"}
                </button>
              </div>

              {/* Expandable Comparison Table */}
              {showComparisonTable && (
                <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white animate-fadeIn">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-900 font-semibold">
                        <th className="p-4">Features & Delivery</th>
                        <th className="p-4 text-center">Basic ($100)</th>
                        <th className="p-4 text-center">Standard ($200)</th>
                        <th className="p-4 text-center">Premium ($350)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      <tr>
                        <td className="p-4 font-medium text-gray-800">Delivery Time</td>
                        <td className="p-4 text-center">3 Days</td>
                        <td className="p-4 text-center">5 Days</td>
                        <td className="p-4 text-center">7 Days</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-800">Revisions Allowed</td>
                        <td className="p-4 text-center">Unlimited</td>
                        <td className="p-4 text-center">Unlimited</td>
                        <td className="p-4 text-center">Unlimited + VIP</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-800">Functional Responsive Website</td>
                        <td className="p-4 text-center font-semibold text-[#1dbf73]">✔</td>
                        <td className="p-4 text-center font-semibold text-[#1dbf73]">✔</td>
                        <td className="p-4 text-center font-semibold text-[#1dbf73]">✔</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-800">Number of Pages</td>
                        <td className="p-4 text-center">1 Page</td>
                        <td className="p-4 text-center">5 Pages</td>
                        <td className="p-4 text-center">10+ Pages</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-800">Payment & CMS Integration</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center font-semibold text-[#1dbf73]">✔</td>
                        <td className="p-4 text-center font-semibold text-[#1dbf73]">✔</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. Frequently Asked Question (Tailwind Accordion Cards matching photo) */}
            <div id="section-faq" className="pt-6 scroll-mt-32">
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 mb-6 tracking-tight">
                Frequently Asked Question
              </h2>

              <div className="space-y-4">
                {faqData.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all hover:border-gray-300"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between text-left cursor-pointer gap-4"
                      >
                        <span className="text-[15px] sm:text-base font-semibold text-gray-900 leading-snug">
                          {item.question}
                        </span>
                        <div className="text-gray-500 flex-shrink-0">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                            {!isOpen && <line x1="12" y1="8" x2="12" y2="16"></line>}
                          </svg>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-100/80 text-[14.5px] text-gray-500 leading-relaxed font-normal">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. About The Seller Section */}
            <div className="pt-8 border-t border-gray-100">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
                About The Seller
              </h2>
              <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <img
                      src={data?.userID?.image || '/media/noavatar.png'}
                      alt={data?.userID?.username || "Seller Avatar"}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-xs"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{data?.userID?.username || "Leslie Alexander"}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">{data?.userID?.description || "Web Design | SEO | Marketing"}</p>
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span className="text-gray-800 ml-1">5.0 (482 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/messages`)}
                    className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl border border-gray-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    Contact Me
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-white rounded-xl border border-gray-200/60 text-xs sm:text-sm mb-6 shadow-2xs">
                  <div>
                    <span className="block text-gray-400 mb-1">From</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                      {data?.userID?.country || "Canada"}
                      {country?.normal && <img src={country.normal} alt="" className="w-4 h-3 rounded-2xs inline-block" />}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Member since</span>
                    <span className="font-semibold text-gray-800">
                      {data?.userID?.createdAt ? `${MONTHS[new Date(data?.userID?.createdAt).getMonth()]} ${new Date(data?.userID?.createdAt).getFullYear()}` : "Jan 2026"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Avg. response</span>
                    <span className="font-semibold text-gray-800">4 hours</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Last delivery</span>
                    <span className="font-semibold text-gray-800">1 day ago</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 mb-1">Languages</span>
                    <span className="font-semibold text-gray-800">English, Spanish</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed">
                  {data?.userID?.description || "Hi! We are digital creators and web development experts with over a decade of practical experience delivering high converting websites, modern branding UI/UX, and tailored digital experiences for global clients."}
                </p>
              </div>
            </div>

            {/* 6. Reviews Section */}
            <div id="section-reviews" className="pt-8 border-t border-gray-100 scroll-mt-32">
              <Reviews gigID={_id} />
            </div>

          </div>

          {/* RIGHT PRICING & TIER SWITCHER SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">
              
              {/* White Package Tier Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs transition-all">
                
                {/* Package Tier Selector */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1.5 rounded-xl text-center mb-6 border border-gray-200/60">
                  {["Basic", "Standard", "Premium"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setPackageTier(tier)}
                      className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        packageTier === tier 
                          ? "bg-white text-gray-900 shadow-xs" 
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                {/* Price Display */}
                <div className="mb-3">
                  <span className="text-2xl sm:text-[28px] font-semibold text-gray-900">
                    From ${displayPrice}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2">
                  {packageTier === "Basic" 
                    ? (data?.shortTitle || "Modern business UI/UX design within 3 Days")
                    : packageTier === "Standard"
                      ? "Standard Pro Bundle & Full Website Architecture"
                      : "Premium Enterprise Suite & Dedicated Priority Delivery"
                  }
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                  {packageTier === "Basic"
                    ? (data?.shortDesc || "BASIC(Landing Page) 1 Page (Fully Custom), Mobile Responsive, Fast load, SEO, Contact Form, Consultation")
                    : packageTier === "Standard"
                      ? "Up to 5 custom responsive pages, complete CMS integration, advanced SEO, speed optimization, and video tutorial."
                      : "Full 10-page e-commerce or custom platform suite, premium plugins, priority 24/7 VIP support, and commercial license."
                  }
                </p>

                {/* What's Include Checklist */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between select-none">
                    <span>What&apos;s Include?</span>
                    <span className="text-gray-400 font-normal">↘</span>
                  </div>

                  <div className="space-y-3 mb-7">
                    {featuresList.map((feature: string, index: number) => (
                      <label key={index} className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 select-none">
                        <input 
                          type="checkbox" 
                          readOnly 
                          checked={index < (packageTier === "Basic" ? 3 : packageTier === "Standard" ? 5 : 6)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1dbf73] focus:ring-0 accent-gray-400 cursor-default" 
                        />
                        <span className={index < (packageTier === "Basic" ? 3 : packageTier === "Standard" ? 5 : 6) ? "text-gray-800 font-medium" : "text-gray-400 line-through"}>
                          {feature}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Time & Revision Footer Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-800 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                      <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
                    </svg>
                    <span>
                      {String(data?.deliveryTime).toLowerCase().includes('day') ? `${data?.deliveryTime} delivery` : `${data?.deliveryTime || '3-day'} delivery`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>{data?.revisionNumber || "Unlimited"} Revisions</span>
                  </div>
                </div>

                {/* Primary Continue / Buy Plan Button */}
                <Link href={`/pay/${_id}`} className="block w-full mt-6">
                  <button className="w-full py-3.5 bg-[#1dbf73] hover:bg-[#19a463] text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-sm cursor-pointer">
                    Continue (${displayPrice})
                  </button>
                </Link>
              </div>

              {/* Separate Contact Me Button matching photo placement */}
              <button 
                type="button"
                onClick={() => router.push(`/messages`)}
                className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-2xl border border-gray-200 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Contact me</span>
                <span className="text-gray-400 font-normal">➔</span>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function GigPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader size={45} /></div>}>
      <GigContent />
    </Suspense>
  );
}