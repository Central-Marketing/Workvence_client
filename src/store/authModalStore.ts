import { create } from "zustand";

export interface OpenAuthModalOptions {
  mode?: "login" | "register";
  defaultIsSeller?: boolean;
  redirectUrl?: string;
  onSuccess?: (user?: any) => void;
}

export interface AuthModalState {
  isOpen: boolean;
  mode: "login" | "register";
  defaultIsSeller: boolean;
  redirectUrl?: string;
  onSuccessCallback?: (user?: any) => void;
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: "login",
  defaultIsSeller: false,
  redirectUrl: undefined,
  onSuccessCallback: undefined,
  openAuthModal: (options) =>
    set({
      isOpen: true,
      mode: options?.mode || "login",
      defaultIsSeller: options?.defaultIsSeller ?? false,
      redirectUrl: options?.redirectUrl,
      onSuccessCallback: options?.onSuccess,
    }),
  closeAuthModal: () =>
    set({
      isOpen: false,
      onSuccessCallback: undefined,
      redirectUrl: undefined,
    }),
}));
