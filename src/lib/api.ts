const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export function api(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  // Attach auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
