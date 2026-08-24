import { create } from 'zustand';

interface UserState {
  user: any;
  setUser: (user: any) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        document.cookie = `isSeller=${user.isSeller ? "true" : "false"}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
        if (user.role) {
          document.cookie = `role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
        }
      } else {
        document.cookie = `isSeller=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `user=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `role=; path=/; max-age=0; SameSite=Lax`;
      }
    }
    set({ user });
  },
}));
