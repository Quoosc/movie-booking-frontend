// src/utils/constants.js

// Nếu vẫn còn chỗ nào dùng, set false khi dùng BE thật
export const USE_MOCK_API = false;

// Bật khi backend đã có /auth/verify & /auth/resend-code
export const USE_EMAIL_VERIFY = false;

// Role đúng DB v2.4
export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  GUEST: "GUEST",
};
