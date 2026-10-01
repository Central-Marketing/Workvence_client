import { create } from "zustand";

export type AuthModalMode = "login" | "register" | "forgot" | "reset" | "verify";

export interface OpenAuthModalOptions {
  mode?: AuthModalMode;
  email?: string;
  defaultIsSeller?: boolean;
  redirectUrl?: string;
  onSuccess?: (user?: any) => void;
}

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  email?: string;
  defaultIsSeller: boolean;
  redirectUrl?: string;
  onSuccessCallback?: (user?: any) => void;
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthModalMode) => void;
  setEmail: (email: string) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: "login",
  email: undefined,
  defaultIsSeller: false,
  redirectUrl: undefined,
  onSuccessCallback: undefined,
  openAuthModal: (options) =>
    set({
      isOpen: true,
      mode: options?.mode || "login",
      email: options?.email,
      defaultIsSeller: options?.defaultIsSeller ?? false,
      redirectUrl: options?.redirectUrl,
      onSuccessCallback: options?.onSuccess,
    }),
  closeAuthModal: () =>
    set({
      isOpen: false,
      email: undefined,
      onSuccessCallback: undefined,
      redirectUrl: undefined,
    }),
  setMode: (mode) => set({ mode }),
  setEmail: (email) => set({ email }),
}));

