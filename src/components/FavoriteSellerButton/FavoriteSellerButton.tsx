"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import toast from "react-hot-toast";

interface FavoriteSellerButtonProps {
  sellerId: string;
  className?: string;
  showText?: boolean;
}

export const FavoriteSellerButton: React.FC<FavoriteSellerButtonProps> = ({
  sellerId,
  className = "",
  showText = false,
}) => {
  const { user } = useUserStore((state: any) => state);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.isSeller || !sellerId) return;

    let isMounted = true;
    axiosFetch
      .get(`/users/favorite-seller/${sellerId}/status`)
      .then(({ data }) => {
        if (isMounted && !data.error) {
          setIsFavorited(!!data.isFavorited);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user, sellerId]);

  // Only display to authenticated buyers
  if (!user || user.isSeller || !sellerId) {
    return null;
  }

  // Prevent buyers from favoriting themselves if sellerId matches
  const currentUid = String(user._id || user.id || "");
  if (currentUid === String(sellerId)) {
    return null;
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (loading) return;

    const previousState = isFavorited;
    setIsFavorited(!previousState);
    setLoading(true);

    try {
      const { data } = await axiosFetch.post(`/users/favorite-seller/${sellerId}`);
      if (data.error) {
        setIsFavorited(previousState);
        toast.error(data.message || "Failed to update favorite status");
      } else {
        const nextState = !!data.isFavorited;
        setIsFavorited(nextState);
        toast.success(
          nextState ? "Added to Favorite Sellers!" : "Removed from Favorite Sellers."
        );
      }
    } catch (err: any) {
      setIsFavorited(previousState);
      toast.error(err?.response?.data?.message || "Failed to update favorite seller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 p-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
        isFavorited
          ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
          : "bg-white/90 hover:bg-gray-100 text-gray-400 hover:text-red-500 border border-gray-200"
      } ${className}`}
      title={isFavorited ? "Remove from Favorite Sellers" : "Add to Favorite Sellers"}
      aria-label="Favorite Seller"
    >
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${
          isFavorited ? "fill-red-500 stroke-red-500 scale-110" : "fill-none stroke-current"
        }`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showText && (
        <span className="text-xs font-semibold">
          {isFavorited ? "Favorite Seller" : "Add to Favorite"}
        </span>
      )}
    </button>
  );
};

export default FavoriteSellerButton;
