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

export const DEFAULT_SELLER_GIGS: SellerGigItem[] = [
  {
    id: 'gig-1',
    category: 'Web Design',
    rating: 4.9,
    reviewCount: 57,
    title: 'I will design,redesign business wordpress website as divi expert',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 150,
  },
  {
    id: 'gig-2',
    category: 'Web Design',
    rating: 4.9,
    reviewCount: 57,
    title: 'I will design,redesign business wordpress website as divi expert',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 150,
  },
  {
    id: 'gig-3',
    category: 'Graphic Design',
    rating: 4.7,
    reviewCount: 200,
    title: 'Create eye-catching logos and branding assets tailored to your business needs',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 100,
  },
  {
    id: 'gig-4',
    category: 'Graphic Design',
    rating: 4.7,
    reviewCount: 110,
    title: 'Create eye-catching logos and branding assets tailored to your business needs',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 100,
  },
  {
    id: 'gig-5',
    category: 'SEO Optimization',
    rating: 4.8,
    reviewCount: 34,
    title: 'Enhance your website\'s visibility on search engines with expert SEO strategies',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 120,
  },
  {
    id: 'gig-6',
    category: 'SEO Optimization',
    rating: 4.8,
    reviewCount: 34,
    title: 'Enhance your website\'s visibility on search engines with expert SEO strategies',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 120,
  },
  {
    id: 'gig-7',
    category: 'Content Writing',
    rating: 4.6,
    reviewCount: 76,
    title: 'Deliver engaging and SEO-friendly articles, blogs, and website content',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 80,
  },
  {
    id: 'gig-8',
    category: 'Content Writing',
    rating: 4.6,
    reviewCount: 76,
    title: 'Deliver engaging and SEO-friendly articles, blogs, and website content',
    image: SELLER_FALLBACK_IMAGES.gigCover,
    startingPrice: 80,
  },
];

