import { ROLES } from "@/utils/constants";

// Giả lập user trong DB v2.0
const MOCK_USER = {
  user_id: "11111111-2222-3333-4444-555555555555",
  name: "Phạm Trấn Quốc",
  email: "23521309@gmail.com",
  role: ROLES.USER, // ADMIN | USER
};

function wait(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function register({ name, email, password, phone }) {
  await wait();
  // response Excel: chỉ cần code
  return { code: 201, message: "Registered (mock)" };
}

export async function login({ email, password }) {
  await wait();
  // mock: chỉ cần email bất kỳ và mật khẩu >= 6
  if (!email || !password || password.length < 6) {
    const err = new Error("Email/mật khẩu không hợp lệ");
    throw err;
  }
  // response Excel: { code, access_token, refresh_token }
  return {
    code: 200,
    access_token: "mock_access_token",
    refresh_token: "mock_refresh_token",
  };
}

export async function me(/* token */) {
  await wait(300);
  return {
    code: 200,
    data: MOCK_USER, // { user_id, name, email, role }
  };
}

export async function refreshToken() {
  await wait(200);
  return { code: 200, access_token: "mock_access_token_new", expires_in: 3600 };
}

export async function logout() {
  await wait(200);
  return { code: 200, message: "Logged out (mock)" };
}

// giữ API tương thích với VerifyModal nếu lỡ bật
export async function verifyAccount() { return { code: 200, message: "stub: ok" }; }
export async function resendCode()   { return { code: 200, message: "stub: ok" }; }
