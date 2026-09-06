export interface SellerGigItem {
  id: string;
  slug?: string;
  category: string;
  rating: number;
  reviewCount: number;
  title: string;
  image: string;
  startingPrice: number;
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
  gigs: SellerGigItem[];
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

export const DEFAULT_SELLER_FAQS: SellerFaqItem[] = [
  {
    question: 'How does escrow payment protection work?',
    answer: 'Your payment is held securely while the seller completes the order. It is released after you review and approve the agreed delivery. This ensures both parties are protected throughout the transaction lifecycle.',
  },
  {
    question: 'How are sellers verified?',
    answer: 'Sellers undergo government ID verification, portfolio assessments, and continuous quality checks on completed orders to maintain verified status.',
  },
  {
    question: 'What happens if a seller does not deliver?',
    answer: 'If the agreed milestones or deliverables are not met within the timeframe, Workvence dispute resolution guarantees a full refund under buyer protection.',
  },
  {
    question: 'Can I buy a fixed-price service and also post a project?',
    answer: 'Yes, you can purchase any fixed-price package instantly or create custom project briefs with specific timelines and custom milestone budgets.',
  },
  {
    question: 'How do sellers receive payments?',
    answer: 'Payments are transferred to the seller\'s balance once the buyer approves delivery, and can be withdrawn via bank transfer, Payoneer, or PayPal.',
  },
];

export function normalizeSellerProfile(
  rawUser: any,
  rawGigs: any[] = [],
  usernameParam?: string
): NormalizedSellerProfile {
  const sellerObj = rawUser?.user || rawUser || {};
  const isFallback = !rawUser || Object.keys(rawUser).length === 0;

  const id = sellerObj._id || sellerObj.id || 'seller-1';
  const username = sellerObj.username || usernameParam || 'nilson-norman';
  const name = sellerObj.name || (sellerObj.username ? `${sellerObj.username.replace(/[_-]/g, ' ')}` : 'Nilson Norman');
  const avatar = sellerObj.image || sellerObj.avatar || SELLER_FALLBACK_IMAGES.avatar;
  const banner = sellerObj.cover || sellerObj.banner || SELLER_FALLBACK_IMAGES.banner;
  const isPro = Boolean(sellerObj.isPro ?? true);
  const role = sellerObj.role || sellerObj.shortTitle || 'Web Designer';
  const rating = Number(sellerObj.rating || sellerObj.starRating || sellerObj.starNumber || 4.8);
  const reviewCount = Number(sellerObj.reviewCount || sellerObj.totalStars || sellerObj.completedOrdersCount || 226);
  const memberSince = sellerObj.createdAt ? String(new Date(sellerObj.createdAt).getFullYear()) : '2009';

  const bio =
    sellerObj.description ||
    sellerObj.bio ||
    'We are an end-to-end digital team with 15+ years of experience creating high-impact web solutions. Our expertise includes Figma UI/UX design, React.js, Next.js, Vue.js, Tailwind CSS, Bootstrap, Webflow, WordPress, Shopify, and Framer. We also provide branding, logo design, Lottie animations, and social media creatives. Trusted by teams at Microsoft, Amazon, and clients across 47+ countries, we deliver scalable, conversion-focused digital experiences that drive results.';

  const country = sellerObj.country || 'Bangladesh';
  const responseTime = sellerObj.responseTimeHours ? `${sellerObj.responseTimeHours} Hour` : '1 Hour';
  const onTimeDelivery = sellerObj.onTimeDeliveryRate ? `${sellerObj.onTimeDeliveryRate}%` : '98%';

  const skills = Array.isArray(sellerObj.skills) && sellerObj.skills.length > 0
    ? sellerObj.skills
    : ['Problem solver', 'UI Designer', 'User Experience Designer', 'Analytical Thinker', 'Product management', '+2'];

  // Map or fallback gigs
  let gigs: SellerGigItem[] = [];
  if (Array.isArray(rawGigs) && rawGigs.length > 0) {
    gigs = rawGigs.map((g: any, idx: number) => {
      const gId = g._id || g.id || `gig-${idx}`;
      return {
        id: gId,
        slug: g.slug || g._id || g.id,
        category: g.category || g.cat || 'Web Design',
        rating: Number(g.starNumber || g.rating || 4.8),
        reviewCount: Number(g.totalStars || g.reviewCount || 50),
        title: g.title || 'I will design,redesign business wordpress website as divi expert',
        image: g.cover || (Array.isArray(g.images) && g.images[0]) || SELLER_FALLBACK_IMAGES.gigCover,
        startingPrice: Number(g.price || g.startingPrice || 100),
      };
    });
  }

  if (gigs.length === 0) {
    gigs = DEFAULT_SELLER_GIGS;
  }

  // Format local time
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const localTimeText = `Online • ${timeStr} local time`;

  return {
    id,
    username,
    name,
    avatar,
    banner,
    isPro,
    role,
    rating,
    reviewCount,
    memberSince,
    bio,
    country,
    responseTime,
    onTimeDelivery,
    skills,
    localTimeText,
    gigs,
    reviewsData: {
      averageRating: rating,
      totalReviews: reviewCount,
      starDistribution: {
        5: 88,
        4: 70,
        3: 50,
        2: 30,
        1: 15,
      },
      categoryScores: {
        communication: '5/5',
        quality: '4/5',
        value: '3/5',
      },
      list: DEFAULT_SELLER_REVIEWS,
    },
    faqs: DEFAULT_SELLER_FAQS,
  };
}
