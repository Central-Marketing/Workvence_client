import { CATEGORY_TAXONOMIES } from "@/data/categoryTaxonomy";

export interface PackageTierDetails {
  key: 'basic' | 'standard' | 'premium';
  title: string;
  name: string;
  tagline: string;
  price: number;
  headline: string;
  shortDesc: string;
  deliveryTime: number; // in days
  revisions: string;
  featureList: string[];
  hasTier?: boolean;
  features: {
    pageCount: string;
    customAsset: string;
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
  isOnline?: boolean;
  lastSeen?: string;
  lastActiveAt?: string;
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
  projectStatus?: string;
  rating: number;
  dateText: string;
  reviewText: string;
  projectImage?: string;
  projectPrice?: string;
  projectDuration?: string;
  sellerResponse?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NormalizedPackageData {
  id: string;
  slug?: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  subcategoryName: string;
  seller: SellerDetails;
  gallery: string[];
  packages: {
    basic: PackageTierDetails;
    standard: PackageTierDetails;
    premium: PackageTierDetails;
  };
  hasMultipleTiers: boolean;
  description: string;
  areaCovered: string[];
  whyMe: string[];
  tools: string[];
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

export function formatCategoryName(slug?: string): string {
  if (!slug) return "General Services";
  const matched = (CATEGORY_TAXONOMIES as Record<string, any>)[slug];
  if (matched?.name) return matched.name;
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\bAnd\b/g, "&");
}

export function normalizePackageData(raw: any): NormalizedPackageData {
  if (!raw) raw = {};

  const id = raw._id || raw.id || raw.slug || 'package-details';
  const slug = raw.slug || '';
  const title = raw.title || raw.shortTitle || "Service Package";

  const categorySlug = raw.category || "";
  const categoryName = formatCategoryName(categorySlug);
  const subcategoryName = raw.subcategory || (Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags[0] : "");

  // Extract seller information
  const rawUser =
    typeof raw.userID === "object" && raw.userID !== null
      ? raw.userID
      : typeof raw.user === "object" && raw.user !== null
      ? raw.user
      : {};

  const sellerId = rawUser._id || rawUser.id || (typeof raw.userID === "string" ? raw.userID : "");
  const sellerUsername = rawUser.username || "Seller";
  const sellerName =
    rawUser.name ||
    rawUser.fullName ||
    (rawUser.firstName
      ? `${rawUser.firstName} ${rawUser.lastName || ""}`.trim()
      : "") ||
    sellerUsername;
  const sellerAvatar = rawUser.image || rawUser.img || rawUser.avatar || "";
  const isOnline = Boolean(rawUser.isOnline ?? raw.isOnline ?? false);
  const lastActiveAt = rawUser.lastActiveAt || raw.lastActiveAt || rawUser.lastSeen || rawUser.updatedAt || raw.updatedAt || raw.createdAt || "";
  const lastSeen = lastActiveAt;
  const isPro = Boolean(
    rawUser.isPro ||
    (typeof rawUser.sellerLevel === "string" &&
      (rawUser.sellerLevel.toLowerCase().includes("top") || rawUser.sellerLevel.toLowerCase().includes("pro")))
  );

  const sellerRating = Number(raw.starRating ?? rawUser.starRating ?? 0);
  const reviewCount = Number(raw.totalReviews ?? raw.totalStars ?? rawUser.totalReviews ?? 0);
  const sellerBio = rawUser.description || "";

  const sellerRole =
    rawUser.headline ||
    rawUser.role ||
    rawUser.sellerLevel ||
    "";

  const responseTime = rawUser.responseTimeHours
    ? `${rawUser.responseTimeHours} Hour${rawUser.responseTimeHours > 1 ? 's' : ''}`
    : "";

  const returnRate = rawUser.metrics?.overall?.jobSuccessRate
    ? `${rawUser.metrics.overall.jobSuccessRate}%`
    : "";

  const onTimeDelivery = rawUser.metrics?.overall?.onTimeDeliveryRate
    ? `${rawUser.metrics.overall.onTimeDeliveryRate}%`
    : rawUser.onTimeDeliveryRate
    ? `${rawUser.onTimeDeliveryRate}%`
    : "";

  const memberSince = rawUser.createdAt
    ? String(new Date(rawUser.createdAt).getFullYear())
    : "";

  const sellerSkills = Array.isArray(rawUser.skills) && rawUser.skills.length > 0
    ? rawUser.skills
    : Array.isArray(raw.tags) && raw.tags.length > 0
    ? raw.tags
    : [];

  const seller: SellerDetails = {
    id: sellerId,
    username: sellerUsername,
    name: sellerName,
    avatar: sellerAvatar,
    isPro,
    role: sellerRole,
    rating: sellerRating,
    reviewCount,
    ordersInQueue: Number(raw.ordersInQueue || 0),
    verified: Boolean(rawUser.kycStatus === 'approved' || rawUser.isVerified),
    responseTime,
    topRatedIn: categoryName,
    returnRate,
    onTimeDelivery,
    country: rawUser.country || "",
    memberSince,
    languages: Array.isArray(rawUser.languages) ? rawUser.languages : [],
    bio: sellerBio,
    skills: sellerSkills,
    isOnline,
    lastSeen,
    lastActiveAt,
  };

  // Real gallery images only
  const gallery: string[] = [];
  if (raw.cover && typeof raw.cover === 'string' && raw.cover.trim()) {
    gallery.push(raw.cover.trim());
  }
  if (Array.isArray(raw.images)) {
    raw.images.forEach((img: any) => {
      if (typeof img === 'string' && img.trim() && !gallery.includes(img.trim())) {
        gallery.push(img.trim());
      }
    });
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

  const basePrice = Number(raw.price || 0);

  const formatRevisions = (val: any) => {
    if (val === undefined || val === null || val === "" || val === 0 || val === "0") return "";
    return `${val} Revisions`;
  };

  // Extract Basic tier
  const basicRaw = parsedPackages.basic || {};
  const basicPrice = Number(basicRaw.price ?? basePrice ?? 0);
  const basicDelivery = Number(basicRaw.deliveryTime ?? raw.deliveryTime ?? raw.deliveryDays ?? 0);
  const basicRevisions = formatRevisions(basicRaw.revisionNumber ?? basicRaw.revisions ?? raw.revisionNumber);

  const basicFeatures: string[] = Array.isArray(basicRaw.features) && basicRaw.features.length > 0
    ? basicRaw.features
    : [];

  const basicTitle = basicRaw.title || raw.shortTitle || raw.title || "";

  const basic: PackageTierDetails = {
    key: 'basic',
    title: basicTitle,
    name: "Basic",
    tagline: basicRaw.tagline || "",
    price: basicPrice,
    headline: basicTitle,
    shortDesc: basicRaw.shortDesc || basicRaw.desc || raw.shortDesc || "",
    deliveryTime: basicDelivery,
    revisions: basicRevisions,
    featureList: basicFeatures,
    hasTier: true,
    features: {
      pageCount: `${basicFeatures.length} Deliverables`,
      customAsset: "",
      responsive: true,
      wireframes: false,
      prototype: false,
      sourceFile: false,
      numPages: 1
    }
  };

  // Extract Standard tier
  const standardRaw = parsedPackages.standard;
  const hasStandard = Boolean(
    standardRaw &&
    (standardRaw.price !== undefined || standardRaw.title || standardRaw.shortDesc || standardRaw.desc)
  );
  const standardPrice = hasStandard ? Number(standardRaw.price ?? 0) : 0;
  const standardDelivery = hasStandard ? Number(standardRaw.deliveryTime ?? 0) : 0;
  const standardRevisions = hasStandard
    ? formatRevisions(standardRaw.revisionNumber ?? standardRaw.revisions)
    : "";
  const standardFeatures: string[] = hasStandard && Array.isArray(standardRaw.features) && standardRaw.features.length > 0
    ? standardRaw.features
    : [];

  const standardTitle = standardRaw?.title || "";

  const standard: PackageTierDetails = {
    key: 'standard',
    title: standardTitle,
    name: "Standard",
    tagline: standardRaw?.tagline || "",
    price: standardPrice,
    headline: standardTitle,
    shortDesc: standardRaw?.shortDesc || standardRaw?.desc || "",
    deliveryTime: standardDelivery,
    revisions: standardRevisions,
    featureList: standardFeatures,
    hasTier: hasStandard,
    features: {
      pageCount: `${standardFeatures.length} Deliverables`,
      customAsset: "",
      responsive: true,
      wireframes: false,
      prototype: false,
      sourceFile: false,
      numPages: 2
    }
  };

  // Extract Premium tier
  const premiumRaw = parsedPackages.premium;
  const hasPremium = Boolean(
    premiumRaw &&
    (premiumRaw.price !== undefined || premiumRaw.title || premiumRaw.shortDesc || premiumRaw.desc)
  );
  const premiumPrice = hasPremium ? Number(premiumRaw.price ?? 0) : 0;
  const premiumDelivery = hasPremium ? Number(premiumRaw.deliveryTime ?? 0) : 0;
  const premiumRevisions = hasPremium
    ? formatRevisions(premiumRaw.revisionNumber ?? premiumRaw.revisions)
    : "";
  const premiumFeatures: string[] = hasPremium && Array.isArray(premiumRaw.features) && premiumRaw.features.length > 0
    ? premiumRaw.features
    : [];

  const premiumTitle = premiumRaw?.title || "";

  const premium: PackageTierDetails = {
    key: 'premium',
    title: premiumTitle,
    name: "Premium",
    tagline: premiumRaw?.tagline || "",
    price: premiumPrice,
    headline: premiumTitle,
    shortDesc: premiumRaw?.shortDesc || premiumRaw?.desc || "",
    deliveryTime: premiumDelivery,
    revisions: premiumRevisions,
    featureList: premiumFeatures,
    hasTier: hasPremium,
    features: {
      pageCount: `${premiumFeatures.length} Deliverables`,
      customAsset: "",
      responsive: true,
      wireframes: false,
      prototype: false,
      sourceFile: false,
      numPages: 5
    }
  };

  const hasMultipleTiers = hasStandard || hasPremium;

  // Real tools list
  const tools: string[] = Array.isArray(parsedPackages.tools_use) && parsedPackages.tools_use.length > 0
    ? parsedPackages.tools_use
    : Array.isArray(parsedPackages.toolsUse) && parsedPackages.toolsUse.length > 0
    ? parsedPackages.toolsUse
    : Array.isArray(raw.tools_use) && raw.tools_use.length > 0
    ? raw.tools_use
    : Array.isArray(raw.toolsUse) && raw.toolsUse.length > 0
    ? raw.toolsUse
    : [];

  // Real deliverables / area covered
  const areaCovered: string[] = Array.isArray(raw.features) && raw.features.length > 0
    ? raw.features
    : Array.isArray(raw.tags) && raw.tags.length > 0
    ? raw.tags
    : [];

  // Real highlights / Why me
  const whyMe: string[] = [];
  if (onTimeDelivery) {
    whyMe.push(`${onTimeDelivery} On-Time Delivery Record`);
  }
  if (returnRate) {
    whyMe.push(`${returnRate} Order Completion Success Rate`);
  }
  if (responseTime) {
    whyMe.push(`Fast communication (average ${responseTime} response)`);
  }

  // Real FAQs only
  const faqs: FaqItem[] = [];
  if (Array.isArray(raw.faqs)) {
    raw.faqs.forEach((item: any) => {
      const q = item?.question || item?.q || "";
      const a = item?.answer || item?.a || "";
      if (q.trim() && a.trim()) {
        faqs.push({ question: q.trim(), answer: a.trim() });
      }
    });
  }

  // Real reviews
  const rawReviews = Array.isArray(raw.reviews) ? raw.reviews : [];
  const reviewsList: ClientReviewItem[] = rawReviews.map((r: any, idx: number) => {
    const revUser = r.user || (typeof r.userID === 'object' ? r.userID : {}) || {};
    return {
      id: r._id || r.id || `rev-${idx}`,
      buyerName: revUser.username || r.reviewerName || "Verified Buyer",
      buyerAvatar: revUser.image || "",
      country: revUser.country || "",
      countryFlag: "",
      rating: Number(r.star ?? r.rating ?? 5),
      dateText: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      reviewText: r.description || r.comment || r.desc || "",
      sellerResponse: r.sellerResponse || undefined
    };
  });

  // Calculate real star distribution
  const starCounts = raw.starCounts || {};
  const totalStarCountReviews = Object.values(starCounts).reduce((acc: number, cur: any) => acc + Number(cur || 0), 0) as number;
  const starDistribution: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalStarCountReviews > 0) {
    for (let s = 1; s <= 5; s++) {
      starDistribution[s] = Math.round(((Number(starCounts[s]) || 0) / totalStarCountReviews) * 100);
    }
  } else if (reviewsList.length > 0) {
    const counts: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
    });
    for (let s = 1; s <= 5; s++) {
      starDistribution[s] = Math.round((counts[s] / reviewsList.length) * 100);
    }
  }

