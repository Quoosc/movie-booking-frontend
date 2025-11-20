import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { USE_MOCK_API } from "@/utils/constants";
import * as mockAuth from "@/api/mockAuthService";
import * as realAuth from "@/api/authService"; 

const svc = USE_MOCK_API ? mockAuth : realAuth;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access_token") || "");
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refresh_token") || "");
  const [loading, setLoading] = useState(false);

  // Nếu đã có token, lấy profile
  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      if (!accessToken) return;
      try {
        const res = await svc.me(accessToken);
        if (mounted && res?.data) setUser(res.data);
      } catch {
        handleLogout();
      }
    }
    fetchProfile();
    return () => (mounted = false);
  }, []);

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
      // === thay cho loginApi ===
      const res = await svc.login({ email, password });
      const at = res?.access_token || "";
      const rt = res?.refresh_token || "";
      persistTokens(at, rt, rememberMe);

      const profile = await svc.me(at);
      if (profile?.data) setUser(profile.data);
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    // Map đúng spec Excel: name/email/password/phone
    return svc.register({
      name: payload.name ?? payload.fullName, // hỗ trợ form cũ fullName
      email: payload.email,
      password: payload.password,
      phone: payload.phone || "",
    });
  }

  async function handleLogout() {
    try {
      if (accessToken) await svc.logout(accessToken);
    } catch {}
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      accessToken,
      refreshToken,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      setUser,
    }),
    [user, loading, accessToken, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
