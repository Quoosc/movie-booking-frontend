// src/api/authService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

// MOCK user (phục vụ demo login)
const MOCK_USER = {
  user_id: "u1",
  name: "Demo User",
  email: "demo@cinestar.vn",
  role: "USER",
  avatar_url: null,
};

/**
 * LOGIN
 * frontend dùng: login({ email, password })
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    if (email === "demo@cinestar.vn" && password === "123456") {
      const tokens = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      };
      localStorage.setItem("access_token", tokens.accessToken);
      localStorage.setItem("refresh_token", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(MOCK_USER));
      return { user: MOCK_USER, ...tokens };
    }
    throw new Error("Sai email hoặc mật khẩu (mock)");
  }

  // Backend (gợi ý): POST /auth/login
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // expected: { accessToken, refreshToken, user }
  localStorage.setItem("access_token", res.accessToken);
  localStorage.setItem("refresh_token", res.refreshToken);
  localStorage.setItem("user", JSON.stringify(res.user));
  return res;
}

/**
 * REGISTER
 * frontend dùng: register({ name, email, password, ... })
 */
export async function register(payload) {
  if (USE_MOCK) {
    // chỉ giả lập thành công
    return { message: "Đăng ký mock thành công, hãy kiểm tra email (giả lập)" };
  }

  // Backend (gợi ý): POST /auth/register
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * VERIFY ACCOUNT (cho VerifyModal)
 * frontend dùng: verifyAccount({ email, codeId })
 */
export async function verifyAccount({ email, codeId }) {
  if (USE_MOCK) {
    // luôn coi như verify thành công
    return { message: "Xác minh mock thành công" };
  }

  // tuỳ API thật của bạn, ví dụ:
  // POST /auth/verify
  return apiFetch("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, code: codeId }),
  });
}

/**
 * RESEND VERIFY CODE (cho VerifyModal)
 * frontend dùng: resendCode({ email })
 */
export async function resendCode({ email }) {
  if (USE_MOCK) {
    // chỉ log + trả về ok
    console.info("Mock resend verify code to:", email);
    return { message: "Mã xác thực mock đã được gửi lại" };
  }

  // tuỳ API thật, ví dụ:
  // POST /auth/resend-code
  return apiFetch("/auth/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * LOGOUT
 */
export async function logout() {
  // clear local
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  if (!USE_MOCK) {
    try {
      // Backend (gợi ý): POST /auth/logout
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // bỏ qua lỗi logout
    }
  }
}

/**
 * REFRESH TOKEN
 */
export async function refreshToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken || USE_MOCK) return null;

  // Backend (gợi ý): POST /auth/refresh-token
  const res = await apiFetch("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  localStorage.setItem("access_token", res.accessToken);
  if (res.refreshToken) {
    localStorage.setItem("refresh_token", res.refreshToken);
  }

  return res.accessToken;
}
