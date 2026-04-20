import { useParams, Navigate } from "react-router-dom";
import { useBots } from "@/store/bots";
import { PageHeader } from "@/components/PageHeader";
import { CodeSnippet } from "@/components/CodeSnippet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const iframeSnippet = `<iframe
  src="${APP_URL}/bots/${bot.id}/chat/public"
  width="380"
  height="600"
  style="border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.08)"
  allow="microphone"
></iframe>`;

  const apiSnippet = `curl ${API_URL}/bots/${bot.id}/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Hello!"}'`;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${bot.name} - Embed`} description="Install your bot anywhere on the web." />
      <div className="px-6 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="script" className="w-full">
            <TabsList>
              <TabsTrigger value="script">Script tag</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            <TabsContent value="script" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">Paste this before your closing <code className="rounded bg-muted px-1">&lt;/body&gt;</code> tag.</p>
              <CodeSnippet code={scriptSnippet} language="html" />
            </TabsContent>
            <TabsContent value="iframe" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">Drop this iframe anywhere in your HTML.</p>
              <CodeSnippet code={iframeSnippet} language="html" />
            </TabsContent>
            <TabsContent value="api" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">Hit the chat endpoint directly.</p>
              <CodeSnippet code={apiSnippet} language="bash" />
            </TabsContent>
          </Tabs>
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
                    <div className="text-[10px] text-green-500">● Online</div>
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
