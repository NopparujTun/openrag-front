import { BotOut, BotCreate, BotUpdate, DocumentOut } from "@/types/api";
import { supabase } from "./supabase";

const getBaseUrl = () => {
  const rawBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return rawBase.replace(/\/+$/, "");
};

const BASE_URL = getBaseUrl();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export const api = {
  bots: {
    list: () => request<BotOut[]>("/bots"),
    get: (id: string) => request<BotOut>(`/bots/${id}`),
    create: (data: BotCreate) =>
      request<BotOut>("/bots", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: BotUpdate) =>
      request<BotOut>(`/bots/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean; deleted: boolean }>(`/bots/${id}`, {
        method: "DELETE",
      }),
  },
  documents: {
    list: (botId: string) => request<DocumentOut[]>(`/bots/${botId}/documents`),
    upload: async (botId: string, file: File) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/bots/${botId}/documents`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(error.detail || response.statusText);
      }

      return response.json();
    },
    addText: (botId: string, filename: string, content: string) =>
      request<DocumentOut>(`/bots/${botId}/documents/text`, {
        method: "POST",
        body: JSON.stringify({ filename, content }),
      }),
    delete: (botId: string, docId: string) =>
      request<{ ok: boolean; deleted: boolean }>(`/bots/${botId}/documents/${docId}`, {
        method: "DELETE",
      }),
  },
  chat: {
    send: async (botId: string, message: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      return fetch(`${BASE_URL}/bots/${botId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      });
    },
    sendPublic: (botId: string, message: string) =>
      fetch(`${BASE_URL}/bots/${botId}/chat/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }),
  },
};
