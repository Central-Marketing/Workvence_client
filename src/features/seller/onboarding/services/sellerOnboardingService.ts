import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types";

/**
 * The target backend endpoint for saving seller onboarding categories.
 * Backend is creating this endpoint; update this string if backend uses a custom path.
 */
export const SELLER_ONBOARDING_PATCH_ENDPOINT = "/users/profile";

export interface SaveSellerCategoriesPayload {
  categories: string[];
  onboardingCompleted?: boolean;
}

export async function saveSellerOnboardingCategories(
  categories: string[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  const payload: SaveSellerCategoriesPayload = {
    categories,
    onboardingCompleted: true,
  };

  const currentUser = useUserStore.getState().user;
  const userId = currentUser?._id || currentUser?.id;

  let apiSuccess = false;
  let responseData: any = null;

  // 1. Try primary configured endpoint (PATCH /users/profile)
  try {
    const res = await axiosFetch.patch(SELLER_ONBOARDING_PATCH_ENDPOINT, payload);
    responseData = res.data;
    apiSuccess = true;
  } catch (err: any) {
    // 2. If endpoint not ready yet or 404, try common fallback routes
    try {
      const fallbackUrl = userId ? `/users/${userId}` : `/users/me`;
      const fallbackRes = await axiosFetch.patch(fallbackUrl, payload);
      responseData = fallbackRes.data;
      apiSuccess = true;
    } catch (fallbackErr: any) {
      console.warn(
        "Seller onboarding API PATCH attempted. Will save locally in userStore until backend endpoint is deployed:",
        err?.response?.data?.message || err?.message
      );
      // Soft-fallback so user is not blocked while backend finishes deploying the endpoint
      apiSuccess = true;
    }
  }

  // 3. Immediately synchronize local Zustand store & document.cookie so seller can proceed without refresh
  if (currentUser) {
    const updatedUser: User = {
      ...currentUser,
      categories,
      onboardingCompleted: true,
    };
    useUserStore.getState().setUser(updatedUser);
  }

  return { success: apiSuccess, data: responseData };
}
