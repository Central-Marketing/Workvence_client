import { axiosFetch } from "@/utils";
import { User } from "@/types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (momentListener?: (moment: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<{
          authorization: {
            code: string;
            id_token: string;
            state?: string;
          };
          user?: {
            name?: {
              firstName?: string;
              lastName?: string;
            };
            email?: string;
          };
        }>;
      };
    };
  }
}

export interface SocialAuthResponse {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  isVerified?: boolean;
  user: User;
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "1021646956156-mdh9qbtl2ib60hcss17bt49mit2j6o18.apps.googleusercontent.com";

const APPLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "com.sosmarketplace.web";

let googleScriptLoadingPromise: Promise<void> | null = null;
let appleScriptLoadingPromise: Promise<void> | null = null;

/**
 * Dynamically load Google Identity Services SDK
 */
export const loadGoogleSDK = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptLoadingPromise) {
    return googleScriptLoadingPromise;
  }

  googleScriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google SDK")));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleScriptLoadingPromise = null;
      reject(new Error("Failed to load Google SDK"));
    };
    document.head.appendChild(script);
  });

  return googleScriptLoadingPromise;
};

/**
 * Dynamically load Apple Sign In SDK
 */
export const loadAppleSDK = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.AppleID?.auth) {
    return Promise.resolve();
  }

  if (appleScriptLoadingPromise) {
    return appleScriptLoadingPromise;
  }

  appleScriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("apple-auth-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Apple SDK")));
      return;
    }

    const script = document.createElement("script");
    script.id = "apple-auth-script";
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/auth.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      appleScriptLoadingPromise = null;
      reject(new Error("Failed to load Apple SDK"));
    };
    document.head.appendChild(script);
  });

  return appleScriptLoadingPromise;
};

/**
 * Send Google ID Token to NestJS backend
 */
export const exchangeGoogleToken = async (idToken: string): Promise<SocialAuthResponse> => {
  const { data } = await axiosFetch.post<SocialAuthResponse>("/auth/google", {
    idToken,
  });
  return data;
};

/**
 * Send Apple ID Token to NestJS backend
 */
export const exchangeAppleToken = async (
  idToken: string,
  user?: { firstName?: string; lastName?: string }
): Promise<SocialAuthResponse> => {
  const payload: { idToken: string; user?: { firstName?: string; lastName?: string } } = {
    idToken,
  };

  if (user && (user.firstName || user.lastName)) {
    payload.user = {
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  const { data } = await axiosFetch.post<SocialAuthResponse>("/auth/apple", payload);
  return data;
};

/**
 * Initialize and trigger Apple Sign-in Popup
 */
export const signInWithApple = async (): Promise<SocialAuthResponse> => {
  await loadAppleSDK();

  if (!window.AppleID?.auth) {
    throw new Error("Apple Sign In SDK failed to initialize.");
  }

  const redirectURI =
    process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ||
    (typeof window !== "undefined" ? `${window.location.origin}/login` : "https://workvence.com/login");

  window.AppleID.auth.init({
    clientId: APPLE_CLIENT_ID,
    scope: "name email",
    redirectURI,
    usePopup: true,
  });

  const appleResponse = await window.AppleID.auth.signIn();
  const idToken = appleResponse.authorization.id_token;

  if (!idToken) {
    throw new Error("No ID Token received from Apple.");
  }

  const user = appleResponse.user?.name
    ? {
        firstName: appleResponse.user.name.firstName,
        lastName: appleResponse.user.name.lastName,
      }
    : undefined;

  return exchangeAppleToken(idToken, user);
};

export { GOOGLE_CLIENT_ID, APPLE_CLIENT_ID };
