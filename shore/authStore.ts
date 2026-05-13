import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  type AuthUser,
} from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  setSession: (user: AuthUser, token: string) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  fetchMe: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      initialized: false,

      setSession: (user: AuthUser, token: string) => {
        set({
          user,
          token,
          loading: false,
          initialized: true,
        });
      },

      login: async (email: string, password: string) => {
        set({ loading: true });
        const result = await loginUser({ email, password });

        if (!result.ok || !result.data) {
          set({ loading: false });
          return {
            ok: false,
            message: result.message || "Login failed.",
          };
        }

        set({
          user: result.data.user,
          token: result.data.token,
          loading: false,
          initialized: true,
        });

        return {
          ok: true,
          message: "Logged in successfully.",
        };
      },

      register: async (name: string, email: string, password: string) => {
        set({ loading: true });
        const result = await registerUser({ name, email, password });

        if (!result.ok || !result.data) {
          set({ loading: false });
          return {
            ok: false,
            message: result.message || "Registration failed.",
          };
        }

        set({
          user: result.data.user,
          token: result.data.token,
          loading: false,
          initialized: true,
        });

        return {
          ok: true,
          message: "Account created successfully.",
        };
      },

      fetchMe: async () => {
        const token = get().token;

        if (!token) {
          set({ initialized: true });
          return;
        }

        set({ loading: true });
        const result = await getCurrentUser(token);

        if (!result.ok || !result.user) {
          set({
            user: null,
            token: null,
            loading: false,
            initialized: true,
          });
          return;
        }

        set({
          user: result.user,
          loading: false,
          initialized: true,
        });
      },

      logout: () => {
        set({ user: null, token: null, initialized: true });
      },
    }),
    {
      name: "jochenna-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
