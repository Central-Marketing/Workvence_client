"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, PackageDetailSkeleton } from "@/components";
import {
  PackageHeaderStats,
  PackageGallery,
  PackageSectionNav,
  PackageAboutSection,
  PackageSellerSection,
  PackagePortfolioShowcase,
  PackageComparisonTable,
  PackageReviewsSection,
  PackageFaqSection,
  PackagePricingSidebar,
  normalizePackageData,
} from "@/features/package";

const PackageContent = () => {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id || params?._id;
  const _id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;

  const { user } = useUserStore((state: any) => state);
  const isSeller = Boolean(user?.isSeller);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [activeSection, setActiveSection] = useState("section-about");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [_id]);

  // Fetch package data from backend
  const { isLoading, error, data: rawApiData } = useQuery({
    queryKey: ['package', _id],
    queryFn: async () => {
      if (!_id) return null;
      try {
        const res = await axiosFetch.get(`/gigs/single/${_id}`);
        return res.data || null;
      } catch (err: any) {
        console.warn("Could not load backend gig data:", err?.message);
        return null;
      }
    },
    retry: 1,
  });

  // Normalize API data with real dynamic mapping
  const normalizedData = useMemo(() => {
    return normalizePackageData(rawApiData);
  }, [rawApiData]);

  // Fetch seller's other real packages for the showcase section
  const sellerUsername = normalizedData.seller.username;
  const { data: sellerPackagesData } = useQuery({
    queryKey: ['seller-packages', sellerUsername],
    queryFn: async () => {
      if (!sellerUsername || sellerUsername === 'Seller') return [];
      try {
        const res = await axiosFetch.get(`/gigs/seller/${sellerUsername}`);
        const gigs = Array.isArray(res.data) ? res.data : res.data?.gigs || [];
        // Filter out the currently viewed package
        return gigs.filter(
          (g: any) =>
            (g._id || g.id) !== normalizedData.id &&
            g.slug !== _id &&
            (g._id || g.id) !== _id
        );
      } catch {
        return [];
      }
    },
    enabled: Boolean(sellerUsername && sellerUsername !== 'Seller'),
  });

  useEffect(() => {
    if (rawApiData) {
      setIsFavorited(Boolean(rawApiData.isFavorited));
      setFavoriteCount(Number(rawApiData.favoriteCount || 0));
    }
  }, [rawApiData]);

  const getNavCombinedOffset = () => {
    if (typeof window === "undefined") return 190;
    const navEl = document.querySelector('nav');
    const sectionNavEl = document.getElementById('package-section-nav');
    const navHeight = navEl ? navEl.offsetHeight : (isSeller ? (window.innerWidth >= 768 ? 82 : 68) : (window.innerWidth >= 768 ? 136 : 121));
    const sectionNavHeight = sectionNavEl ? sectionNavEl.offsetHeight : 54;
    return navHeight + sectionNavHeight;
  };

  // Active section tracker on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['section-about', 'section-seller', 'section-packages', 'section-reviews', 'section-faq'];
      const scrollPos = window.scrollY + getNavCombinedOffset() + 24;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSeller]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = getNavCombinedOffset() + 16;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleContact = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const sellerObj = typeof rawApiData?.userID === 'object' ? rawApiData.userID : null;
    const sellerID = sellerObj?._id || sellerObj?.id || (typeof rawApiData?.userID === 'string' ? rawApiData.userID : null) || normalizedData.seller.id;
    const sellerUser = sellerObj?.username || normalizedData.seller.username;

    const buyerID = user?._id || user?.id;
    const buyerUsername = user?.username;

    if (!sellerID || !buyerID) {
      toast.error('User information missing to start conversation.');
      return;
    }

    if (String(sellerID) === String(buyerID) || (sellerUser && buyerUsername && sellerUser.toLowerCase() === buyerUsername.toLowerCase())) {
      toast.error('You cannot contact yourself.');
      return;
    }

    try {
      const { data: convData } = await axiosFetch.post('/conversations', {
        sellerID,
        buyerID,
        to: sellerID,
        from: buyerID,
        seller_username: sellerUser,
        buyer_username: buyerUsername,
      });

      const targetId = convData?.uuid || convData?.conversationID || convData?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
      }
    } catch (err: any) {
      try {
        const res = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
        const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id;
        if (targetId) {
          router.push(`/message/${targetId}`);
        }
      } catch {
        toast.error(err?.response?.data?.message || 'Could not start conversation');
      }
    }
  };

  const handleCheckout = (tier?: 'basic' | 'standard' | 'premium') => {
    const activeTier = tier || selectedTier;
    if (!user) {
      router.push('/login');
      return;
    }

    const sellerObj = typeof rawApiData?.userID === 'object' ? rawApiData.userID : null;
    const sellerID = sellerObj?._id || sellerObj?.id || normalizedData.seller.id;
    const buyerID = user?._id || user?.id;

    if (sellerID && buyerID && String(sellerID) === String(buyerID)) {
      toast.error("You cannot purchase your own package.");
      return;
    }

    router.push(`/pay/${_id}?tier=${activeTier}`);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }
    try {
      await axiosFetch.post(`/gigs/favorite/${_id}`);
      setIsFavorited((prev) => !prev);
      setFavoriteCount((prev) => (isFavorited ? Math.max(0, prev - 1) : prev + 1));
      toast.success(isFavorited ? "Removed from favorites" : "Saved to favorites");
    } catch {
      setIsFavorited((prev) => !prev);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return <PackageDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 pt-4 sm:pt-6 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Two-Column Layout (Left Content + Right Sticky Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 xl:gap-10 items-start">

          {/* LEFT CONTENT COLUMN */}
          <div className="w-full min-w-0">
            {/* 1. Header: Breadcrumbs, Title, Seller Bar, 4 Stat Cards */}
            <PackageHeaderStats
              title={normalizedData.title}
              categoryName={normalizedData.categoryName}
              subcategoryName={normalizedData.subcategoryName}
              seller={normalizedData.seller}
              isFavorited={isFavorited}
              favoriteCount={favoriteCount}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
            />

            {/* 2. Gallery (Real images only) */}
            <PackageGallery
              mainBanner={normalizedData.gallery[0]}
              thumbnails={normalizedData.gallery.slice(1)}
              title={normalizedData.title}
            />

            {/* Horizontal Section Navigation Pills */}
            <PackageSectionNav
              activeSection={activeSection}
              reviewCount={normalizedData.reviewsData.totalReviews}
              onNavigate={scrollToSection}
              isSeller={isSeller}
            />

            {/* Section 1: About this package */}
            <PackageAboutSection
              description={normalizedData.description}
              categoryName={normalizedData.categoryName}
              subcategoryName={normalizedData.subcategoryName}
              basicPackage={normalizedData.packages.basic}
              areaCovered={normalizedData.areaCovered}
              tools={normalizedData.tools}
              whyMe={normalizedData.whyMe}
            />

            {/* Section 2: About the Seller */}
            <PackageSellerSection
              seller={normalizedData.seller}
              onContact={handleContact}
            />

            {/* Section 3: More Services by Seller (only rendered if seller has other packages) */}
            {sellerPackagesData && sellerPackagesData.length > 0 && (
              <PackagePortfolioShowcase
                sellerPackages={sellerPackagesData}
                sellerName={normalizedData.seller.name}
              />
            )}

            {/* Section 4: Compare Packages Table */}
            <PackageComparisonTable
              packages={normalizedData.packages}
              onSelectTier={(tier) => {
                setSelectedTier(tier);
                handleCheckout(tier);
              }}
            />

            {/* Section 5: Reviews from client */}
            <PackageReviewsSection
              averageRating={normalizedData.reviewsData.averageRating}
              totalReviews={normalizedData.reviewsData.totalReviews}
              starDistribution={normalizedData.reviewsData.starDistribution}
              categoryScores={normalizedData.reviewsData.categoryScores}
              reviews={normalizedData.reviewsData.list}
            />

            {/* Section 6: Frequently asked questions */}
            {normalizedData.faqs.length > 0 && (
              <PackageFaqSection
                faqs={normalizedData.faqs}
              />
            )}
          </div>

          {/* RIGHT STICKY PRICING SIDEBAR */}
          <div
            style={{
              top: `calc(var(--navbar-height, ${isSeller ? "82px" : "136px"}) + 10px)`,
            }}
            className={`w-full sticky self-start z-20 transition-[top] duration-200 ${isSeller ? "top-[74px] md:top-[92px]" : "top-[128px] md:top-[146px]"
              }`}
          >
            <PackagePricingSidebar
              packages={normalizedData.packages}
              seller={normalizedData.seller}
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
              onContact={handleContact}
              onCheckout={handleCheckout}
              onViewSellerProfile={() => router.push(`/seller/${normalizedData.seller.username}`)}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default function PackagePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader size={45} /></div>}>
      <PackageContent />
    </Suspense>
  );
}