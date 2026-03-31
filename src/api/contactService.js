import { apiFetch } from "./fetchConfig";

export async function submitContactForm(payload) {
  const res = await apiFetch("/contact/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res?.data || res;
}
