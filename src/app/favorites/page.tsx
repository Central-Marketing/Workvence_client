"use client";

import { useState, useEffect } from "react";
import { axiosFetch } from "@/utils";
import { PackageCard, Loader } from "@/components";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore((state: any) => state);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axiosFetch.get("/gigs/favorites");
        if (!res.data.error) {
          setFavorites(res.data.favorites || []);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id && !user.isSeller) {
      fetchFavorites();
    } else if (user?.isSeller) {
      setLoading(false);
    }
  }, [user]);

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
          Only buyers have access to the Favorites list. Please switch to a buyer account to manage saved services.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-brand-green hover:bg-brand-green text-white font-semibold rounded-xl transition-all shadow-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
            My Favorite Gigs
            <span className="text-[#ef4444]">❤️</span>
            <span className="text-lg font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              {favorites.length}
            </span>
          </h1>
          <p className="text-gray-500 mt-2 text-[15px]">
            Manage your saved services and pick up right where you left off.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
              <span className="text-4xl filter grayscale opacity-40">❤️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No favorites yet</h3>
            <p className="text-gray-500 mb-8 max-w-md">
              You haven't saved any Gigs to your favorites yet. Start exploring the marketplace to find services you love!
            </p>
            <Link href="/packages">
              <button className="px-8 py-3 bg-brand-green hover:bg-brand-green text-white font-semibold rounded-xl transition-all shadow-sm">
                Browse Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((gig: any) => (
              <PackageCard key={gig._id} data={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
