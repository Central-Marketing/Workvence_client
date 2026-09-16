"use client";

import { useEffect } from 'react';
import {
  Featured,
  TrustedBy,
  ExploreCategories,
  PopularServices,
  HowItWorks,
  PromoSection,
  TrustProtection,
  CTA,
  PostProject,
} from '@/components';

const Home = () => {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);
  return (
    <div className="w-full min-h-screen bg-white">
      <Featured />
      <TrustedBy />
      <ExploreCategories />
      <PopularServices />
      <PostProject />
      <HowItWorks />
      <PromoSection />
      {/* <TopRatedSellers /> */}
      <TrustProtection />
      {/* <TwoWays /> */}
      {/* <FAQ /> */}
      <CTA />
    </div>
  )
}

export default Home