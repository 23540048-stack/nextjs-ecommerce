import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

// ==========================================
// CUSTOMER AUTH
// ==========================================

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setAuth: (user: User) => {
        set({
          user,
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
        });
      },

      logout: () => {
        set({
          user: null,
        });
      },
    }),
    {
      name: "user-auth-storage",
    },
  ),
);

// ==========================================
// ADMIN AUTH
// ==========================================

interface AdminAuthState {
  user: User | null;

  setAuth: (user: User) => void;
  setUser: (user: User | null) => void;

  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,

      setAuth: (user: User) => {
        set({
          user,
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
        });
      },

      logout: () => {
        set({
          user: null,
        });
      },
    }),
    {
      name: "admin-auth-storage",
    },
  ),
);
