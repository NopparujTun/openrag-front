export type DocStatus = "pending" | "processing" | "ready" | "failed";

export interface DocumentOut {
  id: string;
  bot_id: string;
  filename: string;
  status: DocStatus;
  created_at?: string;
  error_msg?: string;
}

export interface BotOut {
  id: string;
  user_id: string;
  name: string;
  instructions: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  document_count?: number;
}

export interface BotCreate {
  name: string;
}

export interface BotUpdate {
  name?: string;
  instructions?: string;
  is_public?: boolean;
}

export interface ChatIn {
  message: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
