import { useParams, Navigate } from "react-router-dom";
import { useBots } from "@/store/bots";
import { PageHeader } from "@/components/shared/PageHeader";
import { CodeSnippet } from "@/components/shared/CodeSnippet";
import { MessageSquare, Bot, Loader2 } from "lucide-react";

export default function BotEmbed() {
  const { id } = useParams();
  const { getBot, isLoading } = useBots();
  const bot = id ? getBot(id) : undefined;
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const APP_URL = window.location.origin;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading embed codes...</p>
      </div>
    );
  }

  if (!bot) return <Navigate to="/bots" replace />;

  const scriptSnippet = `<script>
  (function(){
    var s=document.createElement('script');
    s.src='${API_URL}/bots/${bot.id}.js';
    s.async=true;
    document.head.appendChild(s);
  })();
</script>`;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${bot.name} - Embed`} description="Install your bot anywhere on the web." />
      
      {!bot.is_public && (
        <div className="mx-6 mt-4 rounded-lg border border-warning/50 bg-warning/5 p-4 text-warning-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            Bot is Private
          </div>
          <p className="mt-1 text-sm opacity-90">
            This bot is currently private. Embeds will not work until you make it public in 
            <a href={`/bots/${bot.id}/settings`} className="ml-1 underline underline-offset-2">Settings</a>.
          </p>
        </div>
      )}

      <div className="px-6 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium mb-4">Script tag</h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Paste this before your closing <code className="rounded bg-muted px-1">&lt;/body&gt;</code> tag.</p>
              <CodeSnippet code={scriptSnippet} language="html" />
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-medium">Live preview</h3>
            <p className="mt-1 text-xs text-muted-foreground">How it appears on your site.</p>
            <div className="mt-4 relative h-72 overflow-hidden rounded-md border bg-grid">
              <div className="absolute bottom-3 right-3 w-64 rounded-xl border bg-background shadow-lg">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">{bot.name}</div>
                    <div className="text-[10px] text-success">● Online</div>
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  <div className="max-w-[80%] rounded-2xl bg-muted px-3 py-1.5 text-xs">Hi! How can I help?</div>
                  <div className="ml-auto max-w-[80%] rounded-2xl bg-primary px-3 py-1.5 text-xs text-primary-foreground">Tell me about your pricing.</div>
                </div>
                <div className="border-t px-3 py-2 text-[10px] text-muted-foreground">Powered by YourBot</div>
              </div>
              <button className="absolute bottom-3 right-3 hidden h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
