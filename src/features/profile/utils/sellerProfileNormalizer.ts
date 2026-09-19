import moment from "moment";
import { getCountryFlag } from "@/utils";

export interface SellerGigItem {
  id: string;
  slug?: string;
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  title: string;
  image: string;
  startingPrice: number;
  [key: string]: any;
}

export interface SellerReviewItem {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  country: string;
  countryFlag: string;
  projectStatus: string;
  rating: number;
  dateText: string;
  reviewText: string;
  projectImage: string;
  projectPrice: string;
  projectDuration: string;
  sellerResponse?: string;
}

export interface SellerFaqItem {
  question: string;
  answer: string;
}

export interface NormalizedSellerProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  banner: string;
  isPro: boolean;
  role: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  bio: string;
  country: string;
  responseTime: string;
  onTimeDelivery: string;
  skills: string[];
  localTimeText: string;
  categoryName?: string;
  subcategoryName?: string;
  gigs: any[];
  reviewsData: {
    averageRating: number;
    totalReviews: number;
    starDistribution: { [star: number]: number };
    categoryScores: {
      communication: string;
      quality: string;
      value: string;
    };
    list: SellerReviewItem[];
  };
  faqs: SellerFaqItem[];
}

export const SELLER_FALLBACK_IMAGES = {
  banner: '/images/mock-seller/banner-hd.jpg',
  fallbackBanner: '/images/mock-seller/banner.png',
  avatar: '/images/mock-package/avatar-seller.png',
  reviewerAvatar: '/images/mock-package/avatar-reviewer.png',
  gigCover: '/images/mock-seller/gig-cover.png',
  reviewLunar: '/images/mock-package/review-lunar.png',
};

export const DEFAULT_SELLER_GIGS: SellerGigItem[] = [];

export const DEFAULT_SELLER_REVIEWS: SellerReviewItem[] = [];

export const DEFAULT_SELLER_FAQS: SellerFaqItem[] = [];

