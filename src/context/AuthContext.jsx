// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "@/api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return authApi.getStoredUser?.() ?? null;
    } catch (e) {
      console.error("getStoredUser error:", e);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const profile = await authApi.me();
        if (!mounted) return;

        setUser(profile);

        try {
          authApi.setStoredUser?.(profile);
        } catch (e) {
          console.error("setStoredUser error:", e);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        if (!mounted) return;

        setUser(null);
        try {
          authApi.clearStoredUser?.();
        } catch (e) {
          console.error("clearStoredUser on fetchProfile error:", e);
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin({ email, password }, rememberMe = false) {
    setLoading(true);
    try {
      await authApi.login({ email, password });
      const profile = await authApi.me();
      setUser(profile);

      try {
        authApi.setStoredUser?.(profile);
      } catch (e) {
        console.error("setStoredUser on login error:", e);
      }

      return profile;
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    return authApi.register({
      fullName: payload.fullName ?? payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      try {
        authApi.clearStoredUser?.();

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("auth");
        }
      } catch (e) {
        console.error("Clear storage on logout error:", e);
      }

      setUser(null);
    }
  }

  const value = useMemo(() => {
    const role = user?.role || user?.userRole || null;

    const isAuthenticated = !!user;
    const isAdmin = role === "ADMIN";
    const isMember = isAuthenticated && !isAdmin;

    return {
      user,
      currentUser: user,
      role,

      isAuthenticated,
      isGuest: !isAuthenticated,
      isMember,
      isAdmin,

      loading: loading || initializing,

      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      setUser,
    };
  }, [user, loading, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
