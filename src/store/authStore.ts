import { create } from "zustand";
import { User } from "@/types/auth.types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: User, permissions: string[]) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const authStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  permissions: [],
  isAuthenticated: false,

  setAuth: (accessToken, user, permissions) => {
    set({
      accessToken,
      user,
      permissions,
      isAuthenticated: true,
    });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      permissions: [],
      isAuthenticated: false,
    });
  },
}));
