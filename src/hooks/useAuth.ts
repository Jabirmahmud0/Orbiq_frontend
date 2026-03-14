import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/store/authStore";
import apiClient from "@/lib/api";
import { User } from "@/types/auth.types";

export const useAuth = () => {
  const router = useRouter();
  const { user, permissions, isAuthenticated, setAuth, clearAuth } = authStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      const { accessToken, user: userData } = response.data;
      const userPerms = userData.permissions || [];

      // Store in Zustand
      setAuth(accessToken, userData, userPerms);

      // Set cookie for middleware (short-lived)
      document.cookie = `obliq_access=${accessToken}; path=/; max-age=900; SameSite=Strict`;

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      document.cookie =
        "obliq_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/auth/me");
      const { permissions, ...userData } = response.data;

      // Get current access token from store
      const accessToken = authStore.getState().accessToken;

      if (accessToken) {
        setAuth(accessToken, userData as User, permissions || []);
      }
    } catch (err) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    permissions,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    loadUser,
  };
};
