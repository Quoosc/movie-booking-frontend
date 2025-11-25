// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { USE_MOCK_API } from "@/utils/constants";
import * as mockAuth from "@/api/mockAuthService";
import * as realAuth from "@/api/authService";

const svc = USE_MOCK_API ? mockAuth : realAuth;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access_token") || ""
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refresh_token") || ""
  );
  const [loading, setLoading] = useState(false);

  // Hàm dọn dẹp token + user (dùng chung cho /me fail + logout)
  function clearAuthState() {
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  // Nếu đã có accessToken (từ localStorage) thì lấy profile
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!accessToken) return;

      try {
        const res = await svc.me(accessToken);
        if (!mounted) return;

        if (res?.data) {
          setUser(res.data);
        } else {
          // Sai shape hoặc 401 → clear token
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
  }, [accessToken]);

  function persistTokens(at, rt, remember) {
    setAccessToken(at);
    setRefreshToken(rt);

    if (remember) {
      localStorage.setItem("access_token", at);
      localStorage.setItem("refresh_token", rt);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  async function handleLogin({ email, password }, rememberMe = false) {
    setLoading(true);
    try {
      // BE /auth/login hoặc mock
      const res = await svc.login({ email, password });
      const at = res?.access_token || "";
      const rt = res?.refresh_token || "";

      if (!at) {
        throw new Error("Missing access_token from login response");
      }

      persistTokens(at, rt, rememberMe);

      // Gọi /me bằng accessToken vừa nhận
      const profile = await svc.me(at);
      if (profile?.data) {
        setUser(profile.data);
      }

      return true;
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    // Map đúng spec: name/email/password/phone
    return svc.register({
      name: payload.name ?? payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || "",
    });
  }

  async function handleLogout() {
    try {
      if (accessToken) {
        await svc.logout(accessToken);
      }
    } catch (err) {
      console.error("Logout error:", err);
      // ignore error, vẫn clear local
    } finally {
      clearAuthState();
    }
  }

  const value = useMemo(() => {
    const role = user?.role || null;

    const isAuthenticated = !!user;
    const isGuest = !user; // guest thường = chưa login
    const isMember = role === "USER";
    const isAdmin = role === "ADMIN";

    return {
      // state
      user,
      currentUser: user, // alias cho các page đang dùng currentUser
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
