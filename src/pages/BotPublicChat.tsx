import { useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { BotPublic } from "@/types/api";

interface Msg { id: string; role: "user" | "assistant"; content: string; streaming?: boolean }

export default function BotPublicChat() {
  const { id } = useParams();
  const [bot, setBot] = useState<BotPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      api.bots.getPublic(id)
        .then(setBot)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bot || !bot.is_public) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <Bot className="h-10 w-10 text-muted-foreground mb-4" />
        <h1 className="text-lg font-semibold">Bot not available</h1>
        <p className="text-sm text-muted-foreground mt-1">This chatbot is either private or does not exist.</p>
      </div>
    );
  }

  const send = async () => {
    if (!input.trim() || isSending) return;
    
    const userMsg: Msg = { 
      id: Math.random().toString(36).slice(2), 
      role: "user", 
      content: input.trim() 
    };
    
    const assistantId = Math.random().toString(36).slice(2);
    setMessages((p) => [...p, userMsg, { id: assistantId, role: "assistant", content: "", streaming: true }]);
    setInput("");
    setIsSending(true);

    try {
      const history = messages
        .filter((m) => m.id !== "m0") // skip the initial greeting
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await api.chat.sendPublic(bot.id, userMsg.content, history);
      
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;
      let accumulatedContent = "";

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              let data;
              try {
                data = JSON.parse(line.slice(6));
              } catch (e) {
                continue;
              }
              if (data.error) throw new Error(data.error);
              
              if (data.token) {
                accumulatedContent += data.token;
                setMessages((p) => 
                  p.map((m) => (m.id === assistantId ? { ...m, content: accumulatedContent } : m))
                );
              }
              if (data.full_text) {
                setMessages((p) => 
                  p.map((m) => (m.id === assistantId ? { ...m, content: data.full_text, streaming: false } : m))
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((p) => 
        p.map((m) => (m.id === assistantId ? { ...m, content: "Sorry, I encountered an error. Please try again.", streaming: false } : m))
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">{bot.name}</div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
            >
              {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
            >
              {!m.content && m.streaming ? (
                <span className="inline-flex items-center gap-1 py-1">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: '0ms' }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: '150ms' }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: '300ms' }} />
                </span>
              ) : m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-card">
        <form 
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-primary/30"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder="Type a message..."
            className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isSending}
            className="text-primary disabled:opacity-30 hover:opacity-80 transition-opacity"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <div className="mt-2 text-center text-[10px] text-muted-foreground">
          Powered by YourBot
        </div>
      </div>
    </div>
  );
}
