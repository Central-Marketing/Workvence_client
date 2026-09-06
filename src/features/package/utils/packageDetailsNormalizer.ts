export interface PackageTierDetails {
  key: 'basic' | 'standard' | 'premium';
  name: string; // "Basic", "Silver", "Platinum"
  tagline: string; // "Small or test projects", etc.
  price: number;
  headline: string; // "HOME PAGE OR LANDING PAGE", etc.
  shortDesc: string;
  deliveryTime: number; // in days
  revisions: string; // "Unlimited Revision", "3 Revisions", etc.
  features: {
    pageCount: string; // "1 page/screen"
    customAsset: string; // "1 custom asset"
    responsive: boolean;
    wireframes: boolean;
    prototype: boolean;
    sourceFile: boolean;
    numPages: number;
  };
}

export interface SellerDetails {
  id: string;
  username: string;
  name: string;
  avatar: string;
  isPro: boolean;
  role: string;
  rating: number;
  reviewCount: number;
  ordersInQueue: number;
  verified: boolean;
  responseTime: string;
  topRatedIn: string;
  returnRate: string;
  onTimeDelivery: string;
  country: string;
  memberSince: string;
  languages: string[];
  bio: string;
  skills: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  projectCost: string;
  duration: string;
  tags: string[];
}

export interface ClientReviewItem {
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

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NormalizedPackageData {
  id: string;
  title: string;
  categoryName: string;
  subcategoryName: string;
  seller: SellerDetails;
  gallery: string[];
  packages: {
    basic: PackageTierDetails;
    standard: PackageTierDetails;
    premium: PackageTierDetails;
  };
  description: string;
  areaCovered: string[];
  whyMe: string[];
  designTools: { name: string; icon?: string }[];
  portfolioProjects: PortfolioProject[];
  reviewsData: {
    averageRating: number;
    totalReviews: number;
    starDistribution: { [star: number]: number }; // percentage 0-100
    categoryScores: {
      communication: number;
      quality: number;
      value: number;
    };
    list: ClientReviewItem[];
  };
  faqs: FaqItem[];
  isFavorited?: boolean;
  favoriteCount?: number;
}

export const FALLBACK_IMAGES = {
  mainBanner: '/images/mock-package/main-banner.png',
  sellerAvatar: '/images/mock-package/avatar-seller.png',
  reviewerAvatar: '/images/mock-package/avatar-reviewer.png',
  reviewLunar: '/images/mock-package/review-lunar.png',
  portfolioShowcase: '/images/mock-package/portfolio-showcase.png',
  thumbs: [
    '/images/mock-package/thumb-1.png',
    '/images/mock-package/thumb-2.png',
    '/images/mock-package/thumb-3.png',
    '/images/mock-package/thumb-4.png',
    '/images/mock-package/thumb-5.png',
  ],
  fallbackPlaceholder: '/images/mock-package/thumb-1.png'
};

export const DEFAULT_AREA_COVERED = [
  "SaaS Landing page",
  "Marketing Agency",
  "Startup",
  "Fintech",
  "Social Media Agency",
  "NFT Landing Page",
  "HTML Landing page",
  "Healthcare",
  "Business Coach",
  "Cyber Security",
  "Real Estate",
  "Mobile App Landing page",
  "Digital marketing Agency",
  "Ecommerce / Shopify Landing Page"
];

export const DEFAULT_WHY_ME = [
  "500+ Five Star reviews",
  "Custom designs 100% original, no templates",
  "Delivery only after your 100% Satisfaction",
  "7+ years of experience"
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "How does escrow payment protection work?",
    answer: "Your payment is held securely while the seller completes the order. It is released after you review and approve the agreed delivery. This ensures both parties are protected throughout the transaction lifecycle."
  },
  {
    question: "How are sellers verified?",
    answer: "Sellers undergo identity verification and portfolio review to confirm their authenticity and professional standards before receiving the Verified Pro badge."
  },
  {
    question: "What happens if a seller does not deliver?",
    answer: "You are fully covered by Workvence resolution center. If agreed delivery terms are not met, you can request revisions or an immediate full refund directly from escrow."
  },
  {
    question: "Can I buy a fixed-price service and also post a project?",
    answer: "Yes! You can instantly buy defined service packages or post custom project briefs for top-rated sellers to submit competitive proposals."
  },
  {
    question: "How do sellers receive payments?",
    answer: "Once you approve the completed delivery, escrow releases the funds to the seller's account balance, which can be withdrawn through supported payment gateways."
  }
];

