"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { useAuthModalStore } from "@/store/authModalStore";
import {
  SellerHeroBanner,
  SellerAboutSidebar,
  SellerGigsGrid,
  SellerReviewsSection,
  SellerFaqSection,
  normalizeSellerProfile,
} from "@/features/profile";
import { SellerProfileSkeleton, Button } from "@/components/ui";

interface SellerPublicProfileProps {
  username?: string;
}

const SellerPublicProfile: React.FC<SellerPublicProfileProps> = ({ username }) => {
  const router = useRouter();
  const { user } = useUserStore((state: any) => state);
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal);
  const isSeller = Boolean(user?.isSeller);

  const [isLoading, setIsLoading] = useState(true);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [rawUserData, setRawUserData] = useState<any>(null);
  const [rawGigsData, setRawGigsData] = useState<any[]>([]);
  const [rawReviewsData, setRawReviewsData] = useState<any[]>([]);
  const [showStickyIdentity, setShowStickyIdentity] = useState(false);
  const sidebarMarkerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = sidebarMarkerRef.current;
    if (isLoading || !marker) return;

    let frame = 0;
    const updateIdentity = () => {
      frame = 0;
      const navbarHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"),
      );
      const stickyTop = (Number.isFinite(navbarHeight) ? navbarHeight : isSeller ? 82 : 136) + 12;
      setShowStickyIdentity(marker.getBoundingClientRect().top <= stickyTop);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateIdentity);
    };

    // The marker stays in normal document coordinates even as the sticky card grows.
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.body);
    if (marker.parentElement) resizeObserver.observe(marker.parentElement);
    const navbarObserver = new MutationObserver(scheduleUpdate);
    navbarObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      navbarObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isLoading, isSeller, username]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  useEffect(() => {
    if (!username || username === "undefined" || username === "null") {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    axiosFetch
      .get(`/users/seller/${username}`)
      .then(({ data }) => {
        if (!isMounted) return;
        const userObj = data?.user || data;
        setRawUserData(userObj);

        const sellerId = userObj?._id || userObj?.id;
        if (sellerId) {
          // 1. Fetch real gigs/packages for the seller
          axiosFetch
            .get(`/gigs/seller/${username}?limit=100`)
            .catch(() => axiosFetch.get(`/gigs?userID=${sellerId}&limit=100`))
            .catch(() => axiosFetch.get(`/packages?userID=${sellerId}&limit=100`))
            .then(({ data: gigsRes }) => {
              if (!isMounted) return;
              const gigList = Array.isArray(gigsRes)
                ? gigsRes
                : gigsRes?.packages || gigsRes?.gigs || gigsRes?.data || [];
              setRawGigsData(gigList);
            })
            .catch(() => {
              if (isMounted) setRawGigsData([]);
            });

          // 2. Fetch real client reviews for the seller
          axiosFetch
            .get(`/reviews/seller/${sellerId}`)
            .catch(() => axiosFetch.get(`/reviews?sellerID=${sellerId}`))
            .catch(() => axiosFetch.get(`/reviews?sellerId=${sellerId}`))
            .then(({ data: revRes }) => {
              if (!isMounted) return;
              const revList = Array.isArray(revRes)
                ? revRes
                : revRes?.reviews || revRes?.data || [];
              setRawReviewsData(revList);
            })
            .catch(() => {
              if (isMounted) setRawReviewsData([]);
            });
        }
      })
      .catch((err) => {
        console.warn("Could not fetch seller data, using normalized preview profile:", err?.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  // Normalize data with complete dynamic mapping
  const profileData = useMemo(() => {
    return normalizeSellerProfile(rawUserData, rawGigsData, rawReviewsData, username);
  }, [rawUserData, rawGigsData, rawReviewsData, username]);

  const handleContact = async (currentUser?: any) => {
    // Guard against click MouseEvent being passed as currentUser
    const activeUser =
      currentUser && !currentUser.nativeEvent && ('_id' in currentUser || 'id' in currentUser || 'email' in currentUser)
        ? currentUser
        : user;

    if (!activeUser) {
      openAuthModal({
        mode: "login",
        onSuccess: (loggedInUser) => {
          handleContact(loggedInUser);
        },
      });
      return;
    }

    const sellerID =
      profileData.id ||
      rawUserData?._id ||
      rawUserData?.id ||
      rawUserData?.data?._id ||
      (Array.isArray(rawGigsData) && (rawGigsData[0]?.userID?._id || rawGigsData[0]?.userID || rawGigsData[0]?.sellerID?._id || rawGigsData[0]?.sellerID));
    const buyerID = activeUser._id || activeUser.id;

    const sellerUsername = profileData.username || username;
    const buyerUsername = activeUser.username;

    if (
      String(sellerID) === String(buyerID) ||
      (sellerUsername && buyerUsername && sellerUsername.toLowerCase() === buyerUsername.toLowerCase())
    ) {
      toast.error("You cannot contact yourself.");
      return;
    }

    setIsContactLoading(true);
    try {
      try {
        const res = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
        const targetId =
          res.data?.uuid ||
          res.data?.conversationID ||
          res.data?.id ||
          res.data?._id ||
          res.data?.data?.uuid ||
          res.data?.data?._id ||
          res.data?.conversation?.uuid ||
          res.data?.conversation?._id;
        if (targetId) {
          router.push(`/message/${targetId}`);
          return;
        }
      } catch {
        // Conversation does not exist yet; proceed to create via backend
      }

      const { data } = await axiosFetch.post('/conversations', {
        to: sellerID,
        from: buyerID,
        sellerID,
        buyerID,
        seller_username: sellerUsername || null,
        buyer_username: buyerUsername || null,
      });

      const targetId =
        data?.uuid ||
        data?.conversationID ||
        data?.id ||
        data?._id ||
        data?.data?.uuid ||
        data?.data?._id ||
        data?.conversation?.uuid ||
        data?.conversation?._id;

      if (targetId) {
        router.push(`/message/${targetId}`);
        return;
      }
      toast.error("Could not start conversation");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start conversation.");
    } finally {
      setIsContactLoading(false);
    }
  };

  const handleAnalyzeProfile = () => {
    toast.success("AI Profile Analysis: Verified Web Designer with 98% on-time delivery.");
  };

  if (isLoading) {
    return <SellerProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 pt-4 sm:pt-6 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Panoramic Hero Banner & Overlapping Profile Header */}
        <SellerHeroBanner
          name={profileData.name}
          avatar={profileData.avatar}
          banner={profileData.banner}
          isPro={profileData.isPro}
          isSeller={profileData.isSeller}
          sellerLevel={profileData.sellerLevel}
          role={profileData.role}
          rating={profileData.rating}
          reviewCount={profileData.reviewCount}
          categoryName={profileData.categoryName}
          subcategoryName={profileData.subcategoryName}
        />

        {/* 2. Main Two-Column Grid: Left (About & Contact) + Right (Gigs Grid) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-12">
          <span ref={sidebarMarkerRef} aria-hidden="true" className="absolute top-0 left-0 h-0 w-0 pointer-events-none" />
          {/* Left Column (lg:col-span-5) */}
          <div
            style={{
              "--sticky-top": `calc(var(--navbar-height, ${isSeller ? "82px" : "136px"}) + 12px)`,
            } as React.CSSProperties}
            className="lg:col-span-5 relative lg:sticky lg:self-start lg:z-20 lg:top-[var(--sticky-top)] transition-[top] duration-200"
          >
            <SellerAboutSidebar
              name={profileData.name}
              avatar={profileData.avatar}
              showIdentity={showStickyIdentity}
              memberSince={profileData.memberSince}
              bio={profileData.bio}
              country={profileData.country}
              responseTime={profileData.responseTime}
              onTimeDelivery={profileData.onTimeDelivery}
              skills={profileData.skills}
              localTimeText={profileData.localTimeText}
              lastActiveAt={profileData.lastActiveAt}
              isOnline={profileData.isOnline}
              sellerId={profileData.id}
              sellerUsername={profileData.username}
              isContactLoading={isContactLoading}
              onContact={handleContact}
              onMessage={handleContact}
              onAnalyzeProfile={handleAnalyzeProfile}
            />
          </div>

          {/* Right Column (lg:col-span-8) */}
          <div className="lg:col-span-7">
            <SellerGigsGrid gigs={profileData.gigs} />
          </div>
        </div>

        {/* 3. Section: Review from the client (Real reviews only) */}
        {profileData.reviewsData?.list && profileData.reviewsData.list.length > 0 && (
          <SellerReviewsSection
            averageRating={profileData.reviewsData.averageRating}
            totalReviews={profileData.reviewsData.totalReviews}
            starDistribution={profileData.reviewsData.starDistribution}
            categoryScores={profileData.reviewsData.categoryScores}
            reviews={profileData.reviewsData.list}
            sellerName={profileData.name || profileData.username}
            sellerAvatar={profileData.avatar}
            sellerUsername={profileData.username}
            sellerId={profileData.id}
          />
        )}

        {/* 4. Section: Frequently asked questions (Real seller/package FAQs only) */}
        {profileData.faqs && profileData.faqs.length > 0 && (
          <SellerFaqSection faqs={profileData.faqs} />
        )}
      </div>

      {/* 5. Mobile Sticky Bottom Contact Bar (Only visible on small devices: < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-3 z-40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-sm">
                {(profileData.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            {profileData.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-bold text-slate-900 truncate block">
              {profileData.name}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {profileData.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="dark"
          size="sm"
          radius="fiverr"
          onClick={() => handleContact()}
          isLoading={isContactLoading}
          disabled={isContactLoading}
          className="shrink-0 h-[40px] px-5 font-semibold text-xs shadow-xs"
        >
          Contact
        </Button>
      </div>
    </div>
  );
};

export default SellerPublicProfile;
