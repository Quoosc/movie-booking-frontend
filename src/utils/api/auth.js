
import {
  login,
  register,
  verifyAccount as verifyAccountApi,
  resendCode as resendCodeApi,
} from "@/api/authService";

// Giữ đúng tên cũ để VerifyModal / các chỗ khác không bị lỗi
export const loginUser = login;
export const registerUser = register;

export async function verifyAccount({ email, codeId }) {
  return await verifyAccountApi({ email, codeId });
}

export async function resendCode({ email }) {
  return await resendCodeApi({ email });
}