export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    title: 'SPRAY Branding Design',
    description: 'I have done Branding design part for this game project and developed a visually appealing design. Customer satisfaction is my top priority :)',
    image: FALLBACK_IMAGES.portfolioShowcase,
    projectCost: '800$-1000$',
    duration: '10-15 Days',
    tags: ['Ui/Ux Design', 'Branding', 'Marketing']
  },
  {
    id: 'proj-2',
    title: 'Lost in the Mountains Apparel',
    description: 'Custom screen print typography and graphic brand assets created for an outdoor venture campaign.',
    image: '/images/mock-package/thumb-1.png',
    projectCost: '600$-850$',
    duration: '7-10 Days',
    tags: ['Graphic Design', 'Illustration', 'Apparel']
  },
  {
    id: 'proj-3',
    title: 'LUNAR Esports Branding',
    description: 'High-energy esport tournament banner and typography system with distinctive glowing vector elements.',
    image: '/images/mock-package/thumb-2.png',
    projectCost: '1200$',
    duration: '14 Days',
    tags: ['Esports', 'Branding', 'Logo']
  },
  {
    id: 'proj-4',
    title: 'Fiber Optic Visual Brand',
    description: 'Modern 3D and vector abstraction representing high-throughput network data architecture.',
    image: '/images/mock-package/thumb-3.png',
    projectCost: '950$',
    duration: '10 Days',
    tags: ['3D Modeling', 'Tech', 'Web']
  }
];

export const DEFAULT_REVIEWS: ClientReviewItem[] = [
  {
    id: 'rev-1',
    buyerName: 'Zervis Solaiman',
    buyerAvatar: FALLBACK_IMAGES.reviewerAvatar,
    country: 'Canada',
    countryFlag: '🇨🇦',
    projectStatus: '1 Project is ongoing',
    rating: 4.8,
    dateText: '2 days ago',
    reviewText: 'It was great to work with him. Recommend to everyone.',
    projectImage: FALLBACK_IMAGES.reviewLunar,
    projectPrice: '$4000',
    projectDuration: '7 Days',
    sellerResponse: 'Thank you so much! It was an absolute pleasure working on the Lunar branding project with your team. Looking forward to our next collaboration!'
  },
  {
    id: 'rev-2',
    buyerName: 'Zervis Solaiman',
    buyerAvatar: FALLBACK_IMAGES.reviewerAvatar,
    country: 'Canada',
    countryFlag: '🇨🇦',
    projectStatus: '1 Project is ongoing',
    rating: 4.8,
    dateText: '2 days ago',
    reviewText: 'It was great to work with him. Recommend to everyone.',
    projectImage: FALLBACK_IMAGES.reviewLunar,
    projectPrice: '$4000',
    projectDuration: '7 Days',
    sellerResponse: 'Always happy to deliver top-tier Figma assets on time. Thank you for the detailed brief and seamless feedback!'
  }
];

