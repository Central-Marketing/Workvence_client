"use client";

import { useEffect } from 'react';
import { Featured, Slide, TrustedBy, ExploreCategories, PopularServices, HowItWorks, PromoSection, TopRatedSellers, TrustProtection, TwoWays, FAQ, CTA } from '@/components';
import { CategoryCard, ProjectCard } from '@/components';
import { cards, projects } from '@/data';

import './Home.scss';

const Home = () => {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);
  return (
    <div className='home'>
      <Featured />
      <TrustedBy />
      <ExploreCategories />
      <PopularServices />
      <HowItWorks />
      <PromoSection />
      <TopRatedSellers />
      <TrustProtection />
      <TwoWays />
      <FAQ />
      <CTA />
    </div>
  )
}

export default Home