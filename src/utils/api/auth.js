// src/utils/api/auth.js (giữ nguyên import như bạn đang dùng)
export { login as loginUser, registerUser } from '@/api/authService'

export async function verifyAccount({ email, codeId }){
  // return await apiFetch('/auth/verify', { method: 'POST', body: { email, codeId }})
  return new Promise((resolve)=> setTimeout(resolve, 600))
}
export async function resendCode({ email }){
  // return await apiFetch('/auth/resend-code', { method: 'POST', body: { email }})
  return new Promise((resolve)=> setTimeout(resolve, 600))
}
