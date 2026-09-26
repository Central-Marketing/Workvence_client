"use client";

import { useState, useEffect } from "react";
import { axiosFetch, getAvatarUrl } from "@/utils";
import { PackageCard, FavoriteSellerButton, Button } from "@/components";
import { Breadcrumb, GigsGridSkeleton } from "@/components/ui";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHome } from "react-icons/fi";
import toast from "react-hot-toast";

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState<"gigs" | "sellers">("gigs");
  const [favoriteGigs, setFavoriteGigs] = useState<any[]>([]);
  const [favoriteSellers, setFavoriteSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore((state: any) => state);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchAllFavorites = async () => {
      try {
        setLoading(true);
        // 1. Fetch favorite gigs
        const gigsRes = await axiosFetch.get("/gigs/favorites").catch(() => null);
        if (isMounted && gigsRes?.data && !gigsRes.data.error) {
          const list = Array.isArray(gigsRes.data)
            ? gigsRes.data
            : gigsRes.data.favorites || gigsRes.data.gigs || [];
          const normalizedGigs = list.map((item: any) => {
            const rawGig =
              item.gig && typeof item.gig === "object"
                ? item.gig
                : item.package && typeof item.package === "object"
                  ? item.package
                  : item.gigId && typeof item.gigId === "object"
                    ? item.gigId
                    : item;
            return {
              ...rawGig,
              isFavorited: true,
            };
          });
          setFavoriteGigs(normalizedGigs);
        }

        // 2. Fetch favorite sellers from API
        const sellersRes = await axiosFetch.get("/users/favorite-sellers").catch(() => null);
        if (isMounted && sellersRes?.data && !sellersRes.data.error) {
          const list = Array.isArray(sellersRes.data)
            ? sellersRes.data
            : sellersRes.data.sellers || sellersRes.data.favoriteSellers || [];
          const normalizedSellers = list.map((seller: any) => {
            return seller.seller && typeof seller.seller === "object"
              ? seller.seller
              : seller.sellerId && typeof seller.sellerId === "object"
                ? seller.sellerId
                : seller.user && typeof seller.user === "object"
                  ? seller.user
                  : seller;
          });
          setFavoriteSellers(normalizedSellers);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user && !user.isSeller) {
      fetchAllFavorites();
    } else if (user?.isSeller) {
      setLoading(false);
    } else if (!user) {
      // Check if session exists in storage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user") || localStorage.getItem("accessToken");
        if (stored) {
          fetchAllFavorites();
        } else {
          setLoading(false);
          router.push("/login?redirect=/favorites");
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user, router]);

  const handleContactSeller = async (seller: any) => {
    const buyerID = user?._id || user?.id;
    if (!buyerID) {
      router.push("/login");
      return;
    }
    const sellerID = seller._id || seller.id;

    if (!sellerID || !buyerID) return;

    try {
      const res = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
      const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
        return;
      }
    } catch {
      // Fallback
    }

    try {
      const res = await axiosFetch.post("/conversations", {
        to: sellerID,
        from: buyerID,
        sellerID,
        buyerID,
        seller_username: seller.username || null,
        buyer_username: user.username || null,
      });
      const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id;
      if (targetId) {
        router.push(`/message/${targetId}`);
      } else {
        toast.error("Could not resolve conversation ID");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to open conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-8 sm:pt-10 pb-[80px] min-[1400px]:pb-[100px] font-sans">
        <div className="container mx-auto px-4 md:px-6 space-y-6">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Saved", isLast: true },
            ]}
          />
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[28px] font-medium font-inter text-[#292929]">
              Saved
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Keep track of packages and freelancers you want to work with.
            </p>
          </div>
          <GigsGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (user?.isSeller) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/30 px-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          Only buyers have access to the Favorites list. Please switch to a buyer account to manage saved services and sellers.
        </p>
        <Button
          variant="brand"
          size="md"
          radius="xl"
          onClick={() => router.push("/")}
          className="px-6 py-2.5 font-semibold shadow-sm"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pt-10 md:pt-12 pb-[80px] min-[1400px]:pb-[100px]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            {
              name: "Orders",
              href: "/orders",
            },
            {
              name: "Favorites",
              isLast: true,
            },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
            My Favorites
          </h1>
          <p className="text-gray-500 mt-1.5 text-[15px]">
            Manage your saved services and favorite freelancers in one place.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center h-[46px] bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50 mb-8">
          <Button
            type="button"
            onClick={() => setActiveTab("gigs")}
            variant={activeTab === "gigs" ? "brand" : "ghost"}
            size="sm"
            radius="fiverr"
            className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-4 flex items-center gap-2.5 whitespace-nowrap ${activeTab === "gigs"
                ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
              }`}
          >
            <span className="whitespace-nowrap shrink-0">Saved Services</span>
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none shrink-0 ${activeTab === "gigs" ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-700"
                }`}
            >
              {favoriteGigs.length}
            </span>
          </Button>

          <Button
            type="button"
            onClick={() => setActiveTab("sellers")}
            variant={activeTab === "sellers" ? "brand" : "ghost"}
            size="sm"
            radius="fiverr"
            className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-4 flex items-center gap-2.5 whitespace-nowrap ${activeTab === "sellers"
                ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
              }`}
          >
            <span className="whitespace-nowrap shrink-0">Favorite Sellers</span>
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none shrink-0 ${activeTab === "sellers" ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-700"
                }`}
            >
              {favoriteSellers.length}
            </span>
          </Button>
        </div>

        {/* Tab 1: Saved Gigs */}
        {activeTab === "gigs" && (
          <div>
            {favoriteGigs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-[6px] p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[380px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-40">📦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No saved services yet</h3>
                <p className="text-gray-500 mb-8 max-w-md text-sm">
                  You haven't saved any services to your favorites yet. Explore the marketplace to bookmark top offerings!
                </p>
                <Button
                  href="/packages?category=ai-services"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                >
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteGigs.map((gig: any) => (
                  <PackageCard key={gig._id || gig.id} data={gig} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Favorite Sellers */}
        {activeTab === "sellers" && (
          <div>
            {favoriteSellers.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-[6px] p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[380px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-40">👤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No favorite sellers yet</h3>
                <p className="text-gray-500 mb-8 max-w-md text-sm">
                  You haven't added any freelancers to your favorite sellers list. Visit seller profiles and click the heart icon to save them here!
                </p>
                <Button
                  href="/packages?category=ai-services"
                  variant="dark"
                  size="md"
                  radius="fiverr"
                >
                  Explore Freelancers
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteSellers.map((seller: any) => {
                  const sellerId = seller._id || seller.id;
                  const username = seller.username || seller.name || "Seller";
                  const avatar = getAvatarUrl(seller.image || seller.avatar, username);
                  const title = seller.shortTitle || seller.title || "Freelance Specialist";
                  const country = seller.country || "United States";
                  const rating = seller.starRating ? Number(seller.starRating).toFixed(1) : "5.0";

                  return (
                    <div
                      key={sellerId}
                      className="bg-white border border-gray-200/90 rounded-[6px] p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all duration-200 relative group"
                    >
                      {/* Favorite Seller Heart Button */}
                      <div className="absolute top-4 right-4 z-10">
                        <FavoriteSellerButton sellerId={sellerId} />
                      </div>

                      {/* Avatar */}
                      <div
                        onClick={() => router.push(`/seller/${username}`)}
                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <img src={avatar} alt={username} className="w-full h-full object-cover" />
                      </div>

                      {/* Username & Title */}
                      <h3
                        onClick={() => router.push(`/seller/${username}`)}
                        className="font-bold text-gray-900 text-lg hover:text-brand-green transition-colors cursor-pointer line-clamp-1"
                      >
                        {username}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-medium">{title}</p>

                      {/* Metadata badges */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          ⭐ {rating}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">📍 {country}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100">
                        <Button
                          type="button"
                          onClick={() => router.push(`/seller/${username}`)}
                          variant="soft"
                          size="sm"
                          radius="fiverr"
                          fullWidth
                        >
                          View Profile
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleContactSeller(seller)}
                          variant="brand"
                          size="sm"
                          radius="fiverr"
                          fullWidth
                        >
                          Chat Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