export const DEFAULT_SELLER_REVIEWS: SellerReviewItem[] = [
  {
    id: 'rev-1',
    buyerName: 'Zervis Solaiman',
    buyerAvatar: SELLER_FALLBACK_IMAGES.reviewerAvatar,
    country: 'Canada',
    countryFlag: '🇨🇦',
    projectStatus: '1 Project is ongoing',
    rating: 4.8,
    dateText: '2 days ago',
    reviewText: 'It was great to work with him. Recommend to everyone.',
    projectImage: SELLER_FALLBACK_IMAGES.reviewLunar,
    projectPrice: '$4000',
    projectDuration: '7 Days',
    sellerResponse: 'Thank you so much! It was an absolute pleasure working on this project with your team.',
  },
  {
    id: 'rev-2',
    buyerName: 'Zervis Solaiman',
    buyerAvatar: SELLER_FALLBACK_IMAGES.reviewerAvatar,
    country: 'Canada',
    countryFlag: '🇨🇦',
    projectStatus: '1 Project is ongoing',
    rating: 4.8,
    dateText: '2 days ago',
    reviewText: 'It was great to work with him. Recommend to everyone.',
    projectImage: SELLER_FALLBACK_IMAGES.reviewLunar,
    projectPrice: '$4000',
    projectDuration: '7 Days',
    sellerResponse: 'Thank you so much! Looking forward to collaborating again soon.',
  },
];

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
  const isFallback = !rawUser || Object.keys(rawUser).length === 0;

  const id = sellerObj._id || sellerObj.id || 'seller-1';
  const username = sellerObj.username || usernameParam || 'nilson-norman';
  const name = sellerObj.name || (sellerObj.username ? `${sellerObj.username.replace(/[_-]/g, ' ')}` : 'Nilson Norman');
  const avatar = sellerObj.image || sellerObj.avatar || SELLER_FALLBACK_IMAGES.avatar;
  const banner = sellerObj.cover || sellerObj.banner || SELLER_FALLBACK_IMAGES.banner;
  const isPro = Boolean(sellerObj.isPro ?? true);
  const role = sellerObj.role || sellerObj.headline || sellerObj.shortTitle || 'Web Designer';

  const memberSince = sellerObj.createdAt
    ? String(new Date(sellerObj.createdAt).getFullYear())
    : (isFallback ? '2009' : String(new Date().getFullYear()));

  const bio =
    sellerObj.description ||
    sellerObj.bio ||
    (isFallback
      ? 'We are an end-to-end digital team with 15+ years of experience creating high-impact web solutions. Our expertise includes Figma UI/UX design, React.js, Next.js, Vue.js, Tailwind CSS, Bootstrap, Webflow, WordPress, Shopify, and Framer. We also provide branding, logo design, Lottie animations, and social media creatives. Trusted by teams at Microsoft, Amazon, and clients across 47+ countries, we deliver scalable, conversion-focused digital experiences that drive results.'
      : '');

  const country = sellerObj.country || (isFallback ? 'Bangladesh' : 'Global');
  const responseTime = sellerObj.responseTimeHours
    ? `${sellerObj.responseTimeHours} Hour${sellerObj.responseTimeHours > 1 ? 's' : ''}`
    : '1 Hour';
  const onTimeDelivery = sellerObj.onTimeDeliveryRate
    ? `${sellerObj.onTimeDeliveryRate}%`
    : (sellerObj.metrics?.overall?.onTimeDeliveryRate ? `${sellerObj.metrics.overall.onTimeDeliveryRate}%` : '100%');

  const skills = Array.isArray(sellerObj.skills) && sellerObj.skills.length > 0
    ? sellerObj.skills
    : (isFallback
      ? ['Problem solver', 'UI Designer', 'User Experience Designer', 'Analytical Thinker', 'Product management', '+2']
      : []);

  // Map gigs with seller details attached so PackageCard renders properly
  let gigs: any[] = [];
  if (Array.isArray(rawGigs) && rawGigs.length > 0) {
    gigs = rawGigs.map((g: any, idx: number) => {
      const gId = g._id || g.id || `gig-${idx}`;
      const resolvedCover = g.cover || (Array.isArray(g.images) && g.images[0]) || g.img || g.image || SELLER_FALLBACK_IMAGES.gigCover;
      return {
        ...g,
        _id: gId,
        id: gId,
        slug: g.slug || g._id || g.id,
        category: g.category || g.cat || 'Web Design',
        subcategory: g.subcategory || (Array.isArray(g.tags) && g.tags[0]) || '',
        rating: Number(g.starNumber ? (g.totalStars / g.starNumber) : (g.rating || g.star || 5.0)),
        reviewCount: Number(g.starNumber || g.reviews || g.reviewCount || 0),
        title: g.title || 'I will design,redesign business wordpress website as divi expert',
        cover: resolvedCover,
        img: resolvedCover,
        image: resolvedCover,
        price: Number(g.price || g.startingPrice || 100),
        startingPrice: Number(g.price || g.startingPrice || 100),
        sales: Number(g.sales || 0),
        user: {
          name,
          username,
          image: avatar,
          sellerLevel: sellerObj.sellerLevel || 'Level 1',
        },
      };
    });
  } else if (isFallback) {
    gigs = DEFAULT_SELLER_GIGS.map((g) => ({
      ...g,
      _id: g.id,
      cover: g.image,
      img: g.image,
      price: g.startingPrice,
      star: g.rating,
      starNumber: g.reviewCount,
      gigRating: g.rating.toFixed(1),
      user: {
        name,
        username,
        image: avatar,
        sellerLevel: 'Level 1',
      },
    }));
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

      const buyerCountry = buyerObj.country || 'Client';
      const flagObj = getCountryFlag(buyerCountry);
      const flag = flagObj?.normal || flagObj?.mini || '🌐';

      const priceVal = r.price || r.gigID?.price || r.orderID?.price;
      const formattedPrice = priceVal ? (String(priceVal).startsWith('$') ? String(priceVal) : `$${priceVal}`) : '$150';

      reviewsList.push({
        id: r._id || r.id || `rev-${idx}`,
        buyerName: buyerObj.name || buyerObj.username || 'Verified Client',
        buyerAvatar: buyerObj.image || buyerObj.avatar || buyerObj.img || SELLER_FALLBACK_IMAGES.reviewerAvatar,
        country: buyerCountry,
        countryFlag: flag,
        projectStatus: r.orderStatus || 'Completed Order',
        rating: star,
        dateText: r.createdAt ? moment(r.createdAt).fromNow() : 'Recent',
        reviewText: r.desc || r.description || 'Great experience working with this seller. Excellent communication and quality delivery.',
        projectImage: r.gigID?.cover || (Array.isArray(r.gigID?.images) && r.gigID?.images[0]) || SELLER_FALLBACK_IMAGES.reviewLunar,
        projectPrice: formattedPrice,
        projectDuration: r.duration ? `${r.duration} Days` : '7 Days',
        sellerResponse: r.sellerResponse || undefined,
      });
    });
  }

  // Calculate review metrics
  let finalReviews: SellerReviewItem[] = reviewsList;
  let finalTotalReviews = validReviewCount > 0 ? validReviewCount : Number(sellerObj.reviewCount || sellerObj.totalReviews || sellerObj.totalStars || 0);
  let finalAverageRating = validReviewCount > 0
    ? (totalScore / validReviewCount)
    : Number(sellerObj.rating || sellerObj.starRating || sellerObj.starNumber || (isFallback ? 4.8 : 0));

  const starDistribution: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (validReviewCount > 0) {
    for (let s = 1; s <= 5; s++) {
      starDistribution[s] = Math.round(((starCounts[s] || 0) / validReviewCount) * 100);
    }
  }

  const categoryScores = {
    communication: commCount > 0 ? `${(commTotal / commCount).toFixed(1)}/5` : '5.0/5',
    quality: qualCount > 0 ? `${(qualTotal / qualCount).toFixed(1)}/5` : '5.0/5',
    value: valCount > 0 ? `${(valTotal / valCount).toFixed(1)}/5` : '5.0/5',
  };

  // Only use mock reviews if isFallback (no user data passed at all)
  if (isFallback && reviewsList.length === 0) {
    finalReviews = DEFAULT_SELLER_REVIEWS;
    finalTotalReviews = 226;
    finalAverageRating = 4.8;
    starDistribution[5] = 88;
    starDistribution[4] = 70;
    starDistribution[3] = 50;
    starDistribution[2] = 30;
    starDistribution[1] = 15;
    categoryScores.communication = '5/5';
    categoryScores.quality = '4/5';
    categoryScores.value = '3/5';
  }

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