  const ratingBreakdown = raw.ratingBreakdown || {};
  const categoryScores = {
    communication: Number(ratingBreakdown.communication || (reviewsList.length > 0 ? 5 : 0)),
    quality: Number(ratingBreakdown.qualityOfDelivery || (reviewsList.length > 0 ? 5 : 0)),
    value: Number(ratingBreakdown.valueOfDelivery || (reviewsList.length > 0 ? 5 : 0))
  };

  // Real portfolio items if any
  const portfolioProjects: PortfolioProject[] = [];
  if (Array.isArray(raw.portfolio)) {
    raw.portfolio.forEach((p: any, idx: number) => {
      if (p && (p.title || p.image)) {
        portfolioProjects.push({
          id: p.id || p._id || `proj-${idx}`,
          title: p.title || "Project Deliverable",
          description: p.description || p.desc || "",
          image: p.image || p.cover || "",
          projectCost: p.cost ? `$${p.cost}` : "",
          duration: p.duration ? `${p.duration} Days` : "",
          tags: Array.isArray(p.tags) ? p.tags : []
        });
      }
    });
  }

  return {
    id,
    slug,
    title,
    categoryName,
    categorySlug,
    subcategoryName,
    seller,
    gallery,
    packages: {
      basic,
      standard,
      premium
    },
    hasMultipleTiers,
    description: raw.description || "",
    areaCovered,
    whyMe,
    tools,
    designTools: tools.map(t => ({ name: t })),
    portfolioProjects,
    reviewsData: {
      averageRating: Number(raw.starRating ?? (reviewsList.length > 0 ? 5 : 0)),
      totalReviews: reviewsList.length || Number(raw.totalReviews || 0),
      starDistribution,
      categoryScores,
      list: reviewsList
    },
    faqs,
    isFavorited: Boolean(raw.isFavorited),
    favoriteCount: Number(raw.favoriteCount || 0)
  };
}
