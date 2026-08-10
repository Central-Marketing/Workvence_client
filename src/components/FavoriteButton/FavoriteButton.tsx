"use client";

import { useState } from "react";
import { axiosFetch } from "@/utils";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  gigId: string;
  initialIsFavorited?: boolean;
  initialFavoriteCount?: number;
  currentUser: any;
  className?: string;
  iconClassName?: string;
  showCount?: boolean;
}

const FavoriteButton = ({ 
  gigId, 
  initialIsFavorited = false, 
  initialFavoriteCount = 0, 
  currentUser,
  className = "",
  iconClassName = "",
  showCount = false
}: FavoriteButtonProps) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?._id) {
      toast.error("Please sign in to favorite services!");
      return;
    }

    // Optimistic UI update
    const previousState = isFavorited;
    const previousCount = favoriteCount;

    setIsFavorited(!previousState);
    setFavoriteCount((prev) => (previousState ? Math.max(0, prev - 1) : prev + 1));
    setLoading(true);

    try {
      const res = await axiosFetch.post(`/gigs/${gigId}/favorite`);
      if (!res.data.error) {
        setIsFavorited(res.data.isFavorited);
        setFavoriteCount(res.data.favoriteCount);
        if (res.data.message) {
          toast.success(res.data.message);
        }
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setIsFavorited(previousState);
      setFavoriteCount(previousCount);
      toast.error(err.response?.data?.message || "Failed to update favorite status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`flex items-center justify-center transition-colors outline-none cursor-pointer ${className} ${
        isFavorited ? "text-red-500" : "text-white hover:text-red-500"
      }`}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-colors ${iconClassName || 'w-full h-full'}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showCount && favoriteCount !== undefined && (
        <span className="text-[13.5px] font-semibold text-gray-700 ml-1.5 whitespace-nowrap">{favoriteCount}</span>
      )}
    </button>
  );
};

export default FavoriteButton;
