"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/services/auth";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("token");
      
      if (token && !user) {
        try {
          const userData = await authApi.getCurrentUser();
          setAuth(userData, token);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setAuth, logout, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
