import { DashboardPackageItem, MOCK_RECOMMENDED_PACKAGES, MOCK_POPULAR_PACKAGES } from "../data/mockBuyerDashboard";

/**
 * Normalizes backend gig/package item into a DashboardPackageItem
 */
export function normalizeDashboardPackage(item: any, fallback: DashboardPackageItem): DashboardPackageItem {
  if (!item) return fallback;

  const id = item._id || item.id || fallback.id;
  const title = item.title || item.name || fallback.title;
  const coverImage =
    item.cover ||
    item.coverImage ||
    item.image ||
    (Array.isArray(item.images) && item.images[0]) ||
    fallback.coverImage;

  const price = typeof item.price === "number" ? item.price : fallback.price;
  const rating =
    typeof item.star === "number"
      ? item.star
      : typeof item.rating === "number"
      ? item.rating
      : fallback.rating;

  const reviewCount =
    typeof item.starNumber === "number"
      ? item.starNumber
      : typeof item.reviewCount === "number"
      ? item.reviewCount
      : typeof item.sales === "number"
      ? item.sales
      : fallback.reviewCount;

  const sellerObj = item.userID || item.user || item.sellerID || item.seller || {};
  const sellerId = sellerObj._id || sellerObj.id || fallback.seller.id;
  const username = sellerObj.username || sellerObj.name || fallback.seller.username;
  const avatar = sellerObj.image || sellerObj.img || sellerObj.avatar || fallback.seller.avatar;

  return {
    id: String(id),
    title,
    coverImage,
    price,
    rating,
    reviewCount,
    badge: item.badge || fallback.badge,
    seller: {
      id: String(sellerId),
      username,
      avatar,
    },
  };
}

/**
 * Normalizes a list of packages from API with a fallback array
 */
export function normalizeDashboardPackageList(
  apiData: any,
  fallbackList: DashboardPackageItem[]
): DashboardPackageItem[] {
  const items = Array.isArray(apiData)
    ? apiData
    : Array.isArray(apiData?.packages)
    ? apiData.packages
    : Array.isArray(apiData?.gigs)
    ? apiData.gigs
    : Array.isArray(apiData?.data)
    ? apiData.data
    : [];

  if (!items || items.length === 0) {
    return fallbackList;
  }

  return items.slice(0, 8).map((item: any, idx: number) => {
    const fallback = fallbackList[idx % fallbackList.length];
    return normalizeDashboardPackage(item, fallback);
  });
}

/**
 * Computes profile completion percentage for the current user
 */
export function calculateProfileCompletion(user: any): number {
  if (!user) return 50;

  const checks = [
    Boolean(user.username),
    Boolean(user.email),
    Boolean(user.image && user.image !== "/media/noavatar.png"),
    Boolean(user.desc || user.bio || user.description),
    Boolean(user.country || user.location),
    Boolean(user.phone),
  ];

  const completed = checks.filter(Boolean).length;
  // Scale between 40% and 100% so it looks encouraging
  const percentage = Math.round((completed / checks.length) * 100);
  return Math.max(30, Math.min(100, percentage || 50));
}