export function normalizePackageData(raw: any): NormalizedPackageData {
  if (!raw) raw = {};

  const id = raw._id || raw.id || raw.slug || 'package-details';
  const title = raw.title || "I will create modern minimalist logo design for your business";
  
  // Extract user / seller details
  const rawUser = raw.userID || raw.user || {};
  const sellerId = rawUser._id || rawUser.id || 'seller-1';
  const sellerUsername = rawUser.username || "Nilson Norman";
  const sellerAvatar = rawUser.image || FALLBACK_IMAGES.sellerAvatar;
  const sellerRating = Number(raw.starRating || raw.starNumber || rawUser.starRating || 4.8);
  const reviewCount = Number(raw.totalStars || rawUser.completedOrdersCount || rawUser.totalReviews || 226);
  const sellerBio = rawUser.description || "Hello, I'm a professional book cover designer creating eye-catching, high-converting covers for eBooks and print books. We are an end-to-end digital team with 15+ years of experience creating high-impact web solutions. Our expertise includes Figma UI/UX design, React.js, Next.js, Vue.js, Tailwind CSS, Bootstrap, Webflow, WordPress, Shopify, and Framer.";
  
  const seller: SellerDetails = {
    id: sellerId,
    username: sellerUsername,
    name: sellerUsername,
    avatar: sellerAvatar,
    isPro: true,
    role: "Web Designer",
    rating: sellerRating,
    reviewCount: reviewCount,
    ordersInQueue: Number(raw.ordersInQueue || 8),
    verified: true,
    responseTime: rawUser.responseTimeHours ? `${rawUser.responseTimeHours} Hour` : "1 Hour",
    topRatedIn: "Logo Design",
    returnRate: "87%",
    onTimeDelivery: "98%",
    country: rawUser.country || "Bangladesh",
    memberSince: rawUser.createdAt ? String(new Date(rawUser.createdAt).getFullYear()) : "2009",
    languages: ["English", "Spanish", "French"],
    bio: sellerBio,
    skills: ["UI/UX", "Product Design", "Landing Page", "+22 more"]
  };

  // Extract gallery images
  let gallery: string[] = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    gallery = raw.images.filter(Boolean);
  }
  if (raw.cover && !gallery.includes(raw.cover)) {
    gallery.unshift(raw.cover);
  }
  if (gallery.length === 0) {
    gallery = [...FALLBACK_IMAGES.thumbs];
  } else if (gallery.length < 5) {
    const fillers = FALLBACK_IMAGES.thumbs.filter(img => !gallery.includes(img));
    gallery = [...gallery, ...fillers].slice(0, 5);
  }

  // Parse package tiers
  let parsedPackages: any = {};
  if (typeof raw.packages === 'string') {
    try {
      parsedPackages = JSON.parse(raw.packages);
    } catch {
      parsedPackages = {};
    }
  } else if (raw.packages && typeof raw.packages === 'object') {
    parsedPackages = raw.packages;
  }

  const basePrice = Number(raw.price || 120);

  const basicPrice = Number(parsedPackages.basic?.price || basePrice || 285);
  const silverPrice = Number(parsedPackages.standard?.price || Math.round(basicPrice * 1.7) || 485);
  const platinumPrice = Number(parsedPackages.premium?.price || Math.round(basicPrice * 2.75) || 785);

  const basic: PackageTierDetails = {
    key: 'basic',
    name: "Basic",
    tagline: "Small or test projects",
    price: basicPrice,
    headline: "HOME PAGE OR LANDING PAGE",
    shortDesc: parsedPackages.basic?.description || "1 Screen -Clean Dashboard UI UX design - Developer-ready Figma files - Unlimited revisions",
    deliveryTime: Number(parsedPackages.basic?.deliveryTime || 3),
    revisions: parsedPackages.basic?.revisions ? `${parsedPackages.basic.revisions} Revisions` : "Unlimited Revision",
    features: {
      pageCount: "1 page/screen",
      customAsset: "1 custom asset",
      responsive: true,
      wireframes: true,
      prototype: true,
      sourceFile: true,
      numPages: 1
    }
  };

  const standard: PackageTierDetails = {
    key: 'standard',
    name: "Silver",
    tagline: "Standard business projects",
    price: silverPrice,
    headline: "HOME PAGE +2 SUB-PAGES",
    shortDesc: parsedPackages.standard?.description || "Unique custom design with 30 days free after sales support",
    deliveryTime: Number(parsedPackages.standard?.deliveryTime || 7),
    revisions: parsedPackages.standard?.revisions ? `${parsedPackages.standard.revisions} Revisions` : "3 Revisions",
    features: {
      pageCount: "3 pages/screens",
      customAsset: "3 custom assets",
      responsive: true,
      wireframes: true,
      prototype: true,
      sourceFile: true,
      numPages: 3
    }
  };

  const premium: PackageTierDetails = {
    key: 'premium',
    name: "Platinum",
    tagline: "Complete corporate packages",
    price: platinumPrice,
    headline: "HOME PAGE +10 SUB-PAGES",
    shortDesc: parsedPackages.premium?.description || "Unique custom design with 30 days free after sales support",
    deliveryTime: Number(parsedPackages.premium?.deliveryTime || 10),
    revisions: parsedPackages.premium?.revisions ? `${parsedPackages.premium.revisions} Revisions` : "5 Revisions",
    features: {
      pageCount: "10 pages/screens",
      customAsset: "Unlimited custom assets",
      responsive: true,
      wireframes: true,
      prototype: true,
      sourceFile: true,
      numPages: 6
    }
  };

  // FAQs
  let faqs = DEFAULT_FAQS;
  if (Array.isArray(raw.faqs) && raw.faqs.length > 0) {
    faqs = raw.faqs.map((f: any) => ({
      question: f.question || f.q || "Frequently asked question",
      answer: f.answer || f.a || ""
    }));
  }

  // Reviews
  const reviewsList = Array.isArray(raw.reviews) && raw.reviews.length > 0
    ? raw.reviews.map((r: any, idx: number) => ({
        id: r._id || r.id || `rev-${idx}`,
        buyerName: r.user?.username || r.reviewerName || "Zervis Solaiman",
        buyerAvatar: r.user?.image || FALLBACK_IMAGES.reviewerAvatar,
        country: r.user?.country || "Canada",
        countryFlag: "🇨🇦",
        projectStatus: "1 Project is ongoing",
        rating: Number(r.star || r.rating || 4.8),
        dateText: r.createdAt ? `${new Date(r.createdAt).toLocaleDateString()}` : "2 days ago",
        reviewText: r.comment || r.desc || "It was great to work with him. Recommend to everyone.",
        projectImage: FALLBACK_IMAGES.reviewLunar,
        projectPrice: "$4000",
        projectDuration: "7 Days",
        sellerResponse: r.sellerResponse || "Thank you so much! It was an absolute pleasure working on this project with your team."
      }))
    : DEFAULT_REVIEWS;

  return {
    id,
    title,
    categoryName: raw.category || "Graphics",
    subcategoryName: "Logo & Brand Identity",
    seller,
    gallery,
    packages: {
      basic,
      standard,
      premium
    },
    description: raw.description || "Welcome to the gig with the Most Amazing and Converting Landing Page designs.\n\nI will be designing a custom eye-catching Homepage or landing page for your website. The reviews and the gig images are enough to tell you the story.",
    areaCovered: DEFAULT_AREA_COVERED,
    whyMe: DEFAULT_WHY_ME,
    designTools: [
      { name: "Figma" },
      { name: "Framer" },
      { name: "Adobe XD" }
    ],
    portfolioProjects: DEFAULT_PORTFOLIO_PROJECTS,
    reviewsData: {
      averageRating: 4.8,
      totalReviews: reviewCount,
      starDistribution: {
        5: 88,
        4: 68,
        3: 52,
        2: 24,
        1: 8
      },
      categoryScores: {
        communication: 5,
        quality: 4,
        value: 3
      },
      list: reviewsList
    },
    faqs,
    isFavorited: Boolean(raw.isFavorited),
    favoriteCount: Number(raw.favoriteCount || 0)
  };
}
