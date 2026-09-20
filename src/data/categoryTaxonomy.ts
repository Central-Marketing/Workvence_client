export interface SubcategoryItem {
  id: string;
  title: string;
  banner: string;
  subtitle?: string;
  resultCount?: string;
  items: string[];
}

export interface CategoryTaxonomy {
  slug: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultBanner?: string;
  subcategories: SubcategoryItem[];
}

// Empty dictionary - all category taxonomy data is dynamically derived from backend API
export const CATEGORY_TAXONOMIES: Record<string, CategoryTaxonomy> = {};

const isValidUrl = (url: unknown): boolean => {
  if (typeof url !== "string") return false;
  const t = url.trim();
  return t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/");
};

export const getFallbackSubcategoryBanner = (slugOrName: string = ""): string => {
  const s = slugOrName.toLowerCase();
  if (s.includes("artist") || s.includes("design") || s.includes("art") || s.includes("image")) {
    return "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=85";
  }
  if (s.includes("bot") || s.includes("chat") || s.includes("agent")) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=85";
  }
  if (s.includes("workflow") || s.includes("automation") || s.includes("n8n") || s.includes("zapier")) {
    return "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=85";
  }
  if (s.includes("data") || s.includes("learning") || s.includes("science") || s.includes("analytics")) {
    return "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85";
  }
  if (s.includes("consult") || s.includes("business") || s.includes("strategy")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85";
  }
  if (s.includes("code") || s.includes("tech") || s.includes("dev") || s.includes("software")) {
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=85";
  }
  return "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=85";
};

/**
 * Dynamically constructs CategoryTaxonomy strictly from live API category data.
 */
export const getCategoryTaxonomy = (slug: string, apiCategories?: any[]): CategoryTaxonomy | null => {
  if (!slug) return null;

  const normalizedSlug = slug.toLowerCase().trim().replace(/&/g, "and").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Find matching live API category
  const apiCategory = apiCategories?.find((cat: any) => {
    const catSlug = (cat?.slug || cat?.name || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const rawCatSlug = (cat?.slug || "").toLowerCase().trim();
    return (
      catSlug === normalizedSlug ||
      rawCatSlug === normalizedSlug ||
      cat?.id === slug ||
      cat?._id === slug
    );
  });

  const categoryName =
    apiCategory?.name ||
    apiCategory?.title ||
    slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  // Extract 1st-level children (subcategories) directly from live backend category
  const rawApiChildren =
    Array.isArray(apiCategory?.children) && apiCategory.children.length > 0
      ? apiCategory.children
      : Array.isArray(apiCategory?.subcategories) && apiCategory.subcategories.length > 0
      ? apiCategory.subcategories
      : Array.isArray(apiCategories)
      ? apiCategories.filter(
          (c: any) =>
            c.parentId &&
            (c.parentId === apiCategory?.id ||
              c.parentId === apiCategory?._id ||
              c.parentName?.toLowerCase() === apiCategory?.name?.toLowerCase())
        )
      : [];

  // Map 1st-level children to subcategory cards and 2nd-level children strictly to items
  const subcategories: SubcategoryItem[] = rawApiChildren.map((child: any) => {
    const childTitle = child.name || child.title || String(child);
    const childSlug =
      child.slug ||
      childTitle
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    // 2nd children of each 1st child directly from backend
    let secondChildren: any[] = [];
    if (Array.isArray(child.children) && child.children.length > 0) {
      secondChildren = child.children;
    } else if (Array.isArray(child.subcategories) && child.subcategories.length > 0) {
      secondChildren = child.subcategories;
    } else if (Array.isArray(apiCategories)) {
      secondChildren = apiCategories.filter(
        (c: any) => c.parentId && (c.parentId === child.id || c.parentId === child._id)
      );
    }

    const items: string[] = secondChildren.map((c: any) => c.name || c.title || String(c));

    const banner = isValidUrl(child.banner)
      ? child.banner
      : getFallbackSubcategoryBanner(childSlug || childTitle);

    return {
      id: childSlug,
      title: childTitle,
      subtitle: child.description || undefined,
      resultCount: child.gigCount ? `${child.gigCount}+ Results` : undefined,
      banner,
      items,
    };
  });

  return {
    slug: normalizedSlug,
    name: categoryName,
    heroTitle: categoryName,
    heroSubtitle:
      apiCategory?.description || `Discover top quality ${categoryName} services from verified experts`,
    defaultBanner: isValidUrl(apiCategory?.banner) ? apiCategory.banner : undefined,
    subcategories,
  };
};
