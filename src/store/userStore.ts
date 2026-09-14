import { create } from 'zustand';
import { User } from '@/types';

export interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User | null) => {
    if (typeof window !== "undefined") {
      if (user) {
        document.cookie = `isSeller=${user.isSeller ? "true" : "false"}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
        if (user.role) {
          document.cookie = `role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
        }
      } else {
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
