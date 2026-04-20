import { PageHeader } from "@/components/shared/PageHeader";
import { BotCard } from "@/components/bot/BotCard";
import { CreateBotDialog } from "@/components/bot/CreateBotDialog";
import { useBots } from "@/store/bots";
import { Bot, MessageSquare, FileText, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { bots, isLoading } = useBots();
  
  const stats = [
    { label: "Total bots", value: isLoading ? "..." : bots.length.toString(), icon: Bot, hint: "Available bots" },
    { label: "Conversations", value: "0", icon: MessageSquare, hint: "Total messages" },
    { label: "Documents", value: isLoading ? "..." : bots.reduce((acc, b) => acc + (b.document_count ?? 0), 0).toString(), icon: FileText, hint: "Across all bots" },
    { label: "Avg. response", value: "1.2s", icon: TrendingUp, hint: "Historical data" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Welcome back"
        description="Build, train, and deploy AI chatbots in minutes."
        actions={<CreateBotDialog />}
      />
      <div className="px-6 py-6 space-y-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Recent bots</h2>
              <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
            </div>
            <Link to="/bots" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading recent bots...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bots.slice(0, 3).map((b) => (
                <BotCard key={b.id} bot={b} />
              ))}
              <CreateBotDialog
                trigger={
                  <button className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border bg-background">+</div>
                    Create new bot
                  </button>
                }
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
