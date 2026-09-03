const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://happy-moonstone.outray.app";

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("kureva_token") : null;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  let result;
  try {
    result = await response.json();
  } catch (err) {
    result = { success: false, error: { message: "Server returned invalid response" } };
  }

  if (!response.ok) {
    throw new Error(result.error?.message || response.statusText || "Request failed");
  }

  return result;
}
