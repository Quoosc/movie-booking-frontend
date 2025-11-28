// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

import * as authApi from "@/api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getStoredUser());
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access_token") || ""
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refresh_token") || ""
  );
  const [loading, setLoading] = useState(false);

  function clearAuthState() {
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  // Nếu có token nhưng chưa có user, thử gọi /users/profile (me)
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!accessToken || user) return;

      try {
        const res = await authApi.me();
        if (!mounted) return;

        const profile = res?.data || res;
        if (profile) {
          setUser(profile);
        } else {
          clearAuthState();
        }
      } catch (err) {
        console.error("Auth /me failed:", err);
        if (mounted) {
          clearAuthState();
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [accessToken, user]);

  function persistTokensAndUser({ accessToken: at, refreshToken: rt, user }) {
    if (at) {
      setAccessToken(at);
      localStorage.setItem("access_token", at);
    } else {
      setAccessToken("");
      localStorage.removeItem("access_token");
    }

    if (rt) {
      setRefreshToken(rt);
      localStorage.setItem("refresh_token", rt);
    } else {
      setRefreshToken("");
      localStorage.removeItem("refresh_token");
    }

    if (user) {
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  async function handleLogin({ email, password }, rememberMe = false) {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const accessToken =
        res?.accessToken || res?.access_token || localStorage.getItem("access_token") || "";
      const refreshToken =
        res?.refreshToken || res?.refresh_token || localStorage.getItem("refresh_token") || "";
      const user = res?.user || authApi.getStoredUser();

      if (!accessToken) {
        throw new Error("Missing access token from login response");
      }

      // nếu không remember thì chỉ giữ trong state, không lưu refresh
      if (rememberMe) {
        persistTokensAndUser({ accessToken, refreshToken, user });
      } else {
        setAccessToken(accessToken);
        setRefreshToken("");
        setUser(user || null);
        localStorage.setItem("access_token", accessToken);
        localStorage.removeItem("refresh_token");
        if (user) localStorage.setItem("user", JSON.stringify(user));
      }

      return true;
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    return authApi.register({
      name: payload.name ?? payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || "",
    });
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuthState();
    }
  }

  const value = useMemo(() => {
    const role = user?.role || null;

    const isAuthenticated = !!user;
    const isGuest = !user;
    const isMember = role === "USER";
    const isAdmin = role === "ADMIN";

    return {
      // state
      user,
      currentUser: user, // alias cho mấy page cũ
      role,
      isAuthenticated,
      isGuest,
      isMember,
      isAdmin,
      loading,
      accessToken,
      refreshToken,

      // actions
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      setUser,
    };
  }, [user, loading, accessToken, refreshToken]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
