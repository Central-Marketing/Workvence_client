import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types";

/**
 * The target backend endpoint for saving seller onboarding categories.
 * Backend supports PATCH /api/auth/me (or /api/users/profile).
 */
export const SELLER_ONBOARDING_PATCH_ENDPOINT = "/auth/me";

export interface SaveSellerCategoriesPayload {
  categories: string[];
  onboardingCompleted: boolean;
}

export async function saveSellerOnboardingCategories(
  categories: string[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  const payload: SaveSellerCategoriesPayload = {
    categories,
    onboardingCompleted: true,
  };

  try {
    let res;
    try {
      res = await axiosFetch.patch(SELLER_ONBOARDING_PATCH_ENDPOINT, payload);
    } catch (err: any) {
      // If /auth/me returns 404 or 405, fall back to /users/profile
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        res = await axiosFetch.patch("/users/profile", payload);
      } else {
        throw err;
      }
    }

    const responseData = res?.data;
    const currentUser = useUserStore.getState().user;

    // Update Zustand user store with verified data from backend response
    if (currentUser) {
      const backendUser = responseData?.user || (responseData?.username ? responseData : null);
      const updatedUser: User = {
        ...currentUser,
        ...(backendUser || {}),
        categories,
        onboardingCompleted: true,
      };
      useUserStore.getState().setUser(updatedUser);
    }

    return { success: true, data: responseData };
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || "Failed to save onboarding categories";
    console.error("Failed to save seller onboarding categories to backend:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
