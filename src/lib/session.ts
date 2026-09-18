export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
  role: "client" | "provider";
};

export function getToken() {
  return typeof window === "undefined"
    ? ""
    : localStorage.getItem("jobflat_token") || "";
}
export function saveSession(token: string, user: SessionUser) {
  localStorage.setItem("jobflat_token", token);
  localStorage.setItem("jobflat_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("jobflat_token");
  localStorage.removeItem("jobflat_user");
}
export async function api<T>(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Có lỗi xảy ra");
  return payload as T;
}
