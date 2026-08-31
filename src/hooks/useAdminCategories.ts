import { useQuery } from "@tanstack/react-query";
import adminAxios from "@/utils/adminAxios";

export const ADMIN_CATEGORIES_QUERY_KEY = ["admin-categories"] as const;

export const fetchAdminCategories = async () => {
  const { data } = await adminAxios.get("/categories");
  return data;
};

export const extractCategoriesList = (fetchedData: any): any[] => {
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

  const categoryList = extractCategoriesList(query.data);

  return {
    ...query,
    data: query.data ?? [],
    categoryList,
  };
};

export default useAdminCategories;
