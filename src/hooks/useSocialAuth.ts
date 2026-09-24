"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types";
import {
  loadGoogleSDK,
  loadAppleSDK,
  exchangeGoogleToken,
  signInWithApple,
  SocialAuthResponse,
  GOOGLE_CLIENT_ID,
} from "@/services/socialAuth";

export interface SocialAuthOptions {
  onSuccess?: (user: User) => void;
  redirectUrl?: string;
  isSeller?: boolean;
}

export function useSocialAuth() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-load SDKs in background on mount
  useEffect(() => {
    loadGoogleSDK().catch(() => {});
    loadAppleSDK().catch(() => {});
  }, []);

  const handleError = useCallback((err: any) => {
    const errorMsg =
      err.response?.data?.message ||
      err.message ||
      "Social login failed. Please try again.";

    // Skip harsh toast if user merely closed popup
    const isCancelled =
      errorMsg.includes("user_cancelled") ||
      errorMsg.includes("popup_closed_by_user") ||
      errorMsg.includes("closed") ||
      errorMsg.includes("dismissed");

    if (!isCancelled) {
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, []);

  const handleSuccess = useCallback(
    (data: SocialAuthResponse, options?: SocialAuthOptions) => {
      const user = data.user;
      if (!user) {
        toast.error("Authentication succeeded but no user data returned.");
        return;
      }

      // Clear temporary KYC dismissal state
      const userKey = user.id || user._id || user.username || "default";
      sessionStorage.removeItem(`kyc_prompt_dismissed_${userKey}`);
      sessionStorage.removeItem("kyc_prompt_dismissed_session");

      const token = data.accessToken || (user as any).accessToken || (user as any).token;
      const refreshToken = data.refreshToken || (user as any).refreshToken;
      const combinedUser: User = {
        ...user,
        ...(token ? { accessToken: token, token } : {}),
        ...(refreshToken ? { refreshToken } : {}),
      };

      setUser(combinedUser);

      toast.success(`Welcome, ${user.name || user.username || "user"}!`);

      if (options?.onSuccess) {
        options.onSuccess(combinedUser);
        return;
      }

      // Safe redirect navigation
      const rawRedirect = options?.redirectUrl || searchParams?.get("redirect");
      let target = rawRedirect;
      if (target) {
        try {
          target = decodeURIComponent(target);
        } catch {}
        if (target.includes("%")) {
          try {
            target = decodeURIComponent(target);
          } catch {}
        }
      }

      const safeTarget =
        target &&
        target.startsWith("/") &&
        !target.startsWith("/login") &&
        !target.startsWith("/register")
          ? target
          : user.isSeller
          ? "/dashboard/seller"
          : "/dashboard/buyer";

      window.location.href = safeTarget;
    },
    [setUser, searchParams]
  );

  const renderGoogleButton = useCallback(
    (container: HTMLElement | null, options?: SocialAuthOptions) => {
      if (!container || typeof window === "undefined") return;

      loadGoogleSDK().then(() => {
        if (!window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) {
              toast.error("Google authentication failed. No token received.");
              return;
            }
            try {
              setLoadingProvider("google");
              const data = await exchangeGoogleToken(response.credential);
              handleSuccess(data, options);
            } catch (err) {
              handleError(err);
            } finally {
              setLoadingProvider(null);
            }
          },
          cancel_on_tap_outside: true,
        });

        // Clear existing children to avoid duplicate buttons
        container.innerHTML = "";
        window.google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 320,
        });
      });
    },
    [handleSuccess, handleError]
  );

  const handleGoogleLogin = useCallback(
    async (options?: SocialAuthOptions) => {
      if (loadingProvider) return;
      setError(null);
      setLoadingProvider("google");

      try {
        await loadGoogleSDK();

        if (!window.google?.accounts?.id) {
          throw new Error("Google Identity Services failed to load.");
        }

        let isCompleted = false;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential?: string }) => {
            if (isCompleted) return;
            isCompleted = true;

            if (!response?.credential) {
              setLoadingProvider(null);
              toast.error("Google authentication failed. No token received.");
              return;
            }

            try {
              const data = await exchangeGoogleToken(response.credential);
              handleSuccess(data, options);
            } catch (err) {
              handleError(err);
            } finally {
              setLoadingProvider(null);
            }
          },
          cancel_on_tap_outside: true,
        });

        // Trigger Google One-Tap / Accounts Prompt
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap was skipped or suppressed, search for hidden GSI trigger if rendered
            const hiddenButton = document.getElementById("g_id_signin_hidden")?.querySelector("div[role=button]") as HTMLElement;
            if (hiddenButton) {
              hiddenButton.click();
            } else {
              setLoadingProvider(null);
            }
          }
        });
      } catch (err) {
        handleError(err);
        setLoadingProvider(null);
      }
    },
    [loadingProvider, handleSuccess, handleError]
  );

  const handleAppleLogin = useCallback(
    async (options?: SocialAuthOptions) => {
      if (loadingProvider) return;
      setError(null);
      setLoadingProvider("apple");

      try {
        const data = await signInWithApple();
        handleSuccess(data, options);
      } catch (err: any) {
        handleError(err);
      } finally {
        setLoadingProvider(null);
      }
    },
    [loadingProvider, handleSuccess, handleError]
  );

  return {
    loadingProvider,
    error,
    handleGoogleLogin,
    handleAppleLogin,
    renderGoogleButton,
  };
}
