const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export async function api(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  // Attach auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  // Auto-logout on 401 Unauthorized
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "/";
  }

  return res;
}