export function normalizeSellerProfile(
  rawUser: any,
  rawGigs: any[] = [],
  rawReviews: any = [],
  usernameParam?: string
): NormalizedSellerProfile {
  // Handle backwards compatibility if 3rd argument is username string
  if (typeof rawReviews === "string") {
    usernameParam = rawReviews;
    rawReviews = [];
  }

  const sellerObj = rawUser?.user || rawUser || {};

  const id = sellerObj._id || sellerObj.id || '';
  const username = sellerObj.username || usernameParam || '';
  const name = sellerObj.name || (sellerObj.username ? `${sellerObj.username.replace(/[_-]/g, ' ')}` : '');
  const avatar = sellerObj.image || sellerObj.avatar || SELLER_FALLBACK_IMAGES.avatar;
  const banner = sellerObj.cover || sellerObj.banner || SELLER_FALLBACK_IMAGES.banner;
  const isPro = Boolean(sellerObj.isPro ?? false);
  const role = sellerObj.role || sellerObj.headline || sellerObj.shortTitle || '';

  const memberSince = sellerObj.createdAt
    ? String(new Date(sellerObj.createdAt).getFullYear())
    : '';

  const bio = sellerObj.description || sellerObj.bio || '';

  const country = sellerObj.country || '';
  const responseTime = sellerObj.responseTimeHours
    ? `${sellerObj.responseTimeHours} Hour${sellerObj.responseTimeHours > 1 ? 's' : ''}`
    : (sellerObj.responseTime || '1 Hour');
  const onTimeDelivery = sellerObj.onTimeDeliveryRate
    ? `${sellerObj.onTimeDeliveryRate}%`
    : (sellerObj.metrics?.overall?.onTimeDeliveryRate ? `${sellerObj.metrics.overall.onTimeDeliveryRate}%` : '100%');

  const skills = Array.isArray(sellerObj.skills) && sellerObj.skills.length > 0
    ? sellerObj.skills
    : [];

  // Map gigs with seller details attached so PackageCard renders properly
  let gigs: any[] = [];
  if (Array.isArray(rawGigs) && rawGigs.length > 0) {
    gigs = rawGigs.map((g: any, idx: number) => {
      const gId = g._id || g.id || `gig-${idx}`;
      const resolvedCover = g.cover || (Array.isArray(g.images) && g.images[0]) || g.img || g.image || '';
      return {
        ...g,
        _id: gId,
        id: gId,
        slug: g.slug || g._id || g.id,
        category: g.category || g.cat || 'Services',
        subcategory: g.subcategory || (Array.isArray(g.tags) && g.tags[0]) || '',
        rating: Number(g.starNumber ? (g.totalStars / g.starNumber) : (g.rating || g.star || 0)),
        reviewCount: Number(g.starNumber || g.reviews || g.reviewCount || 0),
        title: g.title || '',
        cover: resolvedCover,
        img: resolvedCover,
        image: resolvedCover,
        price: Number(g.price || g.startingPrice || 0),
        startingPrice: Number(g.price || g.startingPrice || 0),
        sales: Number(g.sales || 0),
        user: {
          name,
          username,
          image: avatar,
          sellerLevel: sellerObj.sellerLevel || 'Level 1',
        },
      };
    });
  }

  // Derive primary categories for breadcrumbs
  const categoryName = gigs[0]?.category || sellerObj.category || 'Services';
  const subcategoryName = gigs[0]?.subcategory || '';

  // Process dynamic reviews
  const reviewsList: SellerReviewItem[] = [];
  const starCounts: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let validReviewCount = 0;
  let totalScore = 0;
  let commTotal = 0;
  let commCount = 0;
  let qualTotal = 0;
  let qualCount = 0;
  let valTotal = 0;
  let valCount = 0;

  const reviewsInput = Array.isArray(rawReviews)
    ? rawReviews
    : (Array.isArray(rawReviews?.reviews) ? rawReviews.reviews : (Array.isArray(rawReviews?.data) ? rawReviews.data : []));

  if (reviewsInput.length > 0) {
    reviewsInput.forEach((r: any, idx: number) => {
      const buyerObj = r.userID || r.user || {};
      const star = typeof r.star === 'number' && r.star > 0 && r.star <= 5 ? r.star : 5;
      const roundedStar = Math.min(5, Math.max(1, Math.round(star)));
      starCounts[roundedStar] = (starCounts[roundedStar] || 0) + 1;
      validReviewCount++;
      totalScore += star;

      const comm = Number(r.communicationRating || r.communication || 0);
      if (comm > 0) {
        commTotal += comm;
        commCount++;
      }
      const qual = Number(r.qualityRating || r.quality || 0);
      if (qual > 0) {
        qualTotal += qual;
        qualCount++;
      }
      const val = Number(r.valueRating || r.service || r.value || 0);
      if (val > 0) {
        valTotal += val;
        valCount++;
      }

      const buyerCountry = buyerObj.country || '';
      const flagObj = buyerCountry ? getCountryFlag(buyerCountry) : null;
      const flag = flagObj?.normal || flagObj?.mini || '';

      const priceVal = r.price || r.gigID?.price || r.orderID?.price;
      const formattedPrice = priceVal ? (String(priceVal).startsWith('$') ? String(priceVal) : `$${priceVal}`) : '';

      reviewsList.push({
        id: r._id || r.id || `rev-${idx}`,
        buyerName: buyerObj.name || buyerObj.username || 'Verified Client',
        buyerAvatar: buyerObj.image || buyerObj.avatar || buyerObj.img || '',
        country: buyerCountry,
        countryFlag: flag,
        projectStatus: r.orderStatus || '',
        rating: star,
        dateText: r.createdAt ? moment(r.createdAt).fromNow() : '',
        reviewText: r.desc || r.description || '',
        projectImage: r.gigID?.cover || (Array.isArray(r.gigID?.images) && r.gigID?.images[0]) || '',
        projectPrice: formattedPrice,
        projectDuration: r.duration ? `${r.duration} Days` : '',
        sellerResponse: r.sellerResponse || undefined,
      });
    });
  }

  // Calculate review metrics
  const finalReviews: SellerReviewItem[] = reviewsList;
  const finalTotalReviews = validReviewCount > 0 ? validReviewCount : Number(sellerObj.reviewCount || sellerObj.totalReviews || 0);
  const finalAverageRating = validReviewCount > 0
    ? (totalScore / validReviewCount)
    : (finalTotalReviews > 0 ? Number(sellerObj.rating || sellerObj.starRating || 0) : 0);

  const starDistribution: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (validReviewCount > 0) {
    for (let s = 1; s <= 5; s++) {
      starDistribution[s] = Math.round(((starCounts[s] || 0) / validReviewCount) * 100);
    }
  }

  const categoryScores = {
    communication: commCount > 0 ? `${(commTotal / commCount).toFixed(1)}/5` : '',
    quality: qualCount > 0 ? `${(qualTotal / qualCount).toFixed(1)}/5` : '',
    value: valCount > 0 ? `${(valTotal / valCount).toFixed(1)}/5` : '',
  };

  // Format local time
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const localTimeText = `Online • ${timeStr} local time`;

  // Extract real FAQs from user object and from seller packages
  const realFaqs: SellerFaqItem[] = [];
  const seenFaqQuestions = new Set<string>();

  // 1. Direct seller FAQs from user model if present
  if (Array.isArray(sellerObj.faqs)) {
    sellerObj.faqs.forEach((f: any) => {
      const q = (f.question || f.q || '').trim();
      const a = (f.answer || f.a || '').trim();
      if (q && a && !seenFaqQuestions.has(q.toLowerCase())) {
        seenFaqQuestions.add(q.toLowerCase());
        realFaqs.push({ question: q, answer: a });
      }
    });
  }

  // 2. Aggregate FAQs from seller packages/gigs
  if (Array.isArray(rawGigs)) {
    rawGigs.forEach((gig: any) => {
      if (Array.isArray(gig.faqs)) {
        gig.faqs.forEach((f: any) => {
          const q = (f.question || f.q || '').trim();
          const a = (f.answer || f.a || '').trim();
          if (q && a && !seenFaqQuestions.has(q.toLowerCase())) {
            seenFaqQuestions.add(q.toLowerCase());
            realFaqs.push({ question: q, answer: a });
          }
        });
      }
    });
  }

  return {
    id,
    username,
    name,
    avatar,
    banner,
    isPro,
    role,
    rating: finalAverageRating,
    reviewCount: finalTotalReviews,
    memberSince,
    bio,
    country,
    responseTime,
    onTimeDelivery,
    skills,
    localTimeText,
    categoryName,
    subcategoryName,
    gigs,
    reviewsData: {
      averageRating: finalAverageRating,
      totalReviews: finalTotalReviews,
      starDistribution,
      categoryScores,
      list: finalReviews,
    },
    faqs: realFaqs,
  };
}
