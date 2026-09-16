import { useQuery } from "@tanstack/react-query";
import adminAxios from "@/utils/adminAxios";

export const ADMIN_CATEGORIES_QUERY_KEY = ["admin-categories"] as const;

export interface AdminCategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  iconPublicId?: string;
  banner?: string;
  bannerPublicId?: string;
  public_id?: string;
  isActive?: boolean;
  parentId?: string | null;
  parentName?: string;
  // children are the sub categories of this category
  children?: AdminCategory[];
  subCategories?: AdminCategory[];
  subcategories?: AdminCategory[];
  gigCount?: number;
  [key: string]: any;
}

export const fetchAdminCategories = async () => {
  const { data } = await adminAxios.get("/categories");
  return data;
};

export const extractCategoriesList = (fetchedData: any): AdminCategory[] => {
  if (Array.isArray(fetchedData)) {
    return fetchedData;
  }
  if (Array.isArray(fetchedData?.data)) {
    return fetchedData.data;
  }
  if (Array.isArray(fetchedData?.categories)) {
    return fetchedData.categories;
  }
  return [];
};

export const useAdminCategories = () => {
  const query = useQuery({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchAdminCategories();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const rawList = extractCategoriesList(query.data);

  // Separate parent categories from child subcategories
  const rawParents = rawList.filter((c: any) => typeof c === 'string' || !c.parentId);
  const rawChildren = rawList.filter((c: any) => typeof c !== 'string' && Boolean(c.parentId));

  // Build parent categories with children as their sub categories
  const parentCategories: AdminCategory[] = rawParents.map((cat: any) => {
    if (typeof cat === 'string') {
      const slug = cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return {
        id: slug,
        name: cat,
        slug,
        children: [],
        subCategories: [],
        subcategories: [],
      };
    }

    const catId = cat.id || cat._id;
    const catName = cat.name || cat.title || String(cat);

    // Children will be sub categories (directly from backend cat.children or matched by parentId)
    let subCats: AdminCategory[] = [];
    if (Array.isArray(cat.children) && cat.children.length > 0) {
      subCats = cat.children;
    } else if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
      subCats = cat.subcategories;
    } else {
      subCats = rawChildren.filter((child: any) =>
        (catId && child.parentId === catId) ||
        (catName && child.parentName?.toLowerCase() === catName.toLowerCase())
      );
    }

    // Format sub categories and attach their 2nd-level child niches
    const formattedSubCats = subCats.map((sub: any) => {
      const subId = sub.id || sub._id;
      const subTitle = sub.name || sub.title || String(sub);
      const subSlug = sub.slug || subTitle.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Resolve 2nd-level children (niches)
      let rawNiches: any[] = [];
      if (Array.isArray(sub.children) && sub.children.length > 0) {
        rawNiches = sub.children;
      } else if (Array.isArray(sub.subcategories) && sub.subcategories.length > 0) {
        rawNiches = sub.subcategories;
      } else if (Array.isArray(rawList)) {
        rawNiches = rawList.filter((c: any) =>
          c && typeof c !== 'string' && c.parentId &&
          ((subId && (c.parentId === subId || c.parentId === sub._id)) ||
           (subTitle && c.parentName?.toLowerCase() === subTitle.toLowerCase()))
        );
      }

      const formattedNiches: AdminCategory[] = rawNiches.map((n: any) => {
        const nId = n.id || n._id;
        const nTitle = n.name || n.title || String(n);
        const nSlug = n.slug || nTitle.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return {
          ...n,
          id: nId || nSlug,
          name: nTitle,
          slug: nSlug,
          parentId: n.parentId || subId,
          parentName: n.parentName || subTitle,
          children: n.children || [],
        };
      });

      return {
        ...sub,
        id: subId || subSlug,
        name: subTitle,
        slug: subSlug,
        parentId: sub.parentId || catId,
        parentName: sub.parentName || catName,
        children: formattedNiches,
        subCategories: formattedNiches,
        subcategories: formattedNiches,
        niches: formattedNiches,
      };
    });

    return {
      ...cat,
      id: catId || cat.slug || catName,
      name: catName,
      slug: cat.slug || catName.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      // children will be sub categories
      children: formattedSubCats,
      subCategories: formattedSubCats,
      subcategories: formattedSubCats,
    };
  });

  // All sub categories (all children across all parents)
  const subCategories: AdminCategory[] = parentCategories.flatMap((p) => p.children || []);

  // Helper function to easily retrieve sub categories for a given parent by slug or id
  const getSubcategories = (parentSlugOrId?: string): AdminCategory[] => {
    if (!parentSlugOrId) return [];
    const normalized = parentSlugOrId.toLowerCase().trim();
    const parent = parentCategories.find(
      (p) =>
        p.slug?.toLowerCase() === normalized ||
        p.id?.toLowerCase() === normalized ||
        p._id?.toLowerCase() === normalized ||
        p.name?.toLowerCase() === normalized
    );
    return parent?.children || [];
  };

  // Helper function to retrieve 2nd child niches for a given subcategory by slug or id
  const getNiches = (subSlugOrId?: string): AdminCategory[] => {
    if (!subSlugOrId) return [];
    const normalized = subSlugOrId.toLowerCase().trim();
    const sub = subCategories.find(
      (s) =>
        s.slug?.toLowerCase() === normalized ||
        s.id?.toLowerCase() === normalized ||
        s._id?.toLowerCase() === normalized ||
        s.name?.toLowerCase() === normalized
    );
    if (sub?.children && sub.children.length > 0) {
      return sub.children;
    }
    // Fallback search across rawList for direct child nodes of this subcategory
    const targetId = sub?.id || sub?._id || subSlugOrId;
    return rawList
      .filter((c: any) => c && typeof c !== 'string' && c.parentId && (c.parentId === targetId || (sub?._id && c.parentId === sub._id)))
      .map((n: any) => {
        const nId = n.id || n._id;
        const nTitle = n.name || n.title || String(n);
        const nSlug = n.slug || nTitle.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return {
          ...n,
          id: nId || nSlug,
          name: nTitle,
          slug: nSlug,
          parentId: n.parentId,
        };
      });
  };

  return {
    ...query,
    data: query.data ?? [],
    categoryList: rawList,
    parentCategories,
    subCategories,
    getSubcategories,
    getNiches,
  };
};

export default useAdminCategories;
