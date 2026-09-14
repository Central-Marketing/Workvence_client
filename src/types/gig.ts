import { User, RatingBreakdown, StarCounts } from './user';

export interface PricingTierDetails {
  title: string;
  shortDesc: string;
  price: number;
  deliveryTime: number | string;
  revisionNumber: number | string;
  features: string[];
  [key: string]: any;
}

export interface PackageTiers {
  basic: PricingTierDetails;
  standard?: PricingTierDetails | null;
  premium?: PricingTierDetails | null;
  [key: string]: PricingTierDetails | null | undefined;
}

export interface GigPackage {
  _id: string;
  id?: string;
  userID: string | User;
  title: string;
  category: string;
  cover: string;
  images: string[];
  description: string;
  shortTitle?: string;
  shortDesc?: string;
  deliveryTime?: number | string;
  revisionNumber?: number | string;
  features?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  price: number;
  packages?: PackageTiers;
  sales?: number;
  starNumber?: number;
  totalStars?: number;
  starRating?: number;
  totalReviews?: number;
  ratingBreakdown?: RatingBreakdown;
  starCounts?: StarCounts;
  reviews?: any[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface CategoryItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  title?: string;
  icon?: string;
  [key: string]: any;
}

export interface CardItem {
  id: number | string;
  title: string;
  desc: string;
  img: string;
  slug: string;
  [key: string]: any;
}

export interface ProjectItem {
  id: number | string;
  img: string;
  pp: string;
  cat: string;
  username: string;
  [key: string]: any;
}
