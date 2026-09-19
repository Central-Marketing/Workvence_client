import { create } from 'zustand';
import { User } from '@/types';

export interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      return JSON.parse(stored);
    }
    const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
    if (match && match[1]) {
      return JSON.parse(decodeURIComponent(match[1]));
    }
  } catch (err) {
    console.warn("Failed to parse initial user from storage:", err);
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  user: getInitialUser(),
  setUser: (user: User | null) => {
    if (typeof window !== "undefined") {
      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch {}
        document.cookie = `isSeller=${user.isSeller ? "true" : "false"}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
        if (user.role) {
          document.cookie = `role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
        }
        const userToken = (user as any)?.accessToken || (user as any)?.token;
        if (userToken) {
          document.cookie = `accessToken=${encodeURIComponent(userToken)}; path=/; max-age=2592000; SameSite=Lax`;
          try { localStorage.setItem("accessToken", userToken); } catch {}
          try { localStorage.setItem("token", userToken); } catch {}
        }
        const userRefreshToken = (user as any)?.refreshToken;
        if (userRefreshToken) {
          document.cookie = `refreshToken=${encodeURIComponent(userRefreshToken)}; path=/; max-age=2592000; SameSite=Lax`;
          try { localStorage.setItem("refreshToken", userRefreshToken); } catch {}
        }
      } else {
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        } catch {}
        document.cookie = `accessToken=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `refreshToken=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `isSeller=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `user=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `role=; path=/; max-age=0; SameSite=Lax`;
      }
    }
    set({ user });
  },
}));
