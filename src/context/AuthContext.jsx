// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "@/api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getStoredUser());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Lấy profile khi load app (dựa trên cookie accessToken)
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const u = await authApi.me();
        if (mounted) setUser(u);
      } catch (err) {
        console.error("Fetch profile error:", err);
        if (mounted) setUser(null);
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
      await authApi.login({ email, password }); // set cookie
      const profile = await authApi.me();       // lấy profile
      setUser(profile);

      // hiện tại cookie lo hết, rememberMe nếu muốn thì sau này ta tự xử lý thêm
      return true;
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
    } finally {
      setUser(null);
    }
  }

  const value = useMemo(() => {
    const role = user?.role || user?.userRole || null;

    return {
      user,
      currentUser: user,
      role,
      isAuthenticated: !!user,
      isGuest: !user,
      isMember: role === "USER",
      isAdmin: role === "ADMIN",

      loading: loading || initializing,

      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      setUser,
    };
  }, [user, loading, initializing]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
