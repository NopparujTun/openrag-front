import { supabase } from "./supabase";

const getBaseUrl = () => {
  const rawBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return rawBase.replace(/\/+$/, "");
};

export const BASE_URL = getBaseUrl();

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || response.statusText);
  }

  return response.json();
}

export { supabase } from "./supabase";
