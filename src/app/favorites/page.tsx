"use client";

import { useState, useEffect } from "react";
import { axiosFetch, getAvatarUrl } from "@/utils";
import { PackageCard, Loader, FavoriteSellerButton } from "@/components";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState<"gigs" | "sellers">("gigs");
  const [favoriteGigs, setFavoriteGigs] = useState<any[]>([]);
  const [favoriteSellers, setFavoriteSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore((state: any) => state);
  const router = useRouter();

  useEffect(() => {
    const fetchAllFavorites = async () => {
      try {
        // 1. Fetch favorite gigs
        const gigsRes = await axiosFetch.get("/gigs/favorites").catch(() => null);
        if (gigsRes?.data && !gigsRes.data.error) {
          setFavoriteGigs(gigsRes.data.favorites || []);
        }

        // 2. Fetch favorite sellers from API
        const sellersRes = await axiosFetch.get("/users/favorite-sellers").catch(() => null);
        if (sellersRes?.data && !sellersRes.data.error) {
          setFavoriteSellers(sellersRes.data.sellers || []);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id && !user.isSeller) {
      fetchAllFavorites();
    } else if (user?.isSeller) {
      setLoading(false);
    }
  }, [user]);

  const handleContactSeller = async (seller: any) => {
    if (!user?._id) {
      router.push("/login");
      return;
    }
    const sellerID = seller._id || seller.id;
    const buyerID = user._id;

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
        buyer_username: user.username || null
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
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/30">
        <Loader size={45} />
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
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-brand-green hover:bg-brand-green text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-10 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
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
        <div className="flex items-center gap-3 border-b border-gray-200 mb-8 pb-3">
          <button
            onClick={() => setActiveTab("gigs")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${activeTab === "gigs"
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            <span>Saved Services</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "gigs" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>
              {favoriteGigs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${activeTab === "sellers"
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            <span>Favorite Sellers</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "sellers" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>
              {favoriteSellers.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Saved Gigs */}
        {activeTab === "gigs" && (
          <div>
            {favoriteGigs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[380px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-40">📦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No saved services yet</h3>
                <p className="text-gray-500 mb-8 max-w-md text-sm">
                  You haven't saved any services to your favorites yet. Explore the marketplace to bookmark top offerings!
                </p>
                <Link href="/packages">
                  <button className="px-8 py-3 bg-brand-green hover:bg-brand-green text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer">
                    Browse Marketplace
                  </button>
                </Link>
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
              <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[380px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <span className="text-4xl filter grayscale opacity-40">👤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No favorite sellers yet</h3>
                <p className="text-gray-500 mb-8 max-w-md text-sm">
                  You haven't added any freelancers to your favorite sellers list. Visit seller profiles and click the heart icon to save them here!
                </p>
                <Link href="/packages">
                  <button className="px-8 py-3 bg-brand-green hover:bg-brand-green text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer">
                    Explore Freelancers
                  </button>
                </Link>
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
                      className="bg-white border border-gray-200/90 rounded-2xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all duration-200 relative group"
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
                        <button
                          onClick={() => router.push(`/seller/${username}`)}
                          className="w-full px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleContactSeller(seller)}
                          className="w-full px-3 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green rounded-xl transition-colors shadow-2xs cursor-pointer"
                        >
                          Chat Now
                        </button>
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
