"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { axiosFetch } from '@/utils';

const RecommendedSellers = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const { data } = await axiosFetch.get('/users/random-sellers');
        setSellers(Array.isArray(data) ? data : data.users || []);
      } catch (error) {
        console.error("Failed to fetch random sellers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 bg-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[22px] font-bold text-gray-900">Recommended sellers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-gray-50 h-[240px] rounded-xl border border-gray-100"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!sellers || sellers.length === 0) return null;

  return (
    <section className="w-full py-16 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[22px] font-bold text-gray-900">
            Recommended sellers
          </h2>
          <Link href="/seller" className="text-brand-green font-semibold text-[14px] hover:underline">
            View all experts
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sellers.map((seller: any) => (
            <div key={seller._id || Math.random()} className="flex flex-col items-center bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="relative mb-3">
                <img 
                  src={seller.image || seller.img || "/media/noavatar.png"} 
                  alt={seller.username} 
                  className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-brand-green/80"
                />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-1 tracking-tight">
                {seller.username || "Freelancer"}
              </h3>
              <p className="text-[12px] text-gray-500 mb-2 font-medium">
                {seller.title || seller.profession || "Digital marketer"}
              </p>
              <div className="flex items-center gap-1.5 text-brand-green text-[12px] font-medium mb-6">
                <Star className="fill-brand-green text-brand-green" size={12} strokeWidth={1} />
                <span>{(seller.avgRating || 4.9).toFixed(1)}</span>
                <span className="text-brand-green/80">({seller.totalStars || seller.reviews || 124} reviews)</span>
              </div>
              
              <Link 
                href={`/seller/${seller.username || seller._id}`}
                className="w-full py-2 text-center text-[13px] font-medium text-gray-500 border border-gray-200 rounded-md hover:border-brand-green hover:text-brand-green transition-colors"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedSellers;
