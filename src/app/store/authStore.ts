import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  user: null,
  setToken: (token: string) =>
    set({
      accessToken: token,
      isAuthenticated: true,
    }),
  setUser: (user: any) => set({ user }),
  clearAuth: () =>
    set({
      accessToken: null,
      isAuthenticated: false,
      user: null,
    }),
}));
