import { useQuery } from "@tanstack/react-query";
import adminAxios from "@/utils/adminAxios";
import axiosFetch from "@/utils/axiosFetch";

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
  try {
    const { data } = await adminAxios.get("/categories");
    if (data && (Array.isArray(data) ? data.length > 0 : (data.data?.length > 0 || data.categories?.length > 0))) {
      return data;
    }
    return data;
  } catch {
    try {
      const { data } = await axiosFetch.get("/categories");
      return data;
    } catch {
      return [];
    }
  }
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

export const isCategoryRoot = (cat: any, allCategories?: any[]): boolean => {
  if (!cat) return false;
  if (typeof cat === 'string') return true;

  // Check parentId
  if (cat.parentId !== undefined && cat.parentId !== null) {
    const pId = String(cat.parentId).trim().toLowerCase();
    if (pId !== "" && pId !== "null" && pId !== "undefined") {
      return false;
    }
  }

  // Check parent_id
  if (cat.parent_id !== undefined && cat.parent_id !== null) {
    const pId = String(cat.parent_id).trim().toLowerCase();
    if (pId !== "" && pId !== "null" && pId !== "undefined") {
      return false;
    }
  }

  // Check parentName
  if (cat.parentName !== undefined && cat.parentName !== null) {
    const pName = String(cat.parentName).trim().toLowerCase();
    if (pName !== "" && pName !== "null" && pName !== "undefined") {
      return false;
    }
  }

  // Check parent object
  if (cat.parent && typeof cat.parent === 'object' && Object.keys(cat.parent).length > 0) {
    return false;
  }

  // Check level
  if (cat.level !== undefined && Number(cat.level) > 0) {
    return false;
  }

  // Check boolean flags
  if (cat.isSubcategory === true || cat.isChild === true) {
    return false;
  }

  // Cross-reference if this category is marked as a child of any other category in allCategories
  if (Array.isArray(allCategories) && allCategories.length > 0) {
    const catId = cat.id || cat._id;
    const catSlug = cat.slug;
    const isContainedAsChild = allCategories.some((other: any) => {
      if (!other || typeof other === 'string' || other === cat) return false;
      const childArr = Array.isArray(other.children) ? other.children : Array.isArray(other.subcategories) ? other.subcategories : [];
      return childArr.some((ch: any) => {
        if (!ch) return false;
        if (typeof ch === 'string') return ch === catId || ch === catSlug;
        return (ch.id && ch.id === catId) || (ch._id && ch._id === catId) || (ch.slug && ch.slug === catSlug);
      });
    });
    if (isContainedAsChild) return false;
  }

  return true;
};

export const deduplicateCategories = <T extends { id?: any; _id?: any; slug?: string; name?: string; title?: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item) continue;
    const idKey = String(item.id || item._id || '').trim();
    const slugKey = String(item.slug || '').trim().toLowerCase();
    const nameKey = String(item.name || item.title || '').trim().toLowerCase();
    const primaryKey = idKey || slugKey || nameKey;
    if (primaryKey && !seen.has(primaryKey)) {
      seen.add(primaryKey);
      if (idKey) seen.add(idKey);
      if (slugKey) seen.add(slugKey);
      result.push(item);
    } else if (!primaryKey) {
      result.push(item);
    }
  }
  return result;
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

  // Separate parent categories from child subcategories strictly
  const rawParents = deduplicateCategories(rawList.filter((c: any) => isCategoryRoot(c, rawList)));
  const rawChildren = rawList.filter((c: any) => !isCategoryRoot(c, rawList));

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

    // Collect direct subcategories from nested children and flat records matching parentId
    const nestedSubCats = [
      ...(Array.isArray(cat.children) ? cat.children : []),
      ...(Array.isArray(cat.subcategories) ? cat.subcategories : []),
    ];
    const flatSubCats = rawChildren.filter((child: any) =>
      (catId && (child.parentId === catId || (cat._id && child.parentId === cat._id))) ||
      (catName && child.parentName?.toLowerCase() === catName.toLowerCase())
    );

    const subCats: AdminCategory[] = deduplicateCategories([...nestedSubCats, ...flatSubCats]);

    // Format sub categories and attach their 2nd-level child niches
    const formattedSubCats = subCats.map((sub: any) => {
      const subId = sub.id || sub._id;
      const subTitle = sub.name || sub.title || String(sub);
      const subSlug = sub.slug || subTitle.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Resolve 2nd-level children (niches) from nested and flat records
      const nestedNiches = [
        ...(Array.isArray(sub.children) ? sub.children : []),
        ...(Array.isArray(sub.subcategories) ? sub.subcategories : []),
      ];
      const flatNiches = Array.isArray(rawList)
        ? rawList.filter((c: any) =>
            c && typeof c !== 'string' && c.parentId &&
            ((subId && (c.parentId === subId || (sub._id && c.parentId === sub._id))) ||
             (subTitle && c.parentName?.toLowerCase() === subTitle.toLowerCase()))
          )
        : [];

      const rawNiches = deduplicateCategories([...nestedNiches, ...flatNiches]);

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
  const subCategories: AdminCategory[] = deduplicateCategories(parentCategories.flatMap((p) => p.children || []));

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
