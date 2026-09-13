import { 
  DashboardPackageItem, 
  DashboardOrderItem, 
  ManageOrderItem,
  MOCK_RECOMMENDED_PACKAGES, 
  MOCK_POPULAR_PACKAGES,
  MOCK_BUYER_ORDERS,
  MOCK_MANAGE_ORDERS 
} from "../data/mockBuyerDashboard";

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

/**
 * Normalizes orders from API for Buyer Dashboard with fallback to mock orders
 */
export function normalizeDashboardOrders(
  apiOrders: any[],
  fallbackList: DashboardOrderItem[] = MOCK_BUYER_ORDERS
): DashboardOrderItem[] {
  const items = Array.isArray(apiOrders)
    ? apiOrders
    : Array.isArray((apiOrders as any)?.orders)
    ? (apiOrders as any).orders
    : Array.isArray((apiOrders as any)?.data)
    ? (apiOrders as any).data
    : [];

  if (!items || items.length === 0) {
    return fallbackList;
  }

  const normalized = items.map((order: any, idx: number) => {
    const fallback = fallbackList[idx % fallbackList.length];

    // Format dates
    let orderDate = fallback.orderDate;
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) {
        orderDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }

    let dueDate = fallback.dueDate;
    if (order.deadline) {
      const d = new Date(order.deadline);
      if (!isNaN(d.getTime())) {
        dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }

    // Determine status
    let status: DashboardOrderItem["status"] = "in_progress";
    if (order.status === "completed") status = "completed";
    else if (order.status === "delivered") status = "delivered";
    else if (order.status === "revision") status = "revision";
    else status = "in_progress";

    const itemType: "package" | "brief" = 
      order.briefID || order.type === "brief" ? "brief" : "package";

    return {
      id: String(order._id || order.id || fallback.id),
      title: order.title || order.gigID?.title || fallback.title,
      coverImage: order.image || order.cover || order.gigID?.cover || fallback.coverImage,
      itemType,
      orderDate,
      dueDate,
      price: typeof order.price === "number" ? order.price : fallback.price,
      status,
    };
  });

  // If fewer than 3 items, pad with fallbacks to preserve the rich pixel-perfect design
  if (normalized.length < 3) {
    const padded = [...normalized];
    for (let i = normalized.length; i < 3; i++) {
      padded.push(fallbackList[i]);
    }
    return padded;
  }

  return normalized;
}

/**
 * Normalizes orders for Manage Orders table with full seller details, notes, badges, and fallbacks
 */
export function normalizeManageOrders(
  apiOrders: any[],
  fallbackList: ManageOrderItem[] = MOCK_MANAGE_ORDERS
): ManageOrderItem[] {
  const items = Array.isArray(apiOrders)
    ? apiOrders
    : Array.isArray((apiOrders as any)?.orders)
    ? (apiOrders as any).orders
    : Array.isArray((apiOrders as any)?.data)
    ? (apiOrders as any).data
    : [];

  if (!items || items.length === 0) {
    return fallbackList;
  }

  const normalized = items.map((order: any, idx: number) => {
    const fallback = fallbackList[idx % fallbackList.length];

    // Seller extraction
    const sellerObj = typeof order.sellerID === "object" ? order.sellerID : {};
    const sellerName = sellerObj.username || sellerObj.name || fallback.seller.name;
    const sellerAvatar = sellerObj.image || sellerObj.avatar || fallback.seller.avatar;
    const sellerRole = sellerObj.title || sellerObj.role || fallback.seller.role;
    const sellerBadge = sellerObj.badge || fallback.seller.badge;

    // Due date
    let dueDate = fallback.dueDate;
    if (order.deadline) {
      const d = new Date(order.deadline);
      if (!isNaN(d.getTime())) {
        dueDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }

    // Status mapping
    let status: ManageOrderItem["status"] = fallback.status;
    if (order.status === "completed") status = "completed";
    else if (order.status === "delivered") status = "delivered";
    else if (order.status === "revision") status = "revision";
    else if (order.status === "failed") status = "failed";
    else if (order.status === "pending") status = "pending";
    else if (order.status === "cancelled") status = "cancelled";
    else if (order.status === "late") status = "late";
    else status = "inprogress";

    return {
      id: String(order._id || order.id || fallback.id),
      seller: {
        id: String(sellerObj._id || sellerObj.id || fallback.seller.id),
        name: sellerName,
        avatar: sellerAvatar,
        role: sellerRole,
        badge: sellerBadge,
      },
      projectTitle: order.title || order.gigID?.title || fallback.projectTitle,
      projectDescription: order.description || order.gigID?.description || fallback.projectDescription,
      dueDate,
      notes: order.notes || order.instructions || fallback.notes,
      price: typeof order.price === "number" ? order.price : fallback.price,
      status,
      starred: Boolean(order.starred ?? fallback.starred),
    };
  });

  // Pad to at least 5 rows if fewer to keep the design pixel-perfect
  if (normalized.length < 5) {
    const padded = [...normalized];
    for (let i = normalized.length; i < 5; i++) {
      padded.push(fallbackList[i]);
    }
    return padded;
  }

  return normalized;
}


