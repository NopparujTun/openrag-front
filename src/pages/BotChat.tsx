import { useParams, Navigate } from "react-router-dom";
import { useBots } from "@/store/bots";
import { PageHeader } from "@/components/PageHeader";
import { useRef, useState, useEffect } from "react";
import { Send, Bot, User, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Msg { id: string; role: "user" | "assistant"; content: string; streaming?: boolean }

export default function BotChat() {
  const { id } = useParams();
  const { getBot, isLoading: botsLoading } = useBots();
  const bot = id ? getBot(id) : undefined;
  
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "assistant", content: "Hi! I'm ready to help. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (botsLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!bot) return <Navigate to="/bots" replace />;

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
      const response = await api.chat.send(bot.id, userMsg.content);
      
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
              try {
                const data = JSON.parse(line.slice(6));
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
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
      
      setMessages((p) => 
        p.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
    } catch (error: any) {
      toast.error(`Failed to send message: ${error.message}`);
      setMessages((p) => p.filter((m) => m.id !== assistantId));
    } finally {
      setIsSending(false);
    }
  };

  const reset = () =>
    setMessages([{ id: "m0", role: "assistant", content: "Hi! I'm ready to help. What would you like to know?" }]);

  return (
    <div className="animate-fade-in flex h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        title={`${bot.name} - Chat Preview`}
        description="Test your bot in real time."
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Context panel */}
        <aside className="hidden w-72 flex-col border-r bg-muted/20 p-5 lg:flex">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Context</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium text-primary">Live</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Knowledge</div>
              <div className="font-medium">{bot.document_count ?? 0} documents</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Instructions</div>
              <div className="rounded-md border bg-background p-2 text-xs text-foreground line-clamp-[12]">
                {bot.instructions || <span className="text-muted-foreground">No instructions configured.</span>}
              </div>
            </div>
          </div>
        </aside>

        {/* Chat */}
        <div className="flex flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground shadow-sm",
                    )}
                  >
                    {!m.content && m.streaming ? (
                      <span className="inline-flex items-center gap-1 py-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '300ms' }} />
                      </span>
                    ) : (
                      <>
                        {m.content}
                        {m.streaming && <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-current opacity-50" />}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t bg-background p-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border bg-background p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                disabled={isSending}
                placeholder={isSending ? "Waiting for response..." : "Ask your bot something..."}
                className="min-h-[36px] max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button size="icon" onClick={send} disabled={!input.trim() || isSending}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
