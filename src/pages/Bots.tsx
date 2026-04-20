import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BotCard } from "@/components/BotCard";
import { CreateBotDialog } from "@/components/CreateBotDialog";
import { useBots } from "@/store/bots";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Bot } from "lucide-react";

export default function Bots() {
  const { bots, isLoading } = useBots();
  const [q, setQ] = useState("");
  const filtered = bots.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bots"
        description="All bots in this workspace."
        actions={<CreateBotDialog />}
      />
      <div className="px-6 py-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bots..." className="pl-9" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading bots...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bot className="h-5 w-5" />}
            title="No bots found"
            description="Try a different search, or create your first bot."
            action={<CreateBotDialog />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BotCard key={b.id} bot={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
