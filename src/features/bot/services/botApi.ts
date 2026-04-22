import { request, BASE_URL, supabase } from "@/api";
import { BotOut, BotCreate, BotUpdate, DocumentOut, BotPublic } from "../types/api";

export const botApi = {
  bots: {
    list: () => request<BotOut[]>("/bots"),
    get: (id: string) => request<BotOut>(`/bots/${id}`),
    getPublic: (id: string) => request<BotPublic>(`/bots/${id}/public`, { headers: { "Authorization": "" } }),
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
    send: async (botId: string, message: string, history: { role: string; content: string }[] = []) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${BASE_URL}/bots/${botId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Chat request failed" }));
        throw new Error(error.detail || response.statusText);
      }

      return response;
    },
    sendPublic: async (botId: string, message: string, history: { role: string; content: string }[] = []) => {
      const response = await fetch(`${BASE_URL}/bots/${botId}/chat/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Chat request failed" }));
        throw new Error(error.detail || response.statusText);
      }

      return response;
    },
  },
};
